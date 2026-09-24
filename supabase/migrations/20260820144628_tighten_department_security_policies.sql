-- Tighten execution privileges for the new Phase 2 functions.
revoke execute on function public.can_manage_admin_structure(uuid) from public, anon;
grant execute on function public.can_manage_admin_structure(uuid) to authenticated;
revoke execute on function public.can_approve_admin_request(uuid) from public, anon;
grant execute on function public.can_approve_admin_request(uuid) to authenticated;
revoke execute on function public.sync_admin_department_role() from public, anon, authenticated;

-- The trigger function is not an API endpoint; only PostgreSQL should invoke it.
revoke all on function public.prevent_admin_department_identity_change() from public, anon, authenticated;

-- This table is internal RBAC/mailbox mapping data. It must not be exposed without
-- an explicit mailbox-management/admin-all permission.
alter table if exists public.admin_role_mailbox_access enable row level security;
drop policy if exists "admin_role_mailbox_access_read" on public.admin_role_mailbox_access;
create policy "admin_role_mailbox_access_read" on public.admin_role_mailbox_access for select to authenticated using (
  public.user_has_permission(auth.uid(), 'admin:all')
  or public.can_manage_mailboxes(auth.uid())
);
drop policy if exists "admin_role_mailbox_access_write" on public.admin_role_mailbox_access;
create policy "admin_role_mailbox_access_write" on public.admin_role_mailbox_access for all to authenticated using (
  public.user_has_permission(auth.uid(), 'admin:all')
  or public.can_manage_mailboxes(auth.uid())
) with check (
  public.user_has_permission(auth.uid(), 'admin:all')
  or public.can_manage_mailboxes(auth.uid())
);
