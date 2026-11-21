-- Forward-only completion of the earlier partial auth/MLM Realtime publication.
-- mlm_packages is already published in production; only auth_carousel_slides is missing.
DO $$
BEGIN
  IF to_regclass('public.auth_carousel_slides') IS NULL THEN
    RAISE EXCEPTION 'public.auth_carousel_slides does not exist; refusing Realtime publication';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'auth_carousel_slides'
      AND c.relrowsecurity = TRUE
  ) THEN
    RAISE EXCEPTION 'RLS must be enabled on public.auth_carousel_slides before Realtime publication';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = 'auth_carousel_slides'
      AND p.cmd IN ('SELECT', 'ALL')
      AND ('public' = ANY(p.roles) OR 'anon' = ANY(p.roles))
  ) THEN
    RAISE EXCEPTION 'A public-readable SELECT policy is required before publishing auth_carousel_slides';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'auth_carousel_slides'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_carousel_slides;
  END IF;
END
$$;
