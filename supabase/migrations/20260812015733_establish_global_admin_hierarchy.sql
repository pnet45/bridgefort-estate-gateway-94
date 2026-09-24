CREATE OR REPLACE FUNCTION public.is_global_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.user_id = _user_id
      AND ar.role_name IN ('admin_dir', 'super_admin')
      AND (ar.expires_at IS NULL OR ar.expires_at > now())
  );
$function$;

REVOKE EXECUTE ON FUNCTION public.is_global_admin(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_global_admin(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.admin_roles ar
      WHERE ar.user_id = _user_id
        AND ar.role_name = _role
        AND (ar.expires_at IS NULL OR ar.expires_at > now())
    )
    OR (
      _role IN ('admin', 'admin_dir', 'super_admin')
      AND public.is_global_admin(_user_id)
    );
$function$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.is_global_admin(auth.uid());
$function$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.user_has_permission(_user_id uuid, _permission_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    public.is_global_admin(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.admin_permissions ap
      WHERE ap.user_id = _user_id
        AND ap.permission_key = _permission_key
        AND (ap.expires_at IS NULL OR ap.expires_at > now())
    )
    OR EXISTS (
      SELECT 1
      FROM public.admin_roles ar
      JOIN public.role_permissions rp
        ON rp.role = ar.role_name
       AND rp.is_enabled IS NOT FALSE
      WHERE ar.user_id = _user_id
        AND (ar.expires_at IS NULL OR ar.expires_at > now())
        AND rp.permission_key = _permission_key
    );
$function$;

REVOKE EXECUTE ON FUNCTION public.user_has_permission(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.user_mailbox_access(
  _user_id uuid,
  _mailbox_email text,
  _provider text DEFAULT 'gmail'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN _user_id <> auth.uid()
      AND NOT public.is_global_admin(auth.uid())
      AND NOT public.user_has_permission(auth.uid(), 'admin:manage_permissions')
    THEN false
    WHEN public.is_global_admin(_user_id) THEN true
    ELSE EXISTS (
      SELECT 1
      FROM public.admin_roles ar
      JOIN public.admin_role_mailbox_access rma
        ON rma.role_name = ar.role_name
      WHERE ar.user_id = _user_id
        AND (ar.expires_at IS NULL OR ar.expires_at > now())
        AND lower(rma.mailbox_email) = lower(_mailbox_email)
    )
  END;
$function$;

REVOKE EXECUTE ON FUNCTION public.user_mailbox_access(uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.user_mailbox_access(uuid, text, text) TO authenticated, service_role;

COMMENT ON FUNCTION public.is_global_admin(uuid) IS 'Returns true only for active Admin-Dir or Super_Admin accounts. These roles are unrestricted/global administrators.';
COMMENT ON FUNCTION public.user_has_permission(uuid, text) IS 'Global Admin-Dir and Super_Admin accounts bypass individual permission keys; department admins remain restricted to their assigned permissions.';
COMMENT ON FUNCTION public.user_mailbox_access(uuid, text, text) IS 'Admin-Dir and Super_Admin have unrestricted mailbox access; department administrators are limited to the role mailbox matrix.';
