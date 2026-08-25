-- Email Center Phase 1 — backend enforcement.
--
-- Until now, admin_emails RLS was blanket "any admin sees every email in
-- every mailbox" (has_role(auth.uid(), 'admin')). That's exactly what the
-- spec's "filtering must happen on the backend, not only on the frontend"
-- requirement rules out. This replaces it with per-mailbox enforcement via
-- user_mailbox_access(), the same function already used by the edge
-- functions as of this batch.
--
-- A message's mailbox is whichever side of to_email/from_email is actually
-- one of ours: for an inbound message to_email is our mailbox and
-- from_email is the external sender; for an outbound/sent message it's the
-- reverse. Checking both sides covers both directions without needing a
-- separate "which mailbox does this row belong to" column.

drop policy if exists "Admins can view all emails" on public.admin_emails;
create policy "Admins can view authorized mailbox emails"
  on public.admin_emails for select
  using (
    public.user_mailbox_access(auth.uid(), to_email)
    or public.user_mailbox_access(auth.uid(), from_email)
  );

drop policy if exists "Admins can insert emails" on public.admin_emails;
create policy "Admins can insert into authorized mailboxes"
  on public.admin_emails for insert
  with check (
    public.user_mailbox_access(auth.uid(), to_email)
    or public.user_mailbox_access(auth.uid(), from_email)
  );

drop policy if exists "Admins can update emails" on public.admin_emails;
create policy "Admins can update authorized mailbox emails"
  on public.admin_emails for update
  using (
    public.user_mailbox_access(auth.uid(), to_email)
    or public.user_mailbox_access(auth.uid(), from_email)
  );

drop policy if exists "Admins can delete emails" on public.admin_emails;
create policy "Admins can delete authorized mailbox emails"
  on public.admin_emails for delete
  using (
    public.user_mailbox_access(auth.uid(), to_email)
    or public.user_mailbox_access(auth.uid(), from_email)
  );

-- What the Email Login screen (Phase 2) lists as this admin's mailboxes.
-- Admin-Dir (admin:all) has no admin_mailboxes rows by design — it's
-- unrestricted — so it instead gets every distinct mailbox address known
-- to the system, sourced from role_default_mailboxes.
create or replace function public.get_available_mailboxes(_user_id uuid)
returns table (
  mailbox_email text,
  mailbox_provider text,
  is_connected boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.mailbox_email,
    m.mailbox_provider,
    exists (
      select 1 from public.gmail_oauth_tokens t
      where t.email = m.mailbox_email and m.mailbox_provider = 'gmail'
    ) as is_connected
  from (
    select mailbox_email, mailbox_provider
    from public.admin_mailboxes
    where user_id = _user_id and status = 'active'
    union
    select mailbox_email, mailbox_provider
    from public.role_default_mailboxes
    where public.user_has_permission(_user_id, 'admin:all')
  ) m
  where _user_id = auth.uid() or public.user_has_permission(auth.uid(), 'admin:manage_permissions');
$$;

revoke all on function public.get_available_mailboxes(uuid) from public, anon;
grant execute on function public.get_available_mailboxes(uuid) to authenticated;
