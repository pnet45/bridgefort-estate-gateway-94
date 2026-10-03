DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON public.role_permissions;
CREATE POLICY "Users can view permissions for their own roles"
ON public.role_permissions FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role::text = role_permissions.role::text)
  OR EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = auth.uid() AND ar.role_name::text = role_permissions.role::text AND (ar.expires_at IS NULL OR ar.expires_at > now()))
);