insert into public.role_permissions (role, permission_key, is_enabled) values ('admin','admin:approve_payments',true),('admin','admin:approve_withdrawals',true) on conflict (role, permission_key) do update set is_enabled=excluded.is_enabled, updated_at=now();
update public.role_permissions set is_enabled=false, updated_at=now() where role='admin_it' and permission_key='admin:view_approvals';
