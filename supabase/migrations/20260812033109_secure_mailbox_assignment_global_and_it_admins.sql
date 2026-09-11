DROP POLICY IF EXISTS super_admin_all_select ON public.admin_mailboxes;
DROP POLICY IF EXISTS super_admin_all_insert ON public.admin_mailboxes;
DROP POLICY IF EXISTS super_admin_all_update ON public.admin_mailboxes;
DROP POLICY IF EXISTS super_admin_all_delete ON public.admin_mailboxes;
DROP POLICY IF EXISTS admin_mailboxes_access_own ON public.admin_mailboxes;
DROP POLICY IF EXISTS admin_mailboxes_write_own_or_admin ON public.admin_mailboxes;

CREATE POLICY admin_mailboxes_select_authorized ON public.admin_mailboxes
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_global_admin(auth.uid())
  OR public.user_has_permission(auth.uid(), 'admin:manage_mailboxes')
);

CREATE POLICY admin_mailboxes_insert_authorized ON public.admin_mailboxes
FOR INSERT TO authenticated
WITH CHECK (
  public.is_global_admin(auth.uid())
  OR public.user_has_permission(auth.uid(), 'admin:manage_mailboxes')
);

CREATE POLICY admin_mailboxes_update_authorized ON public.admin_mailboxes
FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
  OR public.is_global_admin(auth.uid())
  OR public.user_has_permission(auth.uid(), 'admin:manage_mailboxes')
)
WITH CHECK (
  auth.uid() = user_id
  OR public.is_global_admin(auth.uid())
  OR public.user_has_permission(auth.uid(), 'admin:manage_mailboxes')
);

CREATE POLICY admin_mailboxes_delete_authorized ON public.admin_mailboxes
FOR DELETE TO authenticated
USING (
  public.is_global_admin(auth.uid())
  OR public.user_has_permission(auth.uid(), 'admin:manage_mailboxes')
);

DROP POLICY IF EXISTS super_admin_all_select ON public.role_default_mailboxes;
DROP POLICY IF EXISTS super_admin_all_insert ON public.role_default_mailboxes;
DROP POLICY IF EXISTS super_admin_all_update ON public.role_default_mailboxes;
DROP POLICY IF EXISTS super_admin_all_delete ON public.role_default_mailboxes;
DROP POLICY IF EXISTS role_default_mailboxes_write_admins ON public.role_default_mailboxes;

CREATE POLICY role_default_mailboxes_manage_authorized ON public.role_default_mailboxes
FOR ALL TO authenticated
USING (
  public.is_global_admin(auth.uid())
  OR public.user_has_permission(auth.uid(), 'admin:manage_mailboxes')
)
WITH CHECK (
  public.is_global_admin(auth.uid())
  OR public.user_has_permission(auth.uid(), 'admin:manage_mailboxes')
);

CREATE OR REPLACE FUNCTION public.can_manage_mailboxes(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT public.is_global_admin(_user_id)
      OR public.user_has_permission(_user_id, 'admin:manage_mailboxes');
$function$;

REVOKE EXECUTE ON FUNCTION public.can_manage_mailboxes(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.can_manage_mailboxes(uuid) TO authenticated, service_role;
