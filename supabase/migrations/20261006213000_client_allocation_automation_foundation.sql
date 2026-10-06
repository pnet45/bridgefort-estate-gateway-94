-- Client allocation and possession foundation for CRM automation.
-- Applied to production before this repository migration record was committed.

create table if not exists public.client_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  estate_id uuid null references public.estate(id) on delete restrict,
  order_id uuid null references public.orders(id) on delete set null,
  property_id text null,
  plot_id text null,
  plot_label text null,
  estate_name_snapshot text not null,
  location_snapshot text null,
  allocation_status text not null default 'pending'
    check (allocation_status in ('pending','allocated','possession_ready','possessed','cancelled')),
  allocation_date timestamptz null,
  possession_date timestamptz null,
  allocation_letter_url text null,
  source_reference text null,
  notes text null,
  last_notified_status text null
    check (last_notified_status is null or last_notified_status in ('pending','allocated','possession_ready','possessed','cancelled')),
  last_notified_at timestamptz null,
  created_by uuid null references auth.users(id) on delete set null,
  updated_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_allocations_user_idx on public.client_allocations(user_id);
create index if not exists client_allocations_estate_plot_idx on public.client_allocations(estate_id, plot_id);
create index if not exists client_allocations_status_idx on public.client_allocations(allocation_status);
create index if not exists client_allocations_notification_idx on public.client_allocations(allocation_status, last_notified_status);

create unique index if not exists client_allocations_active_plot_unique
  on public.client_allocations(estate_id, plot_id)
  where estate_id is not null and plot_id is not null and allocation_status <> 'cancelled';

alter table public.client_allocations enable row level security;

drop policy if exists "Clients can view their allocations" on public.client_allocations;
create policy "Clients can view their allocations"
  on public.client_allocations for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Authorized admins can view allocations" on public.client_allocations;
create policy "Authorized admins can view allocations"
  on public.client_allocations for select to authenticated
  using (public.admin_has_permission('admin:view_allocations')
    or public.admin_has_permission('admin:manage_allocations')
    or public.admin_has_permission('admin:all'));

drop policy if exists "Authorized admins can insert allocations" on public.client_allocations;
create policy "Authorized admins can insert allocations"
  on public.client_allocations for insert to authenticated
  with check (public.admin_has_permission('admin:manage_allocations')
    or public.admin_has_permission('admin:all'));

drop policy if exists "Authorized admins can update allocations" on public.client_allocations;
create policy "Authorized admins can update allocations"
  on public.client_allocations for update to authenticated
  using (public.admin_has_permission('admin:manage_allocations')
    or public.admin_has_permission('admin:all'))
  with check (public.admin_has_permission('admin:manage_allocations')
    or public.admin_has_permission('admin:all'));

drop policy if exists "Authorized admins can delete allocations" on public.client_allocations;
create policy "Authorized admins can delete allocations"
  on public.client_allocations for delete to authenticated
  using (public.admin_has_permission('admin:manage_allocations')
    or public.admin_has_permission('admin:all'));

grant select, insert, update, delete on public.client_allocations to authenticated;

insert into public.role_permissions (role, permission_key, is_enabled)
select r.role, p.permission_key, true
from (values ('admin:view_allocations'), ('admin:manage_allocations')) p(permission_key)
cross join (select distinct role from public.role_permissions where role in
  ('super_admin','admin','manager','team_leader','admin_dir','admin_adm','admin_acct',
   'admin_sales','admin_cs','admin_legal','admin_it')) r
where not exists (
  select 1 from public.role_permissions rp
  where rp.role=r.role and rp.permission_key=p.permission_key
);

update public.crm_automation_campaigns
set enabled=true,
    last_run_status='ready_connected_to_client_allocations',
    body='Dear {{name}},' || chr(92) || 'n' || chr(92) || 'nThere is an important update regarding your Bridgefort Homes property at {{estate_name}}.' || chr(92) || 'n' || chr(92) || 'nProperty: {{estate_name}}' || chr(92) || 'nPlot: {{plot_id}}' || chr(92) || 'nStatus: {{status}}' || chr(92) || 'nAllocation date: {{allocation_date}}' || chr(92) || 'nPossession date: {{possession_date}}' || chr(92) || 'n' || chr(92) || 'n{{notes}}' || chr(92) || 'n' || chr(92) || 'nIf you need any clarification or assistance, please contact our Client Service Team.' || chr(92) || 'n' || chr(92) || 'nWarm regards,' || chr(92) || 'nBridgefort Homes Development Ltd.',
    audience_rules=jsonb_build_object('exclude_admins',true,'source_table','client_allocations','send_on_status_change',true),
    updated_at=now()
where campaign_key='allocation_update';
