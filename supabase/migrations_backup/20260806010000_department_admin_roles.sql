-- Department admin roles (Admin-Dir, Admin-Adm, Admin-Acct, Admin-Sales,
-- Admin-CS, Admin-Legal, Admin-IT) + the mailbox permission matrix that
-- decides which mailboxes each role gets on approval.

insert into public.roles (name, display_name, description)
values
  ('admin_dir', 'Admin-Dir', 'Director — full access, all mailboxes, no restrictions'),
  ('admin_adm', 'Admin-Adm', 'Administration department'),
  ('admin_acct', 'Admin-Acct', 'Accounts department'),
  ('admin_sales', 'Admin-Sales', 'Sales department'),
  ('admin_cs', 'Admin-CS', 'Customer Service department'),
  ('admin_legal', 'Admin-Legal', 'Legal department'),
  ('admin_it', 'Admin-IT', 'IT department')
on conflict (name) do nothing;

-- Admin-Dir mirrors super_admin: unrestricted, every current admin: permission.
insert into public.role_permissions (role, permission_key)
select 'admin_dir', permission_key from public.role_permissions where role = 'super_admin'
on conflict (role, permission_key) do nothing;

-- The other six departments get the base admin dashboard + their own email
-- access; mailbox scoping itself is enforced by admin_mailboxes /
-- user_mailbox_access(), not by admin: permissions.
insert into public.role_permissions (role, permission_key)
values
  ('admin_adm', 'admin:view_dashboard'), ('admin_adm', 'admin:view_email_center'), ('admin_adm', 'mailbox:read'), ('admin_adm', 'mailbox:write'), ('admin_adm', 'mailbox:sync'),
  ('admin_acct', 'admin:view_dashboard'), ('admin_acct', 'admin:view_email_center'), ('admin_acct', 'admin:view_other_payments'), ('admin_acct', 'mailbox:read'), ('admin_acct', 'mailbox:write'), ('admin_acct', 'mailbox:sync'),
  ('admin_sales', 'admin:view_dashboard'), ('admin_sales', 'admin:view_email_center'), ('admin_sales', 'admin:view_crm'), ('admin_sales', 'mailbox:read'), ('admin_sales', 'mailbox:write'), ('admin_sales', 'mailbox:sync'),
  ('admin_cs', 'admin:view_dashboard'), ('admin_cs', 'admin:view_email_center'), ('admin_cs', 'mailbox:read'), ('admin_cs', 'mailbox:write'), ('admin_cs', 'mailbox:sync'),
  ('admin_legal', 'admin:view_dashboard'), ('admin_legal', 'admin:view_email_center'), ('admin_legal', 'mailbox:read'), ('admin_legal', 'mailbox:write'), ('admin_legal', 'mailbox:sync'),
  ('admin_it', 'admin:view_dashboard'), ('admin_it', 'admin:view_email_center'), ('admin_it', 'mailbox:read'), ('admin_it', 'mailbox:write'), ('admin_it', 'mailbox:sync')
on conflict (role, permission_key) do nothing;

-- Mailbox permission matrix. admin_dir is intentionally absent here — it
-- doesn't need explicit rows because user_mailbox_access() already grants
-- anyone with admin:all every mailbox.
create table if not exists public.role_default_mailboxes (
  id uuid primary key default gen_random_uuid(),
  role_name text not null references public.roles(name) on delete cascade,
  mailbox_email text not null,
  mailbox_provider text not null default 'gmail',
  created_at timestamptz not null default now(),
  unique (role_name, mailbox_email, mailbox_provider)
);

alter table public.role_default_mailboxes enable row level security;

drop policy if exists "role_default_mailboxes_read_authenticated" on public.role_default_mailboxes;
create policy "role_default_mailboxes_read_authenticated"
  on public.role_default_mailboxes for select
  using (auth.role() = 'authenticated');

drop policy if exists "role_default_mailboxes_write_admins" on public.role_default_mailboxes;
create policy "role_default_mailboxes_write_admins"
  on public.role_default_mailboxes for all
  using (public.user_has_permission(auth.uid(), 'admin:manage_permissions'))
  with check (public.user_has_permission(auth.uid(), 'admin:manage_permissions'));

insert into public.role_default_mailboxes (role_name, mailbox_email) values
  ('admin_acct', 'account@bridgeforthomes.com'),
  ('admin_acct', 'sales@bridgeforthomes.com'),
  ('admin_sales', 'sales@bridgeforthomes.com'),
  ('admin_legal', 'legal@bridgeforthomes.com'),
  ('admin_legal', 'info@bridgeforthomes.com'),
  ('admin_cs', 'sales@bridgeforthomes.com'),
  ('admin_cs', 'info@bridgeforthomes.com'),
  ('admin_cs', 'support@bridgeforthomes.com'),
  ('admin_cs', 'noreply@bridgeforthomes.com'),
  ('admin_cs', 'training@bridgeforthomes.com'),
  ('admin_it', 'support@bridgeforthomes.com'),
  ('admin_it', 'it@bridgeforthomes.com'),
  ('admin_it', 'dpo@bridgeforthomes.com'),
  ('admin_adm', 'sales@bridgeforthomes.com'),
  ('admin_adm', 'admin@bridgeforthomes.com'),
  ('admin_adm', 'hr@bridgeforthomes.com'),
  ('admin_adm', 'training@bridgeforthomes.com')
on conflict (role_name, mailbox_email, mailbox_provider) do nothing;

-- Let a signup requester indicate which department they're requesting —
-- this is only a request; approve-admin-request assigns the actual role.
alter table public.pending_admin_requests
  add column if not exists requested_role text;

alter table public.pending_admin_requests
  drop constraint if exists pending_admin_requests_requested_role_check;

alter table public.pending_admin_requests
  add constraint pending_admin_requests_requested_role_check
  check (requested_role is null or requested_role in (
    'admin_dir', 'admin_adm', 'admin_acct', 'admin_sales', 'admin_cs', 'admin_legal', 'admin_it'
  ));
