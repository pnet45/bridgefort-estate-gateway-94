-- Give Manager Admin the operational workspace permissions without global-admin authority.
-- Global Admin-only controls (admin:all and admin:manage_permissions) are intentionally excluded.
INSERT INTO public.role_permissions (role, permission_key, is_enabled, updated_at)
SELECT 'manager', source.permission_key, true, now()
FROM public.role_permissions AS source
WHERE source.role = 'admin_dir'
  AND source.is_enabled = true
  AND source.permission_key NOT IN ('admin:all', 'admin:manage_permissions')
ON CONFLICT (role, permission_key)
DO UPDATE SET is_enabled = true, updated_at = now();
