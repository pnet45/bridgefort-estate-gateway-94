-- Secure BMC division review and grant Homes membership only after approval.
-- This migration is additive and does not alter existing general client terms,
-- general privacy policy, or production data until explicitly deployed.

-- Prevent direct client-side edits to approval state and reviewer metadata.
-- The existing self-profile UPDATE policy is broad. Protect both updates and
-- any exceptional self-service insert so an applicant cannot self-promote.
-- Financial-field and BMC membership guards are independent; no client-settable
-- custom GUC is trusted as an authorization signal.
create or replace function public.protect_profile_financial_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $financial_guard$
begin
  if auth.uid() is null
     or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  new.wallet_balance := old.wallet_balance;
  new.total_commissions := old.total_commissions;
  new.current_package := old.current_package;
  new.current_rank := old.current_rank;
  new.total_personal_volume := old.total_personal_volume;
  new.is_active := old.is_active;
  return new;
end;
$financial_guard$;

create or replace function public.protect_bmc_membership_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $bmc_guard$
begin
  if auth.uid() is null
     or public.is_global_admin(auth.uid())
     or public.user_has_permission(auth.uid(), 'admin:all'::text)
 then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_pbo := false;
  else
    new.is_pbo := old.is_pbo;
    -- Referral identifiers may be assigned once during onboarding, but an
    -- existing identifier cannot be replaced by a self-service profile edit.
    if old.pbo_referral_code is not null
       and new.pbo_referral_code is distinct from old.pbo_referral_code then
      new.pbo_referral_code := old.pbo_referral_code;
    end if;
  end if;

  return new;
end;
$bmc_guard$;

revoke all on function public.protect_profile_financial_fields() from public, anon, authenticated;
revoke all on function public.protect_bmc_membership_fields() from public, anon, authenticated;
drop trigger if exists protect_bmc_membership_fields on public.profiles;
create trigger protect_bmc_membership_fields
  before insert or update on public.profiles
  for each row execute function public.protect_bmc_membership_fields();

revoke update on public.bmc_partner_divisions from anon, authenticated;
-- Migration 20261120130000 granted column-level UPDATE privileges. A table-level
-- REVOKE does not remove those independent column grants, so revoke them
-- explicitly and remove the direct-update RLS policy. All decisions must pass
-- through admin_review_bmc_division_application(), which verifies consent.
revoke update (application_status, reviewed_at, updated_at)
  on public.bmc_partner_divisions from anon, authenticated;
drop policy if exists "BMC approvers can update division application status"
  on public.bmc_partner_divisions;

-- BMC Homes approval is intentionally separate from legacy BH-Realtors paid
-- membership. It must not set profiles.is_pbo, current_package or is_active.
-- Existing BH-Realtors accounts and their historical membership remain untouched.

-- Include acceptance evidence in the approval queue so reviewers can
-- verify the separate BMC agreement and privacy acknowledgement before approval.
drop function if exists public.admin_list_bmc_division_applications();
create function public.admin_list_bmc_division_applications()
returns table (
  application_id uuid,
  user_id uuid,
  division text,
  application_status text,
  requested_at timestamptz,
  reviewed_at timestamptz,
  review_note text,
  first_name text,
  last_name text,
  referral_code text,
  agreement_version text,
  agreement_accepted_at timestamptz,
  privacy_notice_acknowledged boolean
)
language plpgsql
security definer
set search_path = ''
as $bmc_list$
begin
  if auth.uid() is null
     or not (
       public.user_has_permission(auth.uid(), 'admin:view_approvals'::text)
       or public.user_has_permission(auth.uid(), 'admin:all'::text)
     ) then
    raise exception 'BMC approval permission required';
  end if;

  return query
  select d.id, d.user_id, d.division, d.application_status, d.requested_at,
         d.reviewed_at, d.review_note, p.first_name, p.last_name, p.pbo_referral_code,
         acceptance.agreement_version, acceptance.accepted_at,
         acceptance.privacy_notice_acknowledged
  from public.bmc_partner_divisions d
  left join public.profiles p on p.id = d.user_id
  left join lateral (
    select a.agreement_version, a.accepted_at, a.privacy_notice_acknowledged
    from public.bmc_agreement_acceptances a
    where a.user_id = d.user_id
    order by a.accepted_at desc
    limit 1
  ) acceptance on true
  order by d.requested_at desc;
end;
$bmc_list$;

revoke all on function public.admin_list_bmc_division_applications() from public, anon;
grant execute on function public.admin_list_bmc_division_applications() to authenticated;

create or replace function public.admin_list_bmc_division_audit(_application_id uuid)
returns table (
  audit_id uuid,
  event_type text,
  previous_status text,
  new_status text,
  actor_user_id uuid,
  review_note text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $bmc_audit_list$
begin
  if auth.uid() is null
     or not (
       public.user_has_permission(auth.uid(), 'admin:view_approvals'::text)
       or public.user_has_permission(auth.uid(), 'admin:all'::text)
     ) then
    raise exception 'BMC approval permission required';
  end if;

  if not exists (
    select 1 from public.bmc_partner_divisions d where d.id = _application_id
  ) then
    raise exception 'BMC division application not found';
  end if;

  return query
  select a.id, a.event_type, a.previous_status, a.new_status,
         a.actor_user_id, a.review_note, a.created_at
  from public.bmc_partner_division_audit a
  where a.application_id = _application_id
  order by a.created_at desc;
end;
$bmc_audit_list$;

revoke all on function public.admin_list_bmc_division_audit(uuid) from public, anon;
grant execute on function public.admin_list_bmc_division_audit(uuid) to authenticated;

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
       public.user_has_permission(reviewer, 'admin:manage_bmc_partners'::text)
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

  -- Enforce the review lifecycle in the database, not only in the browser UI.
  if not (
    (current_application.application_status = 'pending_review' and _decision in ('approved', 'rejected'))
    or (current_application.application_status = 'approved' and _decision = 'suspended')
    or (current_application.application_status = 'suspended' and _decision = 'approved')
    or (current_application.application_status = 'rejected' and _decision = 'pending_review')
  ) then
    raise exception 'Invalid BMC application status transition';
  end if;

  if _decision in ('rejected', 'suspended')
     and nullif(trim(coalesce(_review_note, '')), '') is null then
    raise exception 'A review reason is required for rejection or suspension';
  end if;

  if _decision = 'approved' and not exists (
    select 1
    from public.bmc_agreement_acceptances a
    where a.user_id = current_application.user_id
      and a.agreement_version = '1.0'
      and a.privacy_notice_version = '1.0'
      and a.privacy_notice_acknowledged is true
  ) then
    raise exception 'Verified BMC Agreement acceptance and privacy acknowledgement are required before approval';
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
