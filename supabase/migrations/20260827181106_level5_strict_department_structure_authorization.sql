CREATE OR REPLACE FUNCTION public.can_manage_departments(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT coalesce(
    public.has_role(_user_id, 'super_admin')
    OR public.has_role(_user_id, 'admin_dir')
    OR public.has_role(_user_id, 'admin_it'),
    false
  );
$$;

DELETE FROM public.admin_permissions
WHERE permission_key = 'admin:manage_departments'
  AND user_id NOT IN (
    SELECT DISTINCT ar.user_id
    FROM public.admin_roles ar
    WHERE ar.role_name IN ('super_admin','admin_dir','admin_it')
      AND (ar.expires_at IS NULL OR ar.expires_at > now())
  );
