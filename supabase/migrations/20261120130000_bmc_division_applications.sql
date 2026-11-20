-- BMC division applications are kept separate from the legacy BH-Realtors
-- profile/referral fields. One auth user remains the single BMC identity;
-- each selected division has its own independent approval state.
create table if not exists public.bmc_partner_divisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  division text not null check (division in ('homes', 'travels', 'agrovest')),
  application_status text not null default 'pending_review'
    check (application_status in ('pending_review', 'legacy_existing', 'approved', 'rejected', 'suspended', 'withdrawn')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmc_partner_divisions_user_division_unique unique (user_id, division),
  constraint bmc_partner_divisions_review_state_check check (
    (application_status in ('pending_review', 'legacy_existing') and reviewed_at is null)
    or (application_status in ('approved', 'rejected', 'suspended', 'withdrawn') and reviewed_at is not null)
  )
);

-- Preserve existing BH-Realtors partners in the unified model without
-- assuming that their old membership flag grants approval in new divisions.
-- Their original profile, referral code, sponsor and activity fields remain intact.
insert into public.bmc_partner_divisions (user_id, division, application_status, requested_at)
select p.id, 'homes', 'legacy_existing', coalesce(p.created_at, now())
from public.profiles p
where p.is_pbo is true
on conflict (user_id, division) do nothing;

create index if not exists bmc_partner_divisions_division_status_idx
  on public.bmc_partner_divisions(division, application_status, requested_at desc);
create index if not exists bmc_partner_divisions_user_idx
  on public.bmc_partner_divisions(user_id, created_at desc);

alter table public.bmc_partner_divisions enable row level security;
revoke all on public.bmc_partner_divisions from anon, authenticated;
grant select on public.bmc_partner_divisions to authenticated;
grant update (application_status, reviewed_at, updated_at) on public.bmc_partner_divisions to authenticated;

drop policy if exists "BMCs can read their own division applications" on public.bmc_partner_divisions;
create policy "BMCs can read their own division applications"
  on public.bmc_partner_divisions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "BMC approvers can review division applications" on public.bmc_partner_divisions;
create policy "BMC approvers can review division applications"
  on public.bmc_partner_divisions
  for select
  to authenticated
  using ((public.user_has_permission((select auth.uid()), 'admin:view_approvals'::text) or public.user_has_permission((select auth.uid()), 'admin:all'::text)));

drop policy if exists "BMC approvers can update division application status" on public.bmc_partner_divisions;
create policy "BMC approvers can update division application status"
  on public.bmc_partner_divisions
  for update
  to authenticated
  using ((public.user_has_permission((select auth.uid()), 'admin:view_approvals'::text) or public.user_has_permission((select auth.uid()), 'admin:all'::text)))
  with check ((public.user_has_permission((select auth.uid()), 'admin:view_approvals'::text) or public.user_has_permission((select auth.uid()), 'admin:all'::text)));

create table if not exists public.bmc_partner_division_audit (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.bmc_partner_divisions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  division text not null check (division in ('homes', 'travels', 'agrovest')),
  event_type text not null check (event_type in ('submitted', 'approved', 'rejected', 'suspended', 'withdrawn', 'reopened')),
  previous_status text,
  new_status text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists bmc_partner_division_audit_application_idx
  on public.bmc_partner_division_audit(application_id, created_at desc);

alter table public.bmc_partner_division_audit enable row level security;
revoke all on public.bmc_partner_division_audit from anon, authenticated;
grant select on public.bmc_partner_division_audit to authenticated;

drop policy if exists "BMC approvers can read division audit" on public.bmc_partner_division_audit;
create policy "BMC approvers can read division audit"
  on public.bmc_partner_division_audit
  for select
  to authenticated
  using ((public.user_has_permission((select auth.uid()), 'admin:view_approvals'::text) or public.user_has_permission((select auth.uid()), 'admin:all'::text)));

create or replace function public.audit_bmc_partner_division_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  next_event text;
begin
  if tg_op = 'INSERT' then
    next_event := 'submitted';
    insert into public.bmc_partner_division_audit
      (application_id, user_id, division, event_type, previous_status, new_status, actor_user_id)
    values (new.id, new.user_id, new.division, next_event, null, new.application_status, auth.uid());
    return new;
  end if;

  if new.application_status is distinct from old.application_status then
    next_event := case new.application_status
      when 'approved' then 'approved'
      when 'rejected' then 'rejected'
      when 'suspended' then 'suspended'
      when 'withdrawn' then 'withdrawn'
      else 'reopened'
    end;
    insert into public.bmc_partner_division_audit
      (application_id, user_id, division, event_type, previous_status, new_status, actor_user_id)
    values (new.id, new.user_id, new.division, next_event, old.application_status, new.application_status, auth.uid());
  end if;
  return new;
end;
$function$;

revoke all on function public.audit_bmc_partner_division_change() from public, anon, authenticated;

drop trigger if exists bmc_partner_division_audit_insert on public.bmc_partner_divisions;
create trigger bmc_partner_division_audit_insert
  after insert on public.bmc_partner_divisions
  for each row execute function public.audit_bmc_partner_division_change();

drop trigger if exists bmc_partner_division_audit_update on public.bmc_partner_divisions;
create trigger bmc_partner_division_audit_update
  after update of application_status on public.bmc_partner_divisions
  for each row execute function public.audit_bmc_partner_division_change();

-- Existing BH-Realtors partners can apply for additional divisions after
-- explicitly accepting the BMC-specific agreement and privacy notice.
create or replace function public.request_bmc_division_application(
  _division text,
  _agree_to_bmc_terms boolean,
  _acknowledge_bmc_privacy boolean,
  _marketing_consent boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
  application_id uuid;
begin
  current_user_id := auth.uid();
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if _division is null or _division not in ('homes', 'travels', 'agrovest') then
    raise exception 'Invalid BMC division';
  end if;

  if coalesce(_agree_to_bmc_terms, false) is not true
     or coalesce(_acknowledge_bmc_privacy, false) is not true then
    raise exception 'BMC agreement acceptance and privacy acknowledgement are required';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = current_user_id and p.is_pbo is true
  ) and not exists (
    select 1 from public.bmc_partner_divisions d
    where d.user_id = current_user_id
  ) then
    raise exception 'Only an existing BMC or BH-Realtors partner can apply for a division';
  end if;

  insert into public.bmc_agreement_acceptances (
    user_id, agreement_version, agreement_name, accepted_at,
    acceptance_source, marketing_consent, privacy_notice_version,
    privacy_notice_acknowledged
  ) values (
    current_user_id, '1.0', 'Bridgefort Multi-Business Consultants Partner Agreement',
    now(), 'partner_hub', coalesce(_marketing_consent, false), '1.0', true
  );

  insert into public.bmc_partner_divisions (user_id, division, application_status)
  values (current_user_id, _division, 'pending_review')
  on conflict (user_id, division) do nothing
  returning id into application_id;

  if application_id is null then
    select d.id into application_id
    from public.bmc_partner_divisions d
    where d.user_id = current_user_id and d.division = _division;
  end if;

  return application_id;
end;
$function$;

revoke all on function public.request_bmc_division_application(text, boolean, boolean, boolean) from public, anon;
grant execute on function public.request_bmc_division_application(text, boolean, boolean, boolean) to authenticated;

-- Applications are created only by this trusted auth trigger. Clients cannot
-- insert or change their own approval state or review notes.
create or replace function public.create_bmc_division_applications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_division text;
  requested jsonb;
begin
  if (new.raw_user_meta_data ->> 'bmc_agreement_accepted') is distinct from 'true'
     or (new.raw_user_meta_data ->> 'bmc_privacy_acknowledged') is distinct from 'true' then
    return new;
  end if;

  requested := coalesce(new.raw_user_meta_data -> 'bmc_selected_divisions', '[]'::jsonb);
  if jsonb_typeof(requested) = 'array' then
    for selected_division in
      select distinct lower(trim(value))
      from jsonb_array_elements_text(requested) as selected(value)
      where lower(trim(value)) in ('homes', 'travels', 'agrovest')
    loop
      insert into public.bmc_partner_divisions (user_id, division)
      values (new.id, selected_division)
      on conflict (user_id, division) do nothing;
    end loop;
  end if;
  return new;
end;
$$;

revoke all on function public.create_bmc_division_applications() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_create_bmc_divisions on auth.users;
create trigger on_auth_user_created_create_bmc_divisions
  after insert on auth.users
  for each row execute function public.create_bmc_division_applications();
