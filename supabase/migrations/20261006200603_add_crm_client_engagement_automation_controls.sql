create table if not exists public.automation_secrets (
  secret_name text primary key,
  secret_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.crm_automation_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_key text not null unique,
  name text not null,
  description text,
  category text not null default 'engagement',
  enabled boolean not null default false,
  schedule_time time not null default '08:00',
  timezone text not null default 'Africa/Lagos',
  cooldown_days integer not null default 365 check (cooldown_days >= 1),
  threshold_value integer,
  subject text not null,
  body text not null,
  audience_rules jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  last_run_status text,
  last_run_count integer not null default 0,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.automation_secrets enable row level security;
alter table public.crm_automation_campaigns enable row level security;
create policy "Admins can manage CRM automations" on public.crm_automation_campaigns
for all to authenticated
using (public.admin_has_permission('admin:view_email_center'))
with check (public.admin_has_permission('admin:view_email_center'));