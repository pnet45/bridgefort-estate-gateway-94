-- Restrict HR management authority to Global Admin and Manager Admin (admin_acct).
-- Existing table policies delegate write access through is_hr_manager(auth.uid()),
-- so narrowing this helper protects staff, task, job-description, and report review access.
-- This migration is intentionally reviewed in GitHub first; do not apply manually to production.

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
