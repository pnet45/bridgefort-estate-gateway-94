INSERT INTO public.role_permissions (role, permission_key, is_enabled)
VALUES ('admin_it', 'admin:manage_departments', true)
ON CONFLICT (role, permission_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = now();

CREATE OR REPLACE FUNCTION public.can_manage_departments(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.is_global_admin(_user_id)
      OR public.user_has_permission(_user_id, 'admin:manage_departments');
$function$;

REVOKE EXECUTE ON FUNCTION public.can_manage_departments(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_manage_departments(uuid) TO authenticated, service_role;
