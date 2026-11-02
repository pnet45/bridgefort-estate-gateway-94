-- Applied to the production Supabase project on 2026-11-02.
-- Align this migration filename with the recorded remote version 20261102155427.
-- Reconcile HR workspace table privileges with the PR #61 access model.
-- This migration does not alter HR data or RLS policies.
--
-- Expected access:
--   anon: no table privileges
--   authenticated: existing app CRUD permissions (daily reports exclude DELETE)
--   service_role: preserve existing service-role access
--
-- The HR manager authorization restriction is applied by the immediately
-- preceding migration: 20261102155423_restrict_hr_management_to_global_and_manager_admin.sql.

BEGIN;

REVOKE ALL PRIVILEGES ON TABLE
  public.hr_staff_directory,
  public.hr_job_descriptions,
  public.hr_tasks,
  public.hr_daily_reports
FROM anon, PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE
  public.hr_staff_directory,
  public.hr_job_descriptions,
  public.hr_tasks
TO authenticated;

GRANT SELECT, INSERT, UPDATE
ON TABLE public.hr_daily_reports
TO authenticated;

COMMIT;
