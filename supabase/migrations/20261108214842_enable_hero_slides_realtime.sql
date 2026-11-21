-- Publish public hero slide changes to Supabase Realtime.
-- The public website caches only active hero slide rows; private/admin data is
-- never added to the browser cache by this migration.
DO $$
BEGIN
  IF to_regclass('public.hero_slides') IS NULL THEN
    RAISE EXCEPTION 'public.hero_slides does not exist; refusing to publish a missing table';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'hero_slides'
      AND c.relrowsecurity = TRUE
  ) THEN
    RAISE EXCEPTION 'RLS must be enabled on public.hero_slides before Realtime publication';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = 'hero_slides'
      AND p.cmd IN ('SELECT', 'ALL')
      AND (
        'public' = ANY (p.roles)
        OR 'anon' = ANY (p.roles)
        OR 'authenticated' = ANY (p.roles)
      )
  ) THEN
    RAISE EXCEPTION 'A public-readable SELECT policy is required before publishing hero_slides';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'hero_slides'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hero_slides;
  END IF;
END
$$;
