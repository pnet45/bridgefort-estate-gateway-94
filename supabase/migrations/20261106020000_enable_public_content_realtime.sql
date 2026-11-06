-- Publish only public-facing content tables that have RLS and a public
-- SELECT policy, so their existing row-level rules continue to govern
-- which realtime records each client is allowed to receive.
DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY['content_items', 'listings', 'posts']
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = target_table
        AND c.relkind IN ('r', 'p')
        AND c.relrowsecurity
    ) THEN
      RAISE EXCEPTION 'Refusing to publish public.%; table is missing or RLS is disabled', target_table;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies p
      WHERE p.schemaname = 'public'
        AND p.tablename = target_table
        AND p.cmd IN ('SELECT', 'ALL')
        AND 'public' = ANY (p.roles::text[])
    ) THEN
      RAISE EXCEPTION 'Refusing to publish public.%; no public SELECT policy exists', target_table;
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
