-- Enable realtime refresh for published gallery content.
-- This is safe only while the table remains RLS-protected and has a public
-- SELECT policy; Supabase Realtime applies those row-level rules to clients.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'gallery_media_items'
      AND c.relkind IN ('r', 'p')
      AND c.relrowsecurity
  ) THEN
    RAISE EXCEPTION 'Refusing to publish public.gallery_media_items: table is missing or RLS is disabled';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = 'gallery_media_items'
      AND p.cmd IN ('SELECT', 'ALL')
      AND 'public' = ANY (p.roles::text[])
  ) THEN
    RAISE EXCEPTION 'Refusing to publish public.gallery_media_items: no public SELECT policy exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'gallery_media_items'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_media_items';
  END IF;
END
$$;
