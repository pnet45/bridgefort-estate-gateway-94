-- Publish public login carousel and BHRealtors package updates.
-- Both datasets are intentionally public-readable and contain no user-specific
-- wallet, referral, sales, payment or profile information.
DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY['auth_carousel_slides', 'mlm_packages']
  LOOP
    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
      RAISE EXCEPTION 'public.% does not exist; refusing to publish a missing table', target_table;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = target_table
        AND c.relrowsecurity = TRUE
    ) THEN
      RAISE EXCEPTION 'RLS must be enabled on public.% before Realtime publication', target_table;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies p
      WHERE p.schemaname = 'public'
        AND p.tablename = target_table
        AND p.cmd IN ('SELECT', 'ALL')
        AND (
          'public' = ANY (p.roles)
          OR 'anon' = ANY (p.roles)
        )
    ) THEN
      RAISE EXCEPTION 'A public-readable SELECT policy is required before publishing public.%', target_table;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = target_table
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', target_table);
    END IF;
  END LOOP;
END
$$;
