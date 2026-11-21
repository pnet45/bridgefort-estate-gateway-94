-- This change must run under a migration executor that is authorized
-- to change supabase_admin's default privileges. The preflight fails before
-- any changes when that authority is not available.
DO $$
BEGIN
  IF NOT pg_has_role(current_user, 'supabase_admin', 'MEMBER') THEN
    RAISE EXCEPTION 'Migration requires membership in supabase_admin to update its public-schema default privileges; no ACL changes were attempted';
  END IF;
END
$$;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;
