-- =========================
-- Gallery media items (idempotent)
-- =========================

-- 1) Table (idempotent)
CREATE TABLE IF NOT EXISTS public.gallery_media_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  poster_url TEXT,
  caption TEXT,
  event_description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- If the table already existed, ensure the id default + pk are correct (safe-ish)
ALTER TABLE public.gallery_media_items
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2) Grants (idempotent in practice)
GRANT SELECT ON public.gallery_media_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_media_items TO authenticated;
GRANT ALL ON public.gallery_media_items TO service_role;

-- 3) Enable RLS (only if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'gallery_media_items'
      AND c.relrowsecurity = true
  ) THEN
    EXECUTE 'ALTER TABLE public.gallery_media_items ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- 4) Policies (idempotent via pg_policies check)
DO $$
BEGIN
  -- Policy: Anyone can view published gallery media
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gallery_media_items'
      AND policyname = 'Anyone can view published gallery media'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Anyone can view published gallery media"
        ON public.gallery_media_items FOR SELECT
        USING (is_published = true);
    $p$;
  END IF;

  -- Policy: Admins can view all gallery media
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gallery_media_items'
      AND policyname = 'Admins can view all gallery media'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can view all gallery media"
        ON public.gallery_media_items FOR SELECT TO authenticated
        USING (public.has_role(auth.uid(), 'admin'));
    $p$;
  END IF;

  -- Policy: Admins can insert gallery media
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gallery_media_items'
      AND policyname = 'Admins can insert gallery media'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can insert gallery media"
        ON public.gallery_media_items FOR INSERT TO authenticated
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    $p$;
  END IF;

  -- Policy: Admins can update gallery media
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gallery_media_items'
      AND policyname = 'Admins can update gallery media'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can update gallery media"
        ON public.gallery_media_items FOR UPDATE TO authenticated
        USING (public.has_role(auth.uid(), 'admin'))
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    $p$;
  END IF;

  -- Policy: Admins can delete gallery media
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gallery_media_items'
      AND policyname = 'Admins can delete gallery media'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can delete gallery media"
        ON public.gallery_media_items FOR DELETE TO authenticated
        USING (public.has_role(auth.uid(), 'admin'));
    $p$;
  END IF;
END $$;

-- 5) Index (idempotent)
CREATE INDEX IF NOT EXISTS idx_gallery_media_items_published
  ON public.gallery_media_items (is_published, display_order);

-- 6) Trigger (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'gallery_media_items'
      AND t.tgname = 'trg_gallery_media_items_updated_at'
      AND NOT t.tgisinternal
  ) THEN
    EXECUTE $p$
      CREATE TRIGGER trg_gallery_media_items_updated_at
        BEFORE UPDATE ON public.gallery_media_items
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    $p$;
  END IF;
END $$;