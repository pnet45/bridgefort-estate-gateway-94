-- Remove table capabilities that bypass RLS from existing public tables.
-- This migration only changes ACLs the postgres migration executor owns.
-- The supabase_admin default ACL is handled by a separate privileged migration.
DO $$
BEGIN
  IF NOT pg_has_role(current_user, 'postgres', 'MEMBER') THEN
    RAISE EXCEPTION 'Migration requires membership in postgres; no ACL changes were attempted';
  END IF;
END
$$;

-- Preserve SELECT/INSERT/UPDATE/DELETE grants. Existing RLS policies remain
-- authoritative for row access.
DO $$
DECLARE
  target record;
BEGIN
  FOR target IN
    SELECT n.nspname, c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE %I.%I FROM anon, authenticated',
      target.nspname,
      target.relname
    );
  END LOOP;
END
$$;

-- Prevent future tables created by postgres from inheriting these grants.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;
