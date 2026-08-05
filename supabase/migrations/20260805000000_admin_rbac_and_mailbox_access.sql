create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  category text not null default 'admin',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_name text not null references public.roles(name) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_name, permission_key)
);

create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, permission_key)
);

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_name text not null references public.roles(name) on delete cascade,
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, role_name)
);

create table if not exists public.admin_mailboxes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mailbox_email text not null,
  mailbox_provider text not null default 'gmail',
  provider_account_id text,
  is_primary boolean not null default false,
  access_level text not null default 'read_write',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mailbox_email)
);

create table if not exists public.email_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mailbox_email text not null,
  provider text not null,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  last_validated_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mailbox_email text not null,
  provider text not null,
  status text not null default 'connected',
  oauth_state text,
  scopes text[] not null default '{}',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mailbox_email, provider)
);

create table if not exists public.mail_sync_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mailbox_email text not null,
  provider text not null,
  last_sync_at timestamptz,
  status text not null default 'idle',
  message_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mailbox_email, provider)
);

create table if not exists public.mail_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mailbox_email text not null,
  provider text not null,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_type text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mailbox_email, provider)
);

create table if not exists public.mail_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mailbox_email text not null,
  provider text not null,
  sync_enabled boolean not null default true,
  folder_filters text[] not null default '{}',
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mailbox_email, provider)
);

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = _user_id
      and ar.role_name = _role
      and (ar.expires_at is null or ar.expires_at > now())
  )
  or exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
  );
$$;

create or replace function public.user_has_permission(_user_id uuid, _permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_permissions ap
    where ap.user_id = _user_id
      and ap.permission_key = _permission_key
      and (ap.expires_at is null or ap.expires_at > now())
  )
  or exists (
    select 1
    from public.admin_roles ar
    join public.role_permissions rp on rp.role_name = ar.role_name
    where ar.user_id = _user_id
      and rp.permission_key = _permission_key
      and (ar.expires_at is null or ar.expires_at > now())
  );
$$;

create or replace function public.user_mailbox_access(_user_id uuid, _mailbox_email text, _provider text default 'gmail')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_mailboxes am
    where am.user_id = _user_id
      and lower(am.mailbox_email) = lower(_mailbox_email)
      and lower(am.mailbox_provider) = lower(_provider)
      and am.status = 'active'
  )
  or public.user_has_permission(_user_id, 'admin:all');
$$;

insert into public.roles (name, display_name, description)
values
  ('super_admin', 'Super Admin', 'Full system access and mailbox control'),
  ('admin', 'Admin', 'Core administration access'),
  ('manager', 'Manager', 'Department-level visibility and operations'),
  ('team_leader', 'Team Leader', 'Scoped operational access'),
  ('associate', 'Associate', 'Limited operational access')
on conflict (name) do nothing;

insert into public.permissions (key, label, category, description)
values
  ('admin:all', 'All admin permissions', 'admin', 'Full unrestricted admin access'),
  ('admin:view_dashboard', 'View dashboard', 'admin', 'Access admin overview dashboard'),
  ('admin:view_properties', 'View properties', 'admin', 'Access property management'),
  ('admin:view_crm', 'View CRM', 'admin', 'Access CRM tools'),
  ('admin:view_users', 'View users', 'admin', 'Access user management'),
  ('admin:view_approvals', 'View approvals', 'admin', 'Access approvals hub'),
  ('admin:view_email_center', 'View email center', 'admin', 'Access email center'),
  ('admin:view_analytics', 'View analytics', 'admin', 'Access analytics dashboard'),
  ('admin:view_mlm_funnel', 'View MLM funnel', 'admin', 'Access MLM funnel dashboard'),
  ('admin:view_activity', 'View activity', 'admin', 'Access activity logs'),
  ('admin:view_content', 'View content', 'admin', 'Access content management'),
  ('admin:view_cms', 'View CMS', 'admin', 'Access CMS hub'),
  ('admin:view_other_payments', 'View other payments', 'admin', 'Access payments data'),
  ('admin:manage_permissions', 'Manage permissions', 'admin', 'Manage admin permissions'),
  ('admin:view_travels', 'View travels', 'admin', 'Access travel dashboard'),
  ('mailbox:read', 'Read mailbox', 'mailbox', 'Read messages in the mailbox'),
  ('mailbox:write', 'Write mailbox', 'mailbox', 'Send or update messages in the mailbox'),
  ('mailbox:sync', 'Sync mailbox', 'mailbox', 'Sync mailbox data from provider')
on conflict (key) do nothing;

insert into public.role_permissions (role_name, permission_key)
values
  ('super_admin', 'admin:all'),
  ('super_admin', 'admin:view_dashboard'),
  ('super_admin', 'admin:view_properties'),
  ('super_admin', 'admin:view_crm'),
  ('super_admin', 'admin:view_users'),
  ('super_admin', 'admin:view_approvals'),
  ('super_admin', 'admin:view_email_center'),
  ('super_admin', 'admin:view_analytics'),
  ('super_admin', 'admin:view_mlm_funnel'),
  ('super_admin', 'admin:view_activity'),
  ('super_admin', 'admin:view_content'),
  ('super_admin', 'admin:view_cms'),
  ('super_admin', 'admin:view_other_payments'),
  ('super_admin', 'admin:manage_permissions'),
  ('super_admin', 'admin:view_travels'),
  ('super_admin', 'mailbox:read'),
  ('super_admin', 'mailbox:write'),
  ('super_admin', 'mailbox:sync'),
  ('admin', 'admin:view_dashboard'),
  ('admin', 'admin:view_properties'),
  ('admin', 'admin:view_crm'),
  ('admin', 'admin:view_users'),
  ('admin', 'admin:view_approvals'),
  ('admin', 'admin:view_email_center'),
  ('admin', 'admin:view_analytics'),
  ('admin', 'admin:view_mlm_funnel'),
  ('admin', 'admin:view_activity'),
  ('admin', 'admin:view_content'),
  ('admin', 'admin:view_cms'),
  ('admin', 'admin:view_other_payments'),
  ('admin', 'mailbox:read'),
  ('admin', 'mailbox:write'),
  ('admin', 'mailbox:sync')
on conflict (role_name, permission_key) do nothing;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_roles enable row level security;
alter table public.admin_mailboxes enable row level security;
alter table public.email_sessions enable row level security;
alter table public.email_accounts enable row level security;
alter table public.mail_sync_status enable row level security;
alter table public.mail_tokens enable row level security;
alter table public.mail_settings enable row level security;

create policy if not exists "admin_roles_select_own" on public.admin_roles for select using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));
create policy if not exists "admin_roles_write_admins" on public.admin_roles for all using (public.user_has_permission(auth.uid(), 'admin:manage_permissions')) with check (public.user_has_permission(auth.uid(), 'admin:manage_permissions'));

create policy if not exists "admin_permissions_select_own" on public.admin_permissions for select using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));
create policy if not exists "admin_permissions_write_admins" on public.admin_permissions for all using (public.user_has_permission(auth.uid(), 'admin:manage_permissions')) with check (public.user_has_permission(auth.uid(), 'admin:manage_permissions'));

create policy if not exists "admin_mailboxes_access_own" on public.admin_mailboxes for select using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));
create policy if not exists "admin_mailboxes_write_own_or_admin" on public.admin_mailboxes for all using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions')) with check (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));

create policy if not exists "email_sessions_access_own" on public.email_sessions for select using (auth.uid() = user_id);
create policy if not exists "email_sessions_write_own" on public.email_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "email_accounts_access_own" on public.email_accounts for select using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));
create policy if not exists "email_accounts_write_own" on public.email_accounts for all using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions')) with check (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));

create policy if not exists "mail_sync_status_access_own" on public.mail_sync_status for select using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));
create policy if not exists "mail_sync_status_write_own" on public.mail_sync_status for all using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions')) with check (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));

create policy if not exists "mail_tokens_access_own" on public.mail_tokens for select using (auth.uid() = user_id);
create policy if not exists "mail_tokens_write_own" on public.mail_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "mail_settings_access_own" on public.mail_settings for select using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));
create policy if not exists "mail_settings_write_own" on public.mail_settings for all using (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions')) with check (auth.uid() = user_id or public.user_has_permission(auth.uid(), 'admin:manage_permissions'));

create policy if not exists "roles_read_authenticated" on public.roles for select using (auth.role() = 'authenticated');
create policy if not exists "permissions_read_authenticated" on public.permissions for select using (auth.role() = 'authenticated');
create policy if not exists "role_permissions_read_authenticated" on public.role_permissions for select using (auth.role() = 'authenticated');
