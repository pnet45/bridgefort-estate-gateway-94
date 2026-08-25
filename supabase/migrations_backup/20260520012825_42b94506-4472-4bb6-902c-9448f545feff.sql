
-- ============ STORAGE RLS for media-files (user-folder restricted) ============
-- Drop any prior loose policies on this bucket created by older code
DROP POLICY IF EXISTS "media_files_user_insert" ON storage.objects;
DROP POLICY IF EXISTS "media_files_user_update" ON storage.objects;
DROP POLICY IF EXISTS "media_files_user_delete" ON storage.objects;
DROP POLICY IF EXISTS "media_files_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "media_files_public_select" ON storage.objects;

-- Public can read (bucket is public; published listings need image URLs to render)
CREATE POLICY "media_files_public_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-files');

-- Authenticated users can upload only into their own {user_id}/... folder
CREATE POLICY "media_files_user_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media-files'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "media_files_user_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media-files'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "media_files_user_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media-files'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- ============ USER NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info | success | warning | error
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user
  ON public.user_notifications (user_id, created_at DESC);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_notifications"
ON public.user_notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users_update_own_notifications"
ON public.user_notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_notifications"
ON public.user_notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "admins_insert_notifications"
ON public.user_notifications FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- ============ TRIGGER: notify owner on listing moderation change ============
CREATE OR REPLACE FUNCTION public.notify_listing_moderation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND NEW.moderation_status IS DISTINCT FROM OLD.moderation_status
     AND NEW.moderation_status IN ('approved', 'rejected') THEN

    INSERT INTO public.user_notifications (user_id, title, message, type, link)
    VALUES (
      NEW.created_by,
      CASE WHEN NEW.moderation_status = 'approved'
           THEN 'Listing approved 🎉'
           ELSE 'Listing rejected' END,
      CASE WHEN NEW.moderation_status = 'approved'
           THEN 'Your listing "' || NEW.title || '" is now live on Listings.'
           ELSE 'Your listing "' || NEW.title || '" was rejected'
                || COALESCE('. Reason: ' || NEW.rejection_reason, '.') END,
      CASE WHEN NEW.moderation_status = 'approved' THEN 'success' ELSE 'error' END,
      '/listings/my'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_listing_moderation_change ON public.listings;
CREATE TRIGGER trg_notify_listing_moderation_change
AFTER UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.notify_listing_moderation_change();
