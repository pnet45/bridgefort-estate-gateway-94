INSERT INTO public.role_permissions (role, permission_key, is_enabled)
VALUES ('admin_it', 'admin:manage_mailboxes', true)
ON CONFLICT (role, permission_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;
