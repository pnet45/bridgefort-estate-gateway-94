-- Reconcile HR workspace table privileges with the PR #61 access model.
-- This migration is intentionally additive/safe to re-run at the privilege level.
-- It does not alter HR data or RLS policies.
--
-- Expected access:
--   anon: no table privileges
--   authenticated: existing app CRUD permissions (daily reports exclude DELETE)
--   service_role: preserve existing service-role access
--
-- HR manager authorization is restricted by the preceding migration
-- 20261029090000_restrict_hr_management_to_global_and_manager_admin.sql.
-- That migration must be applied before this one.

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
