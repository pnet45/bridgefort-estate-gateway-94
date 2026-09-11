insert into public.role_permissions (role, permission_key, is_enabled) values ('admin_it','admin:approve_admin_requests',true) on conflict (role, permission_key) do update set is_enabled=true, updated_at=now();
update public.role_permissions set is_enabled=false, updated_at=now() where role='admin_it' and permission_key in ('admin:approve_payments','admin:approve_withdrawals');
