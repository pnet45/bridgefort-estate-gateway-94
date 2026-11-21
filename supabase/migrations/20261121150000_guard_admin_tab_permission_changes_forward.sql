-- Forward-only repair: restore the database guard for admin tab permission changes.
-- The original 20261020120000 file was not applied in production; do not replay its old version.
CREATE OR REPLACE FUNCTION public.guard_admin_tab_permission_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  protected_keys text[] := ARRAY[
    'admin:view_dashboard',
    'admin:view_properties',
    'admin:view_allocations',
    'admin:view_documentation',
    'admin:view_crm',
    'admin:view_users',
    'admin:view_approvals',
    'admin:view_subscribers',
    'admin:view_email_center',
    'admin:view_analytics',
    'admin:view_mlm_funnel',
    'admin:view_activity',
    'admin:view_content',
    'admin:view_cms',
    'admin:view_other_payments',
    'admin:manage_departments',
    'admin:view_travels'
  ];
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_global_admin(auth.uid()) THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.permission_key = ANY(protected_keys) THEN
        RAISE EXCEPTION 'Only a global administrator may change administrator tab visibility'
          USING ERRCODE = '42501';
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.permission_key = ANY(protected_keys)
         OR OLD.permission_key = ANY(protected_keys) THEN
        RAISE EXCEPTION 'Only a global administrator may change administrator tab visibility'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_admin_tab_permission_changes() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS guard_admin_tab_permission_changes_trigger ON public.role_permissions;
CREATE TRIGGER guard_admin_tab_permission_changes_trigger
BEFORE INSERT OR UPDATE OF role, permission_key, is_enabled
ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.guard_admin_tab_permission_changes();
