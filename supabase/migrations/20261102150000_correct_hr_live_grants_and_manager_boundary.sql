-- Correct live HR ACL drift and align manager authorization with PR #61.
-- Prepared for review only. Do not apply to production until approved and tested.
-- Source reconciliation: the 2026-10-27 manual SQL Editor executions are present
-- in Postgres logs and migration ledger, but the grant repair did not revoke anon.
-- This migration intentionally limits itself to the four HR workspace tables and
-- public.is_hr_manager(uuid).

BEGIN;

-- Remove direct anonymous and PUBLIC table access, including inherited/default ACL
-- entries. RLS policies are not a substitute for removing unnecessary table grants.
REVOKE ALL PRIVILEGES ON TABLE
  public.hr_staff_directory,
  public.hr_job_descriptions,
  public.hr_tasks,
  public.hr_daily_reports
FROM PUBLIC, anon;

-- Reset authenticated grants to the intended minimum before granting back.
REVOKE ALL PRIVILEGES ON TABLE
  public.hr_staff_directory,
  public.hr_job_descriptions,
  public.hr_tasks,
  public.hr_daily_reports
FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.hr_staff_directory,
  public.hr_job_descriptions,
  public.hr_tasks
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.hr_daily_reports TO authenticated;

-- Keep trusted server-side operations available.
GRANT ALL PRIVILEGES ON TABLE
  public.hr_staff_directory,
  public.hr_job_descriptions,
  public.hr_tasks,
  public.hr_daily_reports
TO service_role;

-- Match the intended PR #61 boundary: only the current Global Admin or Manager
-- Admin (admin_acct) can exercise manager-level HR policies.
CREATE OR REPLACE FUNCTION public.is_hr_manager(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT coalesce(
    _user_id = auth.uid()
    AND (
      public.is_global_admin(auth.uid())
      OR public.has_role(auth.uid(), 'admin_acct')
    ),
    false
  );
$function$;

REVOKE ALL ON FUNCTION public.is_hr_manager(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_hr_manager(uuid) TO authenticated, service_role;

COMMIT;

-- Post-apply verification checklist (run separately after an approved deployment):
-- 1. anon has no table privileges on any of the four HR tables.
-- 2. authenticated has only SELECT/INSERT/UPDATE/DELETE on directory, descriptions,
--    and tasks; SELECT/INSERT/UPDATE on daily reports.
-- 3. service_role retains the privileges required for trusted server-side operations.
-- 4. is_hr_manager(uuid) matches the Global Admin + admin_acct boundary.
-- 5. RLS policies and role-based UI paths are tested for Global Admin, Manager Admin,
--    ordinary staff, and other admin roles before release.
