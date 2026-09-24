insert into public.admin_permissions (user_id, permission_key, granted_by)
select u.id, 'admin:manage_mailboxes', sa.id
from public.users u
cross join lateral (select id from public.users where email='princenetlegacy@gmail.com' limit 1) sa
where lower(u.email) = 'adm@bridgeforthomes.com'
on conflict (user_id, permission_key) do update set expires_at=null;
