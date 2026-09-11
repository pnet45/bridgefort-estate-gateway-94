insert into public.permissions (key, label, category, description) values ('admin:manage_mailboxes', 'Manage mailboxes and Google access', 'admin', 'Create, edit and delete administrator mailbox assignments and manage authorized Google identities.') on conflict (key) do update set label=excluded.label, category=excluded.category, description=excluded.description, updated_at=now();
insert into public.admin_permissions (user_id, permission_key, granted_by)
select u.id, 'admin:manage_mailboxes', sa.id
from public.users u
cross join lateral (select id from public.users where email='princenetlegacy@gmail.com' limit 1) sa
where lower(u.email) = 'it@bridgeforthomes.com'
on conflict (user_id, permission_key) do update set expires_at=null;
