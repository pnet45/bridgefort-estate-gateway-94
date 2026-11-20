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
as $
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
$;

revoke all on function public.audit_bmc_partner_division_change() from public, anon, authenticated;

drop trigger if exists bmc_partner_division_audit_insert on public.bmc_partner_divisions;
create trigger bmc_partner_division_audit_insert
  after insert on public.bmc_partner_divisions
  for each row execute function public.audit_bmc_partner_division_change();

drop trigger if exists bmc_partner_division_audit_update on public.bmc_partner_divisions;
create trigger bmc_partner_division_audit_update
  after update of application_status on public.bmc_partner_divisions
  for each row execute function public.audit_bmc_partner_division_change();

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
