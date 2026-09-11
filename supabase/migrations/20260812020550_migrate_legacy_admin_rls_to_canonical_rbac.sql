CREATE OR REPLACE FUNCTION public.is_global_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = _user_id AND ar.role_name IN ('admin_dir','super_admin') AND (ar.expires_at IS NULL OR ar.expires_at > now()));
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT public.is_global_admin(_user_id) OR EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = _user_id AND (ar.expires_at IS NULL OR ar.expires_at > now()));
$function$;

CREATE OR REPLACE FUNCTION public.can_manage_admin_module(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT public.is_global_admin(_user_id) OR public.user_has_permission(_user_id, 'admin:all') OR public.user_has_permission(_user_id, 'admin:manage_permissions');
$function$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.can_manage_admin_module(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_manage_admin_module(uuid) TO authenticated, service_role;
