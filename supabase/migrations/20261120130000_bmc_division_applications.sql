-- BMC division applications are kept separate from the legacy BH-Realtors
-- profile/referral fields. One auth user remains the single BMC identity;
-- each selected division has its own independent approval state.
create table if not exists public.bmc_partner_divisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  division text not null check (division in ('homes', 'travels', 'agrovest')),
  application_status text not null default 'pending_review'
    check (application_status in ('pending_review', 'approved', 'rejected', 'suspended', 'withdrawn')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmc_partner_divisions_user_division_unique unique (user_id, division),
  constraint bmc_partner_divisions_review_state_check check (
    (application_status = 'pending_review' and reviewed_at is null)
    or application_status <> 'pending_review'
  )
);

create index if not exists bmc_partner_divisions_division_status_idx
  on public.bmc_partner_divisions(division, application_status, requested_at desc);
create index if not exists bmc_partner_divisions_user_idx
  on public.bmc_partner_divisions(user_id, created_at desc);

alter table public.bmc_partner_divisions enable row level security;
revoke all on public.bmc_partner_divisions from anon, authenticated;
grant select on public.bmc_partner_divisions to authenticated;

drop policy if exists "BMCs can read their own division applications" on public.bmc_partner_divisions;
create policy "BMCs can read their own division applications"
  on public.bmc_partner_divisions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

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
