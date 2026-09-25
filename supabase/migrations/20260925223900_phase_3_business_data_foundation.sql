-- Phase 3 business/data foundation
-- Functions in this migration explicitly pin search_path for security.

create table if not exists public.service_journeys (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  service_type text not null check (service_type in ('PROPERTY','INSPECTION','TRAVEL','AGROVEST','TRAINING','WEALTH_CONSULTATION','GENERAL_ENQUIRY')),
  status text not null default 'NEW',
  priority text not null default 'NORMAL' check (priority in ('LOW','NORMAL','HIGH','URGENT')),
  source text, assigned_to uuid references auth.users(id) on delete set null,
  estate_id uuid references public.estate(id) on delete set null,
  listing_id uuid, travel_booking_id uuid, order_id uuid,
  source_record_type text, source_record_id uuid, outcome text, outcome_value numeric, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_service_journeys_customer on public.service_journeys(customer_id);
create index if not exists idx_service_journeys_lead on public.service_journeys(lead_id);
create index if not exists idx_service_journeys_assigned on public.service_journeys(assigned_to);
create index if not exists idx_service_journeys_type_status on public.service_journeys(service_type,status);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.crm_leads(id) on delete cascade,
  journey_id uuid references public.service_journeys(id) on delete cascade,
  activity_type text not null, subject text, notes text, outcome text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_crm_activities_lead on public.crm_activities(lead_id);
create index if not exists idx_crm_activities_journey on public.crm_activities(journey_id);

alter table public.travel_bookings
  add column if not exists customer_id uuid references public.profiles(id) on delete set null,
  add column if not exists crm_lead_id uuid references public.crm_leads(id) on delete set null,
  add column if not exists service_journey_id uuid references public.service_journeys(id) on delete set null,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null;
create index if not exists idx_travel_bookings_customer on public.travel_bookings(customer_id);
create index if not exists idx_travel_bookings_crm_lead on public.travel_bookings(crm_lead_id);
create index if not exists idx_travel_bookings_journey on public.travel_bookings(service_journey_id);

alter table public.profiles
  add column if not exists profile_status text not null default 'DRAFT',
  add column if not exists kyc_status text not null default 'NOT_STARTED';
alter table public.profiles drop constraint if exists profiles_profile_status_check;
alter table public.profiles add constraint profiles_profile_status_check check (profile_status in ('DRAFT','IN_PROGRESS','COMPLETE','KYC_PENDING','KYC_VERIFIED','KYC_REQUIRES_CORRECTION'));
alter table public.profiles drop constraint if exists profiles_kyc_status_check;
alter table public.profiles add constraint profiles_kyc_status_check check (kyc_status in ('NOT_STARTED','PENDING','VERIFIED','REQUIRES_CORRECTION'));

create or replace function public.calculate_profile_completion(p_profile_id uuid)
returns integer language sql stable security invoker as $$
with p as (select * from public.profiles where id=p_profile_id),
checks as (
 select (nullif(trim(first_name),'') is not null)::int+(nullif(trim(last_name),'') is not null)::int+
 (date_of_birth is not null)::int+(nullif(trim(gender),'') is not null)::int+
 (nullif(trim(phone_number),'') is not null)::int+(nullif(trim(nationality),'') is not null)::int+
 (nullif(trim(address),'') is not null)::int+(nullif(trim(current_residence),'') is not null)::int+
 (nullif(trim(occupation),'') is not null)::int+(nullif(trim(next_of_kin_name),'') is not null)::int+
 (nullif(trim(next_of_kin_phone),'') is not null)::int+(terms_accepted is true)::int as completed,12 as total from p)
select coalesce(round((completed::numeric/nullif(total,0))*100),0)::int from checks;
$$;

create or replace function public.refresh_profile_completion()
returns trigger language plpgsql security invoker as $$
declare pct integer;
begin
 pct:=public.calculate_profile_completion(new.id);
 new.profile_completion_percentage:=pct; new.profile_completed:=pct>=100;
 if new.profile_completed then
   if new.kyc_status='VERIFIED' then new.profile_status:='KYC_VERIFIED';
   elsif new.kyc_status='PENDING' then new.profile_status:='KYC_PENDING';
   elsif new.kyc_status='REQUIRES_CORRECTION' then new.profile_status:='KYC_REQUIRES_CORRECTION';
   else new.profile_status:='COMPLETE'; end if;
 elsif pct>0 then new.profile_status:='IN_PROGRESS'; else new.profile_status:='DRAFT'; end if;
 return new;
end; $$;
drop trigger if exists trg_refresh_profile_completion on public.profiles;
create trigger trg_refresh_profile_completion before insert or update of first_name,last_name,date_of_birth,gender,phone_number,nationality,address,current_residence,occupation,next_of_kin_name,next_of_kin_phone,terms_accepted,kyc_status on public.profiles for each row execute function public.refresh_profile_completion();

update public.profiles p
set profile_completion_percentage=public.calculate_profile_completion(p.id),
    profile_completed=public.calculate_profile_completion(p.id)>=100,
    profile_status=case when public.calculate_profile_completion(p.id)>=100 then case when p.kyc_status='VERIFIED' then 'KYC_VERIFIED' when p.kyc_status='PENDING' then 'KYC_PENDING' when p.kyc_status='REQUIRES_CORRECTION' then 'KYC_REQUIRES_CORRECTION' else 'COMPLETE' end when public.calculate_profile_completion(p.id)>0 then 'IN_PROGRESS' else 'DRAFT' end;

create or replace function public.sync_travel_booking_to_crm()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_customer_id uuid; v_lead_id uuid; v_journey_id uuid;
begin
 select p.id into v_customer_id from public.profiles p join auth.users u on u.id=p.id where lower(u.email)=lower(new.email) limit 1;
 select id into v_lead_id from public.crm_leads where lower(email)=lower(new.email) and (phone=new.phone or phone is null) order by created_at desc limit 1;
 if v_lead_id is null then
   insert into public.crm_leads(name,email,phone,source,status,customer_id,source_record_type,source_record_id,priority,notes)
   values(new.name,new.email,new.phone,'TRAVEL','new',v_customer_id,'travel_booking',new.id,'medium',new.notes) returning id into v_lead_id;
 else
   update public.crm_leads set customer_id=coalesce(customer_id,v_customer_id),source_record_type='travel_booking',source_record_id=new.id,updated_at=now() where id=v_lead_id;
 end if;
 v_journey_id:=new.service_journey_id;
 if v_journey_id is null then
   insert into public.service_journeys(customer_id,lead_id,service_type,status,priority,source,assigned_to,travel_booking_id,source_record_type,source_record_id,notes)
   values(v_customer_id,v_lead_id,'TRAVEL',case lower(new.status) when 'new' then 'NEW' when 'reviewing' then 'REVIEWING' when 'quotation' then 'QUOTATION' when 'customer_confirmation' then 'CUSTOMER_CONFIRMATION' when 'payment_pending' then 'PAYMENT_PENDING' when 'processing' then 'PROCESSING' when 'confirmed' then 'CONFIRMED' when 'completed' then 'COMPLETED' when 'cancelled' then 'CANCELLED' when 'declined' then 'DECLINED' when 'expired' then 'EXPIRED' else 'NEW' end,'NORMAL','TRAVEL',new.assigned_to,new.id,'travel_booking',new.id,concat('Destination: ',coalesce(new.destination,''),' | Package: ',coalesce(new.package,''))) returning id into v_journey_id;
   insert into public.crm_activities(lead_id,journey_id,activity_type,subject,notes,created_by) values(v_lead_id,v_journey_id,'TRAVEL_BOOKING_CREATED','Travel booking received',new.notes,new.assigned_to);
 else
   update public.service_journeys set customer_id=coalesce(customer_id,v_customer_id),lead_id=coalesce(lead_id,v_lead_id),status=case lower(new.status) when 'new' then 'NEW' when 'reviewing' then 'REVIEWING' when 'quotation' then 'QUOTATION' when 'customer_confirmation' then 'CUSTOMER_CONFIRMATION' when 'payment_pending' then 'PAYMENT_PENDING' when 'processing' then 'PROCESSING' when 'confirmed' then 'CONFIRMED' when 'completed' then 'COMPLETED' when 'cancelled' then 'CANCELLED' when 'declined' then 'DECLINED' when 'expired' then 'EXPIRED' else status end,assigned_to=coalesce(new.assigned_to,assigned_to),updated_at=now() where id=v_journey_id;
 end if;
 new.customer_id:=coalesce(new.customer_id,v_customer_id); new.crm_lead_id:=coalesce(new.crm_lead_id,v_lead_id); new.service_journey_id:=v_journey_id; return new;
end; $$;
revoke execute on function public.sync_travel_booking_to_crm() from public,anon,authenticated;
drop trigger if exists trg_sync_travel_booking_to_crm on public.travel_bookings;
create trigger trg_sync_travel_booking_to_crm before insert or update of name,email,phone,status,notes,assigned_to on public.travel_bookings for each row execute function public.sync_travel_booking_to_crm();

alter table public.service_journeys enable row level security;
alter table public.crm_activities enable row level security;
drop policy if exists "service_journeys_authenticated_read" on public.service_journeys;
create policy "service_journeys_authenticated_read" on public.service_journeys for select to authenticated using (customer_id=(select auth.uid()) or assigned_to=(select auth.uid()) or public.user_has_permission((select auth.uid()),'crm.view') or public.user_has_permission((select auth.uid()),'admin:view_crm'));
drop policy if exists "service_journeys_staff_write" on public.service_journeys;
create policy "service_journeys_staff_write" on public.service_journeys for all to authenticated using (customer_id=(select auth.uid()) or assigned_to=(select auth.uid()) or public.user_has_permission((select auth.uid()),'crm.edit') or public.user_has_permission((select auth.uid()),'admin:all')) with check (customer_id=(select auth.uid()) or assigned_to=(select auth.uid()) or public.user_has_permission((select auth.uid()),'crm.edit') or public.user_has_permission((select auth.uid()),'admin:all'));
drop policy if exists "crm_activities_authenticated_read" on public.crm_activities;
create policy "crm_activities_authenticated_read" on public.crm_activities for select to authenticated using (created_by=(select auth.uid()) or public.user_has_permission((select auth.uid()),'crm.view') or public.user_has_permission((select auth.uid()),'admin:view_crm'));
drop policy if exists "crm_activities_authenticated_write" on public.crm_activities;
create policy "crm_activities_authenticated_write" on public.crm_activities for insert to authenticated with check (created_by=(select auth.uid()) and (public.user_has_permission((select auth.uid()),'crm.edit') or public.user_has_permission((select auth.uid()),'admin:all')));

create table if not exists public.business_audit_log (
 id uuid primary key default gen_random_uuid(), actor_user_id uuid references auth.users(id) on delete set null,
 entity_type text not null, entity_id uuid not null, action text not null, previous_state text, new_state text,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists idx_business_audit_entity on public.business_audit_log(entity_type,entity_id,created_at desc);
create index if not exists idx_business_audit_actor on public.business_audit_log(actor_user_id,created_at desc);
alter table public.business_audit_log enable row level security;
drop policy if exists "business_audit_admin_read" on public.business_audit_log;
create policy "business_audit_admin_read" on public.business_audit_log for select to authenticated using (actor_user_id=(select auth.uid()) or public.user_has_permission((select auth.uid()),'reports.view') or public.user_has_permission((select auth.uid()),'admin:view_activity'));
create or replace function public.audit_business_state_change()
returns trigger language plpgsql security definer set search_path=public as $$
declare old_state text; new_state text; entity text; action_name text;
begin
 entity:=tg_table_name;
 if tg_table_name='service_journeys' then old_state:=old.status; new_state:=new.status; action_name:='STATUS_CHANGED';
 elsif tg_table_name='travel_bookings' then old_state:=old.status; new_state:=new.status; action_name:='STATUS_CHANGED';
 elsif tg_table_name='profiles' then old_state:=old.profile_status||'/'||old.kyc_status; new_state:=new.profile_status||'/'||new.kyc_status; action_name:='PROFILE_STATE_CHANGED';
 else return new; end if;
 if old_state is distinct from new_state then insert into public.business_audit_log(actor_user_id,entity_type,entity_id,action,previous_state,new_state) values((select auth.uid()),entity,new.id,action_name,old_state,new_state); end if;
 return new;
end; $$;
revoke execute on function public.audit_business_state_change() from public,anon,authenticated;
drop trigger if exists trg_audit_service_journey_state on public.service_journeys;
create trigger trg_audit_service_journey_state after update of status on public.service_journeys for each row execute function public.audit_business_state_change();
drop trigger if exists trg_audit_travel_booking_state on public.travel_bookings;
create trigger trg_audit_travel_booking_state after update of status on public.travel_bookings for each row execute function public.audit_business_state_change();
drop trigger if exists trg_audit_profile_state on public.profiles;
create trigger trg_audit_profile_state after update of profile_status,kyc_status on public.profiles for each row execute function public.audit_business_state_change();

-- Security hardening for the two invoker functions above.
alter function public.calculate_profile_completion(uuid) set search_path=public;
alter function public.refresh_profile_completion() set search_path=public;
