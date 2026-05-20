-- 1) Move owner PII off listings into a separate, access-controlled table
CREATE TABLE IF NOT EXISTS public.listing_contacts (
  listing_id uuid PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  owner_name text,
  owner_phone text,
  owner_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Backfill from listings if columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='listings' AND column_name='owner_email'
  ) THEN
    INSERT INTO public.listing_contacts (listing_id, owner_name, owner_phone, owner_email)
    SELECT id, owner_name, owner_phone, owner_email
      FROM public.listings
    ON CONFLICT (listing_id) DO NOTHING;

    ALTER TABLE public.listings DROP COLUMN IF EXISTS owner_name;
    ALTER TABLE public.listings DROP COLUMN IF EXISTS owner_phone;
    ALTER TABLE public.listings DROP COLUMN IF EXISTS owner_email;
  END IF;
END$$;

ALTER TABLE public.listing_contacts ENABLE ROW LEVEL SECURITY;

-- Owner can manage their listing's contact row
CREATE POLICY "Owner can view own listing contact"
  ON public.listing_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.listings l
            WHERE l.id = listing_contacts.listing_id AND l.created_by = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.listings l
               WHERE l.id = listing_contacts.listing_id AND l.is_published = true)
  );

CREATE POLICY "Owner can insert own listing contact"
  ON public.listing_contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.listings l
            WHERE l.id = listing_contacts.listing_id AND l.created_by = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Owner can update own listing contact"
  ON public.listing_contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.listings l
            WHERE l.id = listing_contacts.listing_id AND l.created_by = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Owner can delete own listing contact"
  ON public.listing_contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.listings l
            WHERE l.id = listing_contacts.listing_id AND l.created_by = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

REVOKE ALL ON public.listing_contacts FROM anon;

-- 2) Lock down the `public` storage bucket from anon uploads
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname IN ('Allow Upload','Public bucket insert','Anyone can upload to public')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END$$;

CREATE POLICY "Authenticated upload to public bucket (own folder)"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated update own files in public bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated delete own files in public bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );