-- Allow only Global Admin (Admin-Dir/Super Admin) and Manager Admin to manage per-admin menu visibility.
-- The permissions tab itself is intentionally non-delegable; role/action permissions remain server-authorized.
CREATE OR REPLACE FUNCTION public.get_manageable_admin_accounts()
RETURNS TABLE(user_id uuid, role_name text, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT DISTINCT ON (ar.user_id)
    ar.user_id,
    ar.role_name,
    COALESCE(NULLIF(trim(concat_ws(' ', p.first_name, p.last_name)), ''), ar.user_id::text) AS display_name
  FROM public.admin_roles ar
  LEFT JOIN public.profiles p ON p.id = ar.user_id
  WHERE (public.is_global_admin(auth.uid()) OR public.has_role(auth.uid(), 'manager'))
    AND ar.user_id <> auth.uid()
    AND ar.role_name NOT IN ('admin_dir', 'super_admin')
    AND (ar.expires_at IS NULL OR ar.expires_at > now())
  ORDER BY ar.user_id, CASE WHEN ar.role_name = 'manager' THEN 1 ELSE 2 END, ar.role_name;
$function$;

REVOKE ALL ON FUNCTION public.get_manageable_admin_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_manageable_admin_accounts() TO authenticated;

DROP POLICY IF EXISTS admin_menu_visibility_select_self_or_super ON public.admin_menu_visibility;
CREATE POLICY admin_menu_visibility_select_self_or_manager_or_global ON public.admin_menu_visibility
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_global_admin(auth.uid())
  OR public.has_role(auth.uid(), 'manager')
);

DROP POLICY IF EXISTS admin_menu_visibility_write_super ON public.admin_menu_visibility;
DROP POLICY IF EXISTS admin_menu_visibility_write_manager_or_global ON public.admin_menu_visibility;
CREATE POLICY admin_menu_visibility_write_manager_or_global ON public.admin_menu_visibility
FOR ALL TO authenticated
USING (
  (public.is_global_admin(auth.uid()) OR public.has_role(auth.uid(), 'manager'))
  AND user_id <> auth.uid()
  AND NOT public.is_global_admin(user_id)
  AND tab_key <> 'permissions'
  AND EXISTS (
    SELECT 1 FROM public.admin_roles target_role
    WHERE target_role.user_id = admin_menu_visibility.user_id
      AND target_role.role_name NOT IN ('admin_dir', 'super_admin')
      AND (target_role.expires_at IS NULL OR target_role.expires_at > now())
  )
)
WITH CHECK (
  (public.is_global_admin(auth.uid()) OR public.has_role(auth.uid(), 'manager'))
  AND user_id <> auth.uid()
  AND NOT public.is_global_admin(user_id)
  AND tab_key <> 'permissions'
  AND EXISTS (
    SELECT 1 FROM public.admin_roles target_role
    WHERE target_role.user_id = admin_menu_visibility.user_id
      AND target_role.role_name NOT IN ('admin_dir', 'super_admin')
      AND (target_role.expires_at IS NULL OR target_role.expires_at > now())
  )
);

COMMENT ON FUNCTION public.get_manageable_admin_accounts() IS
'Lists active non-global admin accounts for the authenticated Global Admin or Manager Admin permission editor.';
