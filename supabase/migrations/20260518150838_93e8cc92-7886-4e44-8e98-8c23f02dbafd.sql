
-- Add moderation columns to listings
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();

-- Default new listings to unpublished (pending admin approval)
ALTER TABLE public.listings ALTER COLUMN is_published SET DEFAULT false;

-- Trigger to force pending state for non-admin user submissions
CREATE OR REPLACE FUNCTION public.enforce_listing_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always stamp created_by from auth.uid() if missing
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;

  -- If submitter is NOT an admin, force pending + unpublished
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.is_published := false;
    NEW.moderation_status := 'pending';
    NEW.rejection_reason := NULL;
    NEW.is_featured := false;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_enforce_moderation_ins ON public.listings;
CREATE TRIGGER listings_enforce_moderation_ins
BEFORE INSERT ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_moderation();

-- On UPDATE: if non-admin edits their own listing, reset to pending
CREATE OR REPLACE FUNCTION public.reset_listing_on_user_edit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.is_published := false;
    NEW.moderation_status := 'pending';
    NEW.rejection_reason := NULL;
    NEW.is_featured := false;
    NEW.created_by := OLD.created_by; -- can't reassign ownership
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_enforce_moderation_upd ON public.listings;
CREATE TRIGGER listings_enforce_moderation_upd
BEFORE UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.reset_listing_on_user_edit();

-- RLS policies for user-owned CRUD
DROP POLICY IF EXISTS "Users can insert their own listings" ON public.listings;
CREATE POLICY "Users can insert their own listings"
ON public.listings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can view their own listings" ON public.listings;
CREATE POLICY "Users can view their own listings"
ON public.listings FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
CREATE POLICY "Users can update their own listings"
ON public.listings FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;
CREATE POLICY "Users can delete their own listings"
ON public.listings FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_listings_created_by ON public.listings(created_by);
CREATE INDEX IF NOT EXISTS idx_listings_moderation_status ON public.listings(moderation_status);
