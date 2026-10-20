-- Ensure the manager admin role has an explicit documentation-management grant.
insert into public.role_permissions (role, permission_key, is_enabled)
values ('manager', 'admin:manage_documentation', true)
on conflict (role, permission_key)
do update set is_enabled = excluded.is_enabled;
