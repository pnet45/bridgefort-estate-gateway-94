-- Fail-closed, admin-controlled email gate for legal transaction documents.
-- These controls only permit future sends; changing a switch never sends an email.
create table if not exists public.transaction_document_automation_controls (
  document_type text primary key check (document_type in ('contract_of_sale', 'deed_of_assignment')),
  enabled boolean not null default false,
  updated_by uuid null references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.transaction_document_automation_controls enable row level security;

drop policy if exists transaction_document_automation_controls_admin_select on public.transaction_document_automation_controls;
create policy transaction_document_automation_controls_admin_select
on public.transaction_document_automation_controls
for select to authenticated
using (
  public.user_has_permission((select auth.uid()), 'admin:manage_documentation')
  or public.user_has_permission((select auth.uid()), 'admin:all')
);

drop policy if exists transaction_document_automation_controls_admin_update on public.transaction_document_automation_controls;
create policy transaction_document_automation_controls_admin_update
on public.transaction_document_automation_controls
for update to authenticated
using (
  public.user_has_permission((select auth.uid()), 'admin:manage_documentation')
  or public.user_has_permission((select auth.uid()), 'admin:all')
)
with check (
  public.user_has_permission((select auth.uid()), 'admin:manage_documentation')
  or public.user_has_permission((select auth.uid()), 'admin:all')
);

grant select, update on public.transaction_document_automation_controls to authenticated;

insert into public.transaction_document_automation_controls (document_type, enabled)
values ('contract_of_sale', false), ('deed_of_assignment', false)
on conflict (document_type) do nothing;
