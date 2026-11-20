-- Secure BMC division review and grant Homes membership only after approval.
-- This migration is additive and does not alter existing general client terms,
-- general privacy policy, or production data until explicitly deployed.

-- Prevent direct client-side edits to approval state and reviewer metadata.
-- A user's broad self-profile UPDATE policy must never allow self-promotion
-- into BH-Realtors. The existing financial-field trigger does not protect
-- is_pbo, so enforce membership authority independently at the row level.
create or replace function public.protect_bmc_membership_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  if auth.uid() is null
     or current_setting('bridgefort.bmc_membership_sync', true) = '1'
     or public.is_global_admin(auth.uid())
     or public.user_has_permission(auth.uid(), 'admin:all'::text)
     or public.user_has_permission(auth.uid(), 'admin:view_users'::text) then
    return new;
  end if;

  new.is_pbo := old.is_pbo;

  -- Referral identifiers may be assigned once during onboarding, but an
  -- existing identifier cannot be replaced by a self-service profile edit.
  if old.pbo_referral_code is not null
     and new.pbo_referral_code is distinct from old.pbo_referral_code then
    new.pbo_referral_code := old.pbo_referral_code;
  end if;

  return new;
end;
$;

revoke all on function public.protect_bmc_membership_fields() from public, anon, authenticated;
drop trigger if exists protect_bmc_membership_fields on public.profiles;
create trigger protect_bmc_membership_fields
  before update on public.profiles
  for each row execute function public.protect_bmc_membership_fields();

revoke update on public.bmc_partner_divisions from anon, authenticated;

create or replace function public.sync_bmc_homes_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.division = 'homes' and new.application_status is distinct from old.application_status then
    if new.application_status = 'approved' then
      -- The profile guard permits this flag only while this trusted trigger
      -- holds the transaction-local membership-sync marker.
      perform set_config('bridgefort.bmc_membership_sync', '1', true);
      update public.profiles
      set is_pbo = true,
          current_package = coalesce(nullif(current_package, ''), 'associate'),
          updated_at = now()
      where id = new.user_id;
      perform set_config('bridgefort.bmc_membership_sync', '0', true);
    elsif old.application_status = 'approved'
       and new.application_status in ('suspended', 'rejected', 'withdrawn', 'pending_review') then
      -- Only revoke the legacy BH-Realtors flag for a new approved BMC
      -- membership. Existing legacy accounts are represented by
      -- legacy_existing and are not changed by this transition.
      perform set_config('bridgefort.bmc_membership_sync', '1', true);
      update public.profiles
      set is_pbo = false,
          updated_at = now()
      where id = new.user_id
        and exists (
          select 1 from public.profiles p
          where p.id = new.user_id
            and p.is_pbo is true
        );
      perform set_config('bridgefort.bmc_membership_sync', '0', true);
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_bmc_homes_membership() from public, anon, authenticated;
drop trigger if exists bmc_sync_homes_membership on public.bmc_partner_divisions;
create trigger bmc_sync_homes_membership
  after update of application_status on public.bmc_partner_divisions
  for each row execute function public.sync_bmc_homes_membership();

create or replace function public.admin_review_bmc_division_application(
  _application_id uuid,
  _decision text,
  _review_note text default null
)
returns public.bmc_partner_divisions
language plpgsql
security definer
set search_path = ''
as $$
declare
  reviewer uuid;
  current_application public.bmc_partner_divisions;
  updated_application public.bmc_partner_divisions;
begin
  reviewer := auth.uid();
  if reviewer is null
     or not (
       public.user_has_permission(reviewer, 'admin:view_approvals'::text)
       or public.user_has_permission(reviewer, 'admin:all'::text)
     ) then
    raise exception 'BMC approval permission required';
  end if;

  if coalesce(_decision, '') not in ('approved', 'rejected', 'suspended', 'pending_review') then
    raise exception 'Unsupported BMC application decision';
  end if;

  select * into current_application
  from public.bmc_partner_divisions
  where id = _application_id
  for update;

  if not found then
    raise exception 'BMC division application not found';
  end if;

  if current_application.application_status = 'legacy_existing' then
    raise exception 'Legacy BH-Realtors records cannot be changed through this review action';
  end if;

  if current_application.application_status = 'withdrawn' then
    raise exception 'Withdrawn applications cannot be reviewed';
  end if;

  update public.bmc_partner_divisions
  set application_status = _decision,
      reviewed_at = case when _decision = 'pending_review' then null else now() end,
      reviewed_by = case when _decision = 'pending_review' then null else reviewer end,
      review_note = nullif(trim(coalesce(_review_note, '')), ''),
      updated_at = now()
  where id = _application_id
  returning * into updated_application;

  return updated_application;
end;
$$;

revoke all on function public.admin_review_bmc_division_application(uuid, text, text) from public, anon;
grant execute on function public.admin_review_bmc_division_application(uuid, text, text) to authenticated;
