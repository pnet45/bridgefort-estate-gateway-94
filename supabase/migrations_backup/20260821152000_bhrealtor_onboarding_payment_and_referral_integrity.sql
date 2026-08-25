-- Phase 3: BHRealtor registration/onboarding integrity.
-- A PBO flag alone must never activate a Realtor. Successful membership payment
-- is the activation event. Referral sponsors must be active BHRealtors.

create or replace function public.bhrealtor_has_completed_membership(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.mlm_membership_purchases mp
    where mp.user_id = _user_id
      and mp.status = 'completed'
  );
$$;

revoke all on function public.bhrealtor_has_completed_membership(uuid) from public;
grant execute on function public.bhrealtor_has_completed_membership(uuid) to authenticated;

-- Replace the earlier identity trigger that incorrectly equated is_pbo=true
-- with is_active=true. Existing active Realtors are preserved; new/unpaid PBO
-- identities cannot become active merely by changing a profile flag.
create or replace function public.ensure_bhrealtor_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.is_pbo, false) then
    if coalesce(old.is_pbo, false) and coalesce(old.is_active, false) then
      new.is_active := true;
    elsif public.bhrealtor_has_completed_membership(new.id) then
      new.is_active := true;
    else
      new.is_active := false;
    end if;

    if nullif(trim(coalesce(new.pbo_referral_code, '')), '') is null then
      new.pbo_referral_code := 'BH' || upper(substr(md5(new.id::text), 1, 8));
    end if;

    new.current_rank := case coalesce(new.current_package, 'associate')
      when 'classic_gold' then 'Classic Gold'
      when 'gold' then 'Gold'
      else 'Associate'
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ensure_bhrealtor_identity on public.profiles;
create trigger trg_ensure_bhrealtor_identity
before insert or update of is_pbo, is_active, current_package, pbo_referral_code
on public.profiles
for each row execute function public.ensure_bhrealtor_identity();

-- A sponsor must be a real, active BHRealtor. This closes the gap where the
-- signup form could resolve a referral code belonging to an unpaid PBO.
create or replace function public.validate_bhrealtor_sponsor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sponsor_active boolean;
  sponsor_is_pbo boolean;
begin
  if new.referred_by_id is null or new.referred_by_id is not distinct from old.referred_by_id then
    return new;
  end if;

  if new.referred_by_id = new.id then
    raise exception using errcode = '23514', message = 'A Realtor cannot refer themselves.';
  end if;

  select p.is_active, p.is_pbo
  into sponsor_active, sponsor_is_pbo
  from public.profiles p
  where p.id = new.referred_by_id;

  if not coalesce(sponsor_is_pbo, false) or not coalesce(sponsor_active, false) then
    raise exception using errcode = '23514', message = 'The referral sponsor must be an active BHRealtor.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_bhrealtor_sponsor on public.profiles;
create trigger trg_validate_bhrealtor_sponsor
after insert or update of referred_by_id on public.profiles
for each row execute function public.validate_bhrealtor_sponsor();

-- Prevent referral attribution from being changed after a Realtor has become
-- active. This protects already-earned network commissions from reassignment.
create or replace function public.prevent_bhrealtor_referral_reassignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.referred_by_id is not null
     and new.referred_by_id is distinct from old.referred_by_id
     and coalesce(old.is_active, false) then
    raise exception using errcode = '42501', message = 'An active BHRealtor referral sponsor cannot be changed.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_bhrealtor_referral_reassignment on public.profiles;
create trigger trg_prevent_bhrealtor_referral_reassignment
before update of referred_by_id on public.profiles
for each row execute function public.prevent_bhrealtor_referral_reassignment();

-- Do not automatically rewrite existing accounts here. Legacy accounts may
-- have legitimate historical activation/payment records. Future activation is
-- now payment-gated by the trigger above.
