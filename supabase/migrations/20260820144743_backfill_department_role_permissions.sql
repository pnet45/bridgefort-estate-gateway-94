insert into public.role_permissions (role, permission_key)
select d.role_name, p.permission_key
from public.admin_departments d
cross join (values ('admin:view_dashboard'), ('admin:view_email_center'), ('mailbox:read')) as p(permission_key)
where d.is_active = true
on conflict (role, permission_key) do nothing;

update public.roles r
set display_name = 'Admin-' || coalesce(nullif(initcap(d.slug), ''), d.name),
    description = coalesce(d.description, r.description, 'Department administrator')
from public.admin_departments d
where d.role_name = r.name;
