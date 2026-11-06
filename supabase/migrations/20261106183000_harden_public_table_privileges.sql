-- Remove table capabilities that bypass row-level security for the
-- public API roles on current public tables and future postgres-owned tables.
-- Existing data, DML grants, RLS policies and service_role grants are preserved.
DO $$
BEGIN
  IF NOT pg_has_role(current_user, 'postgres', 'MEMBER') THEN
    RAISE EXCEPTION 'Migration requires membership in postgres to update its public-schema default privileges';
  END IF;
END
$$;

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

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;

-- The live migration executor is not a member of the reserved supabase_admin
-- role, and PostgreSQL will not permit it to change that role's default ACL.
-- Do not grant role membership here. The supabase_admin owner-specific default
-- ACL remains a separately tracked elevated-admin follow-up.
