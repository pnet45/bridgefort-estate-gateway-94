-- Phase 2: Department + Admin management hardening
-- Only Super Admin, Admin-Dir and Admin-IT may manage department spaces and admin approvals.

create or replace function public.can_manage_admin_structure(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.has_role(_user_id, 'super_admin')
    or public.has_role(_user_id, 'admin_dir')
    or public.has_role(_user_id, 'admin_it'),
    false
  );
$$;

revoke all on function public.can_manage_admin_structure(uuid) from public;
grant execute on function public.can_manage_admin_structure(uuid) to authenticated;

-- Department CRUD is privileged structure management, not ordinary admin access.
alter table if exists public.admin_departments enable row level security;

drop policy if exists "admin_departments_read_authenticated" on public.admin_departments;
create policy "admin_departments_read_authenticated"
  on public.admin_departments for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin_departments_insert_structure_admins" on public.admin_departments;
create policy "admin_departments_insert_structure_admins"
  on public.admin_departments for insert
  to authenticated
  with check (public.can_manage_admin_structure(auth.uid()));

drop policy if exists "admin_departments_update_structure_admins" on public.admin_departments;
create policy "admin_departments_update_structure_admins"
  on public.admin_departments for update
  to authenticated
  using (public.can_manage_admin_structure(auth.uid()))
  with check (public.can_manage_admin_structure(auth.uid()));

drop policy if exists "admin_departments_delete_structure_admins" on public.admin_departments;
create policy "admin_departments_delete_structure_admins"
  on public.admin_departments for delete
  to authenticated
  using (public.can_manage_admin_structure(auth.uid()));

-- Every department created through the admin UI must have a matching RBAC role.
-- The trigger also seeds the minimum dashboard/email permissions. Department-specific
-- permissions can then be granted explicitly through the permission management system.
create or replace function public.sync_admin_department_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role_name is null or btrim(new.role_name) = '' then
    raise exception 'Department role_name is required';
  end if;

  insert into public.roles (name, display_name, description)
  values (
    new.role_name,
    'Admin-' || coalesce(nullif(initcap(new.slug), ''), new.name),
    coalesce(new.description, 'Department administrator')
  )
  on conflict (name) do update
    set display_name = excluded.display_name,
        description = excluded.description;

  insert into public.role_permissions (role, permission_key)
  values
    (new.role_name, 'admin:view_dashboard'),
    (new.role_name, 'admin:view_email_center'),
    (new.role_name, 'mailbox:read')
  on conflict (role, permission_key) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_sync_admin_department_role on public.admin_departments;
create trigger trg_sync_admin_department_role
after insert on public.admin_departments
for each row execute function public.sync_admin_department_role();

-- Prevent changing a department's slug/role identity after creation. Renaming a
-- department should not silently orphan existing admin_roles records.
create or replace function public.prevent_admin_department_identity_change()
returns trigger
language plpgsql
as $$
begin
  if new.slug is distinct from old.slug or new.role_name is distinct from old.role_name then
    raise exception 'Department slug and role identity cannot be changed after creation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_admin_department_identity_change on public.admin_departments;
create trigger trg_prevent_admin_department_identity_change
before update on public.admin_departments
for each row execute function public.prevent_admin_department_identity_change();

-- Admin approval records are sensitive. Only structure administrators may read/update them.
alter table if exists public.pending_admin_requests enable row level security;

drop policy if exists "pending_admin_requests_admin_read" on public.pending_admin_requests;
create policy "pending_admin_requests_admin_read"
  on public.pending_admin_requests for select
  to authenticated
  using (public.can_manage_admin_structure(auth.uid()));

drop policy if exists "pending_admin_requests_admin_update" on public.pending_admin_requests;
create policy "pending_admin_requests_admin_update"
  on public.pending_admin_requests for update
  to authenticated
  using (public.can_manage_admin_structure(auth.uid()))
  with check (public.can_manage_admin_structure(auth.uid()));

-- The requester may create only their own pending request. Existing policies are
-- intentionally replaced here so a normal admin cannot manufacture approvals.
drop policy if exists "pending_admin_requests_user_insert" on public.pending_admin_requests;
create policy "pending_admin_requests_user_insert"
  on public.pending_admin_requests for insert
  to authenticated
  with check (
    (user_id = auth.uid())
    and status = 'pending'
  );

-- Keep the role request list constrained to actual department roles.
alter table public.pending_admin_requests
  drop constraint if exists pending_admin_requests_requested_role_check;

alter table public.pending_admin_requests
  add constraint pending_admin_requests_requested_role_check
  check (
    requested_role is null
    or requested_role in (
      'admin_dir', 'admin_adm', 'admin_acct', 'admin_sales',
      'admin_cs', 'admin_legal', 'admin_it'
    )
  );

-- Approvals are explicitly restricted to the structure-admin roles.
create or replace function public.can_approve_admin_request(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_admin_structure(_user_id);
$$;

revoke all on function public.can_approve_admin_request(uuid) from public;
grant execute on function public.can_approve_admin_request(uuid) to authenticated;
