-- Central BMC identity KYC. This is independent of the legacy BH-Realtors
-- profile KYC fields and is the single verification source for all divisions.
-- This migration is source-controlled only until explicitly applied to Supabase.

create table if not exists public.bmc_identity_kyc (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'NOT_STARTED'
    check (status in ('NOT_STARTED','PENDING','UNDER_REVIEW','REQUIRES_CORRECTION','VERIFIED','REJECTED')),
  identity_data jsonb not null default '{}'::jsonb,
  documents jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmc_identity_kyc_identity_object check (jsonb_typeof(identity_data) = 'object'),
  constraint bmc_identity_kyc_documents_object check (jsonb_typeof(documents) = 'object')
);

create index if not exists bmc_identity_kyc_status_submitted_idx
  on public.bmc_identity_kyc(status, submitted_at desc);

alter table public.bmc_identity_kyc enable row level security;
revoke all on public.bmc_identity_kyc from anon, authenticated;
grant select on public.bmc_identity_kyc to authenticated;

drop policy if exists "BMCs can read their own central KYC status" on public.bmc_identity_kyc;
create policy "BMCs can read their own central KYC status"
  on public.bmc_identity_kyc for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Authorized admins can read central BMC KYC" on public.bmc_identity_kyc;
create policy "Authorized admins can read central BMC KYC"
  on public.bmc_identity_kyc for select to authenticated
  using (
    public.user_has_permission((select auth.uid()), 'admin:manage_bmc_partners'::text)
    or public.user_has_permission((select auth.uid()), 'admin:all'::text)
  );

create table if not exists public.bmc_identity_kyc_audit (
  id uuid primary key default gen_random_uuid(),
  kyc_id uuid not null references public.bmc_identity_kyc(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('submitted','resubmitted','under_review','approved','rejected','correction_requested')),
  previous_status text,
  new_status text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists bmc_identity_kyc_audit_user_idx
  on public.bmc_identity_kyc_audit(user_id, created_at desc);

alter table public.bmc_identity_kyc_audit enable row level security;
revoke all on public.bmc_identity_kyc_audit from public, anon, authenticated;
grant select on public.bmc_identity_kyc_audit to authenticated;

drop policy if exists "Authorized admins can read central BMC KYC audit" on public.bmc_identity_kyc_audit;
create policy "Authorized admins can read central BMC KYC audit"
  on public.bmc_identity_kyc_audit for select to authenticated
  using (
    public.user_has_permission((select auth.uid()), 'admin:manage_bmc_partners'::text)
    or public.user_has_permission((select auth.uid()), 'admin:all'::text)
  );

-- Import the existing BH-Realtors KYC state once, preserving already verified
-- partners. No legacy profile or document is deleted by this backfill.
insert into public.bmc_identity_kyc
  (user_id, status, identity_data, documents, submitted_at, reviewed_at)
select
  p.id,
  case
    when p.kyc_status = 'VERIFIED' then 'VERIFIED'
    when p.kyc_status = 'PENDING' then 'PENDING'
    when p.kyc_status = 'REQUIRES_CORRECTION' then 'REQUIRES_CORRECTION'
    else 'NOT_STARTED'
  end,
  jsonb_strip_nulls(jsonb_build_object(
    'first_name', p.first_name,
    'last_name', p.last_name,
    'date_of_birth', p.date_of_birth,
    'gender', p.gender,
    'nationality', p.nationality,
    'phone_number', p.phone_number,
    'address', coalesce(p.current_residence, p.address),
    'id_type', p.id_type,
    'id_number', p.id_number,
    'id_country_of_issue', p.id_country_of_issue,
    'id_date_of_issue', p.id_date_of_issue,
    'id_expiry', p.id_expiry,
    'id_issuing_authority', p.id_issuing_authority
  )),
  case when jsonb_typeof(p.kyc_docs) = 'object' then p.kyc_docs else '{}'::jsonb end,
  case when p.kyc_status in ('PENDING','VERIFIED','REQUIRES_CORRECTION') then p.updated_at else null end,
  case when p.kyc_status = 'VERIFIED' then p.updated_at else null end
from public.profiles p
where p.is_pbo is true
on conflict (user_id) do nothing;

create or replace function public.get_my_bmc_identity_kyc_status()
returns table (status text, submitted_at timestamptz, reviewed_at timestamptz, review_note text)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  return query
  select k.status, k.submitted_at, k.reviewed_at, k.review_note
  from public.bmc_identity_kyc k
  where k.user_id = auth.uid();
  if not found then
    return query select 'NOT_STARTED'::text, null::timestamptz, null::timestamptz, null::text;
  end if;
end;
$function$;

revoke all on function public.get_my_bmc_identity_kyc_status() from public, anon;
grant execute on function public.get_my_bmc_identity_kyc_status() to authenticated;

create or replace function public.submit_my_bmc_identity_kyc(
  _identity_data jsonb,
  _documents jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor uuid := auth.uid();
  current_status text;
  next_status text := 'PENDING';
  kyc_row_id uuid;
  required_key text;
  required_value text;
  document_key text;
  document_path text;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if not (
    exists (select 1 from public.profiles p where p.id = actor and p.is_pbo is true)
    or exists (select 1 from public.bmc_partner_divisions d where d.user_id = actor)
  ) then
    raise exception 'A registered BMC account is required to submit central KYC';
  end if;
  if jsonb_typeof(_identity_data) is distinct from 'object'
     or jsonb_typeof(_documents) is distinct from 'object' then
    raise exception 'Valid identity details and document references are required';
  end if;

  foreach required_key in array array['first_name','last_name','date_of_birth','nationality','address','id_type','id_number'] loop
    required_value := nullif(trim(coalesce(_identity_data ->> required_key, '')), '');
    if required_value is null then
      raise exception 'Missing required identity field: %', required_key;
    end if;
  end loop;

  foreach document_key in array array['passport_photo','identity_document'] loop
    document_path := nullif(trim(coalesce(_documents -> document_key ->> 'path', _documents -> document_key ->> 'url', _documents ->> document_key, '')), '');
    if document_path is null or document_path not like actor::text || '/%' then
      raise exception 'Upload a valid % document to your private KYC folder', document_key;
    end if;
  end loop;

  select k.status, k.id into current_status, kyc_row_id
  from public.bmc_identity_kyc k
  where k.user_id = actor
  for update;

  if current_status = 'VERIFIED' then
    raise exception 'Your central BMC identity is already verified';
  end if;

  insert into public.bmc_identity_kyc
    (user_id, status, identity_data, documents, submitted_at, reviewed_at, reviewed_by, review_note)
  values
    (actor, next_status, _identity_data, _documents, now(), null, null, null)
  on conflict (user_id) do update
    set status = 'PENDING',
        identity_data = excluded.identity_data,
        documents = excluded.documents,
        submitted_at = now(),
        reviewed_at = null,
        reviewed_by = null,
        review_note = null,
        updated_at = now()
  returning id into kyc_row_id;

  insert into public.bmc_identity_kyc_audit
    (kyc_id, user_id, action, previous_status, new_status, actor_user_id)
  values
    (kyc_row_id, actor,
     case when current_status is null or current_status = 'NOT_STARTED' then 'submitted' else 'resubmitted' end,
     current_status, 'PENDING', actor);

  return 'PENDING';
end;
$function$;

revoke all on function public.submit_my_bmc_identity_kyc(jsonb, jsonb) from public, anon;
grant execute on function public.submit_my_bmc_identity_kyc(jsonb, jsonb) to authenticated;

create or replace function public.admin_list_bmc_identity_kyc()
returns table (
  kyc_id uuid,
  user_id uuid,
  email text,
  status text,
  identity_data jsonb,
  documents jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  review_note text
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not (
    public.user_has_permission(auth.uid(), 'admin:manage_bmc_partners'::text)
    or public.user_has_permission(auth.uid(), 'admin:all'::text)
  ) then
    raise exception 'BMC KYC review permission required';
  end if;

  return query
  select k.id, k.user_id, u.email::text, k.status, k.identity_data,
         k.documents, k.submitted_at, k.reviewed_at, k.reviewed_by, k.review_note
  from public.bmc_identity_kyc k
  join auth.users u on u.id = k.user_id
  where k.status <> 'NOT_STARTED'
  order by case k.status when 'PENDING' then 0 when 'UNDER_REVIEW' then 1 else 2 end,
           k.submitted_at desc nulls last;
end;
$function$;

revoke all on function public.admin_list_bmc_identity_kyc() from public, anon;
grant execute on function public.admin_list_bmc_identity_kyc() to authenticated;

create or replace function public.admin_review_bmc_identity_kyc(
  _kyc_id uuid,
  _decision text,
  _reason text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor uuid := auth.uid();
  target public.bmc_identity_kyc;
  next_status text;
  next_action text;
begin
  if actor is null or not (
    public.user_has_permission(actor, 'admin:manage_bmc_partners'::text)
    or public.user_has_permission(actor, 'admin:all'::text)
  ) then
    raise exception 'BMC KYC review permission required';
  end if;

  next_status := case lower(trim(coalesce(_decision,'')))
    when 'approve' then 'VERIFIED'
    when 'reject' then 'REJECTED'
    when 'request_correction' then 'REQUIRES_CORRECTION'
    when 'under_review' then 'UNDER_REVIEW'
    else null
  end;
  if next_status is null then raise exception 'Invalid KYC review decision'; end if;
  if next_status <> 'VERIFIED' and coalesce(length(trim(_reason)),0) < 5 then
    raise exception 'A clear review reason is required for this decision';
  end if;

  select * into target
  from public.bmc_identity_kyc
  where id = _kyc_id
  for update;
  if not found then raise exception 'BMC KYC submission not found'; end if;
  if target.status = 'VERIFIED' then raise exception 'Verified BMC KYC cannot be changed through this review action'; end if;
  if target.status not in ('PENDING','UNDER_REVIEW') then raise exception 'Only submitted BMC KYC records can be reviewed'; end if;

  update public.bmc_identity_kyc
  set status = next_status,
      reviewed_at = now(),
      reviewed_by = actor,
      review_note = nullif(trim(_reason),''),
      updated_at = now()
  where id = _kyc_id;

  next_action := case next_status
    when 'VERIFIED' then 'approved'
    when 'REJECTED' then 'rejected'
    when 'REQUIRES_CORRECTION' then 'correction_requested'
    else 'under_review'
  end;
  insert into public.bmc_identity_kyc_audit
    (kyc_id, user_id, action, previous_status, new_status, actor_user_id, reason)
  values
    (_kyc_id, target.user_id, next_action, target.status, next_status, actor, nullif(trim(_reason),''));

  return next_status;
end;
$function$;

revoke all on function public.admin_review_bmc_identity_kyc(uuid, text, text) from public, anon;
grant execute on function public.admin_review_bmc_identity_kyc(uuid, text, text) to authenticated;

-- Admins can inspect private KYC files only with the dedicated BMC review
-- permission. The bucket remains private; no public read policy is introduced.
drop policy if exists "Authorized BMC KYC reviewers can view KYC documents" on storage.objects;
create policy "Authorized BMC KYC reviewers can view KYC documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (
      public.user_has_permission((select auth.uid()), 'admin:manage_bmc_partners'::text)
      or public.user_has_permission((select auth.uid()), 'admin:all'::text)
    )
  );

-- The withdrawal RPC remains atomic: it first checks central BMC identity KYC,
-- then delegates to the existing locked-wallet implementation.
alter function private.submit_withdrawal_request(uuid,numeric,text,text,text)
  rename to submit_withdrawal_request_pre_bmc_kyc;

create or replace function private.submit_withdrawal_request(
  p_user_id uuid,
  p_amount numeric,
  p_bank_name text,
  p_account_number text,
  p_account_name text
)
returns public.withdrawal_requests
language plpgsql
security definer
set search_path = 'public'
as $function$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'You can only submit a withdrawal for your own account';
  end if;
  if not exists (
    select 1 from public.bmc_identity_kyc k
    where k.user_id = p_user_id and k.status = 'VERIFIED'
  ) then
    raise exception 'Complete central BMC identity verification before requesting a withdrawal';
  end if;
  return private.submit_withdrawal_request_pre_bmc_kyc(
    p_user_id, p_amount, p_bank_name, p_account_number, p_account_name
  );
end;
$function$;

revoke all on function private.submit_withdrawal_request(uuid,numeric,text,text,text) from public, anon;
grant execute on function private.submit_withdrawal_request(uuid,numeric,text,text,text) to authenticated;
