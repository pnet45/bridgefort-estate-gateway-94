-- Security hardening: remove table capabilities that bypass RLS.
-- Fail before changing any ACL if the migration executor cannot update both
-- owner-specific default ACLs observed in this project's live public schema.
DO $$
BEGIN
  IF NOT pg_has_role(current_user, 'postgres', 'MEMBER') THEN
    RAISE EXCEPTION 'Migration requires membership in postgres to update its public-schema default privileges';
  END IF;
  IF NOT pg_has_role(current_user, 'supabase_admin', 'MEMBER') THEN
    RAISE EXCEPTION 'Migration requires membership in supabase_admin to update its public-schema default privileges; no ACL changes were attempted';
  END IF;
END
$$;

-- This migration intentionally preserves SELECT/INSERT/UPDATE/DELETE grants.
-- Row access remains governed by each table's existing RLS policies.
-- Do not apply to production until the migration has been reviewed and tested.

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

-- Prevent the same dangerous privileges from being inherited by newly
-- created public tables. Apply to both roles used as object owners in this
-- project's current default-privilege configuration.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;

-- Deliberately do not mass-revoke EXECUTE on existing SECURITY DEFINER
-- functions here: several are legitimate client RPCs and require individual
-- authorization review before changing their grants.
