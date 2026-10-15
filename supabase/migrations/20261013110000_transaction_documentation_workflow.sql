-- Transaction documentation workflow: eligibility, private files, templates, and service journey support.
create table if not exists public.transaction_document_templates (
  id uuid primary key default gen_random_uuid(),
  document_type text not null unique check (document_type in ('contract_of_sale','survey_plan','plot_demarcation','deed_of_assignment')),
  name text not null,
  subject_template text not null,
  body_html_template text not null,
  enabled boolean not null default true,
  updated_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transaction_documents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  document_type text not null check (document_type in ('contract_of_sale','survey_plan','plot_demarcation','deed_of_assignment')),
  storage_path text not null,
  file_name text not null,
  status text not null default 'sent' check (status in ('sent','failed')),
  sent_by uuid null references auth.users(id) on delete set null,
  sent_at timestamptz not null default now(),
  provider_message_id text null,
  created_at timestamptz not null default now()
);

create index if not exists transaction_documents_order_idx on public.transaction_documents(order_id, document_type, sent_at desc);
create index if not exists transaction_documents_user_idx on public.transaction_documents(user_id, sent_at desc);

alter table public.transaction_document_templates enable row level security;
alter table public.transaction_documents enable row level security;

drop policy if exists transaction_document_templates_admin_select on public.transaction_document_templates;
create policy transaction_document_templates_admin_select on public.transaction_document_templates
for select to authenticated
using (public.user_has_permission((select auth.uid()), 'admin:view_documentation') or public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all'));

drop policy if exists transaction_document_templates_admin_manage on public.transaction_document_templates;
create policy transaction_document_templates_admin_manage on public.transaction_document_templates
for all to authenticated
using (public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all'))
with check (public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all'));

drop policy if exists transaction_documents_admin_select on public.transaction_documents;
create policy transaction_documents_admin_select on public.transaction_documents
for select to authenticated
using (public.user_has_permission((select auth.uid()), 'admin:view_documentation') or public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all'));

grant select on public.transaction_documents to authenticated;
grant select, insert, update on public.transaction_document_templates to authenticated;

-- Give users with explicit documentation permissions the read access needed by the queue.
drop policy if exists orders_documentation_admin_select on public.orders;
create policy orders_documentation_admin_select on public.orders
for select to authenticated
using (public.user_has_permission((select auth.uid()), 'admin:view_documentation') or public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all'));

drop policy if exists estate_doc_payments_documentation_admin_select on public.estate_documentation_payments;
create policy estate_doc_payments_documentation_admin_select on public.estate_documentation_payments
for select to authenticated
using (public.user_has_permission((select auth.uid()), 'admin:view_documentation') or public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all'));

drop policy if exists profiles_documentation_admin_select on public.profiles;
create policy profiles_documentation_admin_select on public.profiles
for select to authenticated
using (
  public.user_has_permission((select auth.uid()), 'admin:manage_documentation')
  or public.user_has_permission((select auth.uid()), 'admin:all')
  or (
    public.user_has_permission((select auth.uid()), 'admin:view_documentation')
    and exists (
      select 1 from public.orders o
      where o.user_id = profiles.id
    )
  )
);

drop policy if exists users_documentation_admin_select on public.users;
create policy users_documentation_admin_select on public.users
for select to authenticated
using (
  public.user_has_permission((select auth.uid()), 'admin:manage_documentation')
  or public.user_has_permission((select auth.uid()), 'admin:all')
  or (
    public.user_has_permission((select auth.uid()), 'admin:view_documentation')
    and exists (
      select 1 from public.orders o
      where o.user_id = users.id
    )
  )
);

insert into public.permissions (key, label, category, description)
values
  ('admin:view_documentation', 'View Transaction Documentation', 'admin', 'View payment-eligible client documentation and delivery history.'),
  ('admin:manage_documentation', 'Manage Transaction Documentation', 'admin', 'Manage document templates, upload PDFs, and send approved transaction documents.')
on conflict (key) do update set label=excluded.label, category=excluded.category, description=excluded.description, updated_at=now();

-- Staff roles can view the queue; document issuing and legal template management are restricted.
insert into public.role_permissions (role, permission_key, is_enabled)
select roles.role, 'admin:view_documentation', true
from (values ('super_admin'),('admin'),('manager'),('admin_dir'),('admin_adm'),('admin_acct'),('admin_sales'),('admin_cs'),('admin_legal')) as roles(role)
where not exists (
  select 1 from public.role_permissions rp
  where rp.role=roles.role and rp.permission_key='admin:view_documentation'
);

insert into public.role_permissions (role, permission_key, is_enabled)
select roles.role, 'admin:manage_documentation', true
from (values ('super_admin'),('admin'),('admin_dir'),('admin_adm'),('admin_acct'),('admin_legal')) as roles(role)
where not exists (
  select 1 from public.role_permissions rp
  where rp.role=roles.role and rp.permission_key='admin:manage_documentation'
);

insert into public.transaction_document_templates (document_type, name, subject_template, body_html_template, enabled)
values
('contract_of_sale','Contract of Sale','Your Contract of Sale – {{property_name}}','<h1>Contract of Sale</h1><p>Dear {{client_name}},</p><p>Please find your Contract of Sale details for <strong>{{property_name}}</strong>.</p><p>Property address: {{property_address}}</p><p>Plot count: {{plot_count}}</p><p>Plot size: {{plot_size}}</p><p>Purchase price: {{purchase_price}}</p><p>Amount paid: {{amount_paid}}</p><p>Order reference: {{order_reference}}</p><p>Date: {{document_date}}</p><p>Warm regards,<br/>Bridgefort Homes Development Ltd</p>', false),
('survey_plan','Survey Plan','Your Survey Plan – {{property_name}}','<h1>Survey Plan</h1><p>Dear {{client_name}},</p><p>Survey documentation for <strong>{{property_name}}</strong>.</p><p>Property address: {{property_address}}</p><p>Plot count: {{plot_count}}</p><p>Plot size: {{plot_size}}</p><p>Order reference: {{order_reference}}</p><p>Date: {{document_date}}</p><p>Bridgefort Homes Development Ltd</p>', false),
('plot_demarcation','Plot Demarcation','Plot Demarcation Update – {{property_name}}','<h1>Plot Demarcation</h1><p>Dear {{client_name}},</p><p>Plot demarcation record for <strong>{{property_name}}</strong>.</p><p>Property address: {{property_address}}</p><p>Plot count: {{plot_count}}</p><p>Plot size: {{plot_size}}</p><p>Order reference: {{order_reference}}</p><p>Date: {{document_date}}</p><p>Bridgefort Homes Development Ltd</p>', false),
('deed_of_assignment','Deed of Assignment','Your Deed of Assignment – {{property_name}}','<h1>Deed of Assignment</h1><p>Dear {{client_name}},</p><p>Deed of Assignment documentation for <strong>{{property_name}}</strong>.</p><p>Property address: {{property_address}}</p><p>Plot count: {{plot_count}}</p><p>Plot size: {{plot_size}}</p><p>Purchase price: {{purchase_price}}</p><p>Amount paid: {{amount_paid}}</p><p>Order reference: {{order_reference}}</p><p>Date: {{document_date}}</p><p>Bridgefort Homes Development Ltd</p>', false)
on conflict (document_type) do nothing;

-- Documentation journeys are linked to the purchasing customer and order.
alter table public.service_journeys drop constraint if exists service_journeys_service_type_check;
alter table public.service_journeys add constraint service_journeys_service_type_check
check (service_type = any (array['PROPERTY','INSPECTION','TRAVEL','AGROVEST','TRAINING','WEALTH_CONSULTATION','GENERAL_ENQUIRY','DOCUMENTATION']));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('transaction-documents','transaction-documents',false,10485760,array['application/pdf'])
on conflict (id) do update set public=false, file_size_limit=10485760, allowed_mime_types=array['application/pdf'];

drop policy if exists transaction_documents_storage_admin_select on storage.objects;
create policy transaction_documents_storage_admin_select on storage.objects
for select to authenticated
using (bucket_id='transaction-documents' and (public.user_has_permission((select auth.uid()), 'admin:view_documentation') or public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all')));

drop policy if exists transaction_documents_storage_admin_insert on storage.objects;
create policy transaction_documents_storage_admin_insert on storage.objects
for insert to authenticated
with check (bucket_id='transaction-documents' and (public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all')));

drop policy if exists transaction_documents_storage_admin_update on storage.objects;
create policy transaction_documents_storage_admin_update on storage.objects
for update to authenticated
using (bucket_id='transaction-documents' and (public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all')))
with check (bucket_id='transaction-documents' and (public.user_has_permission((select auth.uid()), 'admin:manage_documentation') or public.user_has_permission((select auth.uid()), 'admin:all')));
