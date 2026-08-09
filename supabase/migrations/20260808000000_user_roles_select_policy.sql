-- user_roles has RESTRICTIVE policies blocking client-side INSERT/UPDATE/
-- DELETE (added 20260704), which only have any effect if RLS is already
-- enabled — but no migration anywhere in this project's history ever added
-- a permissive SELECT policy for it. With RLS enabled and zero permissive
-- SELECT policies, every client-side SELECT on this table returns zero
-- rows for everyone, always — not just admins. This is why AuthContext's
-- fetchUserAccess() (which queries user_roles directly with the user's own
-- session) has been silently getting nothing back, for every account, and
-- falling through to the "Client" default. The error was also being
-- silently swallowed there (only `data` was destructured, never `error`),
-- so nothing ever surfaced this.

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
  on public.user_roles for select
  using (
    auth.uid() = user_id
    or public.user_has_permission(auth.uid(), 'admin:manage_permissions')
  );
