-- Withdrawal must require an active BHRealtor membership.
-- Package rank alone is not sufficient.

create or replace function public.get_my_bhrealtor_dashboard()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  r jsonb;
  uid uuid := auth.uid();
  v_profile jsonb;
  v_wallet numeric := 0;
  v_total_commissions numeric := 0;
  v_locked_commissions numeric := 0;
  v_direct integer := 0;
  v_active_direct integer := 0;
  v_withdrawn numeric := 0;
  v_pending_withdrawal numeric := 0;
begin
  if uid is null then
    raise exception using errcode='42501', message='Authentication required';
  end if;

  select jsonb_build_object(
    'is_pbo', p.is_pbo,
    'is_active', p.is_active,
    'package', p.current_package,
    'rank', p.current_rank,
    'referral_code', p.pbo_referral_code,
    'wallet_balance', coalesce(p.wallet_balance,0),
    'total_commissions', coalesce(p.total_commissions,0)
  ), coalesce(p.wallet_balance,0)
  into v_profile, v_wallet
  from public.profiles p
  where p.id = uid;

  select count(*)::integer into v_direct from public.profiles p where p.referred_by_id = uid;
  select count(*)::integer into v_active_direct from public.profiles p
  where p.referred_by_id = uid and p.is_pbo = true and p.is_active = true;

  select coalesce(sum(commission_amount),0),
         coalesce(sum(commission_amount) filter (where status = 'locked'),0)
  into v_total_commissions, v_locked_commissions
  from public.mlm_commissions
  where beneficiary_id = uid;

  select coalesce(sum(amount) filter (where status = 'paid'),0),
         coalesce(sum(amount) filter (where status = 'pending'),0)
  into v_withdrawn, v_pending_withdrawal
  from public.withdrawal_requests
  where user_id = uid;

  select jsonb_build_object(
    'profile', coalesce(v_profile, '{}'::jsonb),
    'direct_referrals', v_direct,
    'active_direct_referrals', v_active_direct,
    'total_commissions_earned', v_total_commissions,
    'locked_commissions', v_locked_commissions,
    'withdrawn_total', v_withdrawn,
    'pending_withdrawal_total', v_pending_withdrawal,
    'available_balance', v_wallet,
    'can_withdraw',
      (v_profile->>'is_pbo') = 'true'
      and (v_profile->>'is_active') = 'true'
      and public.bhrealtor_package_can_withdraw(coalesce(v_profile->>'package','associate')),
    'commissions', coalesce((
      select jsonb_agg(x order by x.created_at desc)
      from (
        select id, commission_amount, status, commission_source, sponsor_level,
               commission_rate, description, created_at,
               source_order_id, source_purchase_id, source_property_sale_id
        from public.mlm_commissions
        where beneficiary_id = uid
        order by created_at desc
        limit 100
      ) x
    ), '[]'::jsonb),
    'withdrawals', coalesce((
      select jsonb_agg(x order by x.created_at desc)
      from (
        select id, amount, status, created_at
        from public.withdrawal_requests
        where user_id = uid
        order by created_at desc
        limit 20
      ) x
    ), '[]'::jsonb),
    'network', coalesce((
      select jsonb_agg(x)
      from (
        select p.id,
               trim(concat_ws(' ', p.first_name, p.last_name)) as full_name,
               p.current_package,
               p.current_rank,
               p.is_active,
               p.created_at
        from public.profiles p
        where p.referred_by_id = uid
        order by p.created_at desc
        limit 100
      ) x
    ), '[]'::jsonb)
  ) into r;

  return r;
end;
$function$;

revoke all on function public.get_my_bhrealtor_dashboard() from public;
grant execute on function public.get_my_bhrealtor_dashboard() to authenticated;

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
set search_path to 'public'
as $function$
declare
  v_wallet numeric;
  v_package text;
  v_active boolean;
  v_is_pbo boolean;
  v_request public.withdrawal_requests;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'You can only submit a withdrawal for your own account';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Withdrawal amount must be greater than zero';
  end if;

  if nullif(trim(p_bank_name),'') is null
     or nullif(trim(p_account_number),'') is null
     or nullif(trim(p_account_name),'') is null then
    raise exception 'Complete bank account details before requesting a withdrawal';
  end if;

  select current_package, coalesce(wallet_balance,0), coalesce(is_active,false), coalesce(is_pbo,false)
  into v_package, v_wallet, v_active, v_is_pbo
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if not v_is_pbo or not v_active then
    raise exception 'Your BHRealtors membership is not active for withdrawals';
  end if;

  if public.bhrealtor_package_rank(v_package) < 2 then
    raise exception 'Associate commissions are locked until you upgrade to Gold or Classic Gold';
  end if;

  if p_amount > v_wallet then
    raise exception 'Insufficient commission balance';
  end if;

  update public.profiles
  set wallet_balance = v_wallet - p_amount, updated_at = now()
  where id = p_user_id;

  insert into public.withdrawal_requests(
    user_id, amount, bank_name, account_number, account_name, status
  )
  values (
    p_user_id, p_amount, trim(p_bank_name), trim(p_account_number), trim(p_account_name), 'pending'
  )
  returning * into v_request;

  return v_request;
end;
$function$;

create or replace function public.submit_withdrawal_request(
  p_user_id uuid,
  p_amount numeric,
  p_bank_name text,
  p_account_number text,
  p_account_name text
)
returns public.withdrawal_requests
language sql
set search_path to 'public'
as $function$
  select private.submit_withdrawal_request($1,$2,$3,$4,$5);
$function$;

revoke all on function public.submit_withdrawal_request(uuid,numeric,text,text,text) from public;
grant execute on function public.submit_withdrawal_request(uuid,numeric,text,text,text) to authenticated;
