-- Applied to the production Supabase project on 2026-11-02.
-- Align this migration filename with the recorded remote version 20261102155423.
-- Restrict HR management authority to Global Admin and Manager Admin (admin_acct).
-- Existing table policies delegate management access through is_hr_manager(auth.uid()).

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
