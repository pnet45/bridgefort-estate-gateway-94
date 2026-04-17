
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'BlogPost'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public."BlogPost"';
  END IF;
END $$;
