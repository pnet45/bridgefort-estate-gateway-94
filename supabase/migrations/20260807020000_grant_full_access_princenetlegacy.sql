-- Grants princenetlegacy@gmail.com full, unambiguous, unrestricted access.
--
-- Diagnosis: get_available_mailboxes() only returns department mailboxes
-- when user_has_permission(_user_id, 'admin:all') is true. This account
-- got an empty list, which means whatever "super_admin" means for this
-- account today isn't actually resolving to admin:all in the RBAC tables
-- added in Batch 23 — most likely it only has a legacy
-- user_roles.role = 'admin' row (or an admin_roles row that, for some
-- reason, isn't matching role_permissions). That legacy role maps to a
-- narrower permission set, not admin:all.
--
-- Rather than chase exactly which of those it is, this grants every
-- mechanism at once for this one account: every role that currently
-- exists in public.roles, the legacy user_roles admin flag, AND a direct
-- admin:all permission grant that doesn't depend on role resolution
-- working at all. Whichever mechanism the rest of the app happens to
-- check, this account passes it.

do $$
declare
  target_user_id uuid;
  role_row record;
begin
  select id into target_user_id from auth.users where email = 'princenetlegacy@gmail.com';

  if target_user_id is null then
    raise notice 'princenetlegacy@gmail.com not found in auth.users — nothing to grant. Re-run this migration after the account signs up at least once.';
    return;
  end if;

  -- Every role that exists, department roles included — "all roles
  -- privileges in the whole project" taken literally, not just whichever
  -- single role happens to imply admin:all.
  for role_row in select name from public.roles loop
    insert into public.admin_roles (user_id, role_name, granted_by)
    values (target_user_id, role_row.name, target_user_id)
    on conflict (user_id, role_name) do nothing;
  end loop;

  -- Legacy compatibility — anything still checking has_role(uid,'admin')
  -- via the old user_roles/app_role enum path. user_roles predates the
  -- migrations folder (no CREATE TABLE for it exists anywhere in this
  -- repo), so its exact constraints are unknown — using NOT EXISTS instead
  -- of ON CONFLICT works regardless of whether a unique constraint is even
  -- there.
  if not exists (select 1 from public.user_roles where user_id = target_user_id and role = 'admin') then
    insert into public.user_roles (user_id, role) values (target_user_id, 'admin');
  end if;

  -- Direct permission grant as a backstop that doesn't depend on any role
  -- join resolving correctly.
  insert into public.admin_permissions (user_id, permission_key, granted_by)
  select target_user_id, key, target_user_id from public.permissions
  on conflict (user_id, permission_key) do nothing;

  raise notice 'Granted all roles and permissions to princenetlegacy@gmail.com (user_id: %)', target_user_id;
end $$;
