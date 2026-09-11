CREATE OR REPLACE FUNCTION public.block_role_updates_on_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF public.is_global_admin(auth.uid()) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Updating users.role is restricted to Admin-Dir and Super_Admin';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_withdrawal_funnel_stats()
RETURNS TABLE(status text, request_count bigint, total_amount numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT w.status, COUNT(*) AS request_count, COALESCE(SUM(w.amount), 0)
  FROM public.withdrawal_requests w
  WHERE public.admin_has_permission('admin:view_mlm_funnel')
  GROUP BY w.status;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_withdrawal_funnel_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_withdrawal_funnel_stats() TO authenticated, service_role;
