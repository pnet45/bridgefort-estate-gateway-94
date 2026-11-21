-- Behavioural assertions for BMC migrations. Intended for a disposable Postgres DB only.
\set ON_ERROR_STOP on

insert into auth.users (id, email, raw_user_meta_data) values
('11111111-1111-4111-8111-111111111111', 'bmc-partner@example.test',
 jsonb_build_object(
   'first_name','BMC','last_name','Partner',
   'bmc_agreement_accepted','true',
   'bmc_agreement_version','1.0',
   'bmc_agreement_name','Bridgefort Multi-Business Consultants Partner Agreement',
   'bmc_privacy_acknowledged','true',
   'bmc_privacy_notice_version','1.0',
   'bmc_selected_divisions',jsonb_build_array('homes','travels','agrovest')
 )),
('22222222-2222-4222-8222-222222222222', 'admin@example.test',
 jsonb_build_object('first_name','Test','last_name','Admin'));

do $$
declare
  partner_id uuid := '11111111-1111-4111-8111-111111111111';
  admin_id uuid := '22222222-2222-4222-8222-222222222222';
  homes_app uuid;
  travels_app uuid;
  agro_app uuid;
  homes_code_id uuid;
  travels_code_id uuid;
  agro_code_id uuid;
  homes_code text;
  travels_code text;
  agro_code text;
  referred_id uuid := '33333333-3333-4333-8333-333333333333';
  no_consent_id uuid := '44444444-4444-4444-8444-444444444444';
  attribution_count integer;
  travel_booking_id uuid;
  travel_payment_id uuid;
  travel_payment_id_2 uuid;
  commission_count integer;
  commission_id uuid;
  agro_request_1 uuid;
  agro_request_2 uuid;
begin
  if (select count(*) from public.bmc_agreement_acceptances where user_id = partner_id) <> 1 then
    raise exception 'BMC agreement/privacy acceptance was not captured exactly once at signup';
  end if;

  if (select count(*) from public.bmc_partner_divisions where user_id = partner_id) <> 3 then
    raise exception 'BMC signup did not create all three independent division applications';
  end if;

  select id into homes_app from public.bmc_partner_divisions where user_id=partner_id and division='homes';
  select id into travels_app from public.bmc_partner_divisions where user_id=partner_id and division='travels';
  select id into agro_app from public.bmc_partner_divisions where user_id=partner_id and division='agrovest';

  perform set_config('request.jwt.claim.sub', admin_id::text, true);
  perform set_config('test.permission', 'admin:view_approvals', true);
  select count(*) into attribution_count from public.admin_list_bmc_division_applications();
  if attribution_count <> 3 then raise exception 'View-only approvals permission cannot read the BMC queue'; end if;

  -- View-only approval access must not grant decision authority.
  begin
    perform public.admin_review_bmc_division_application(homes_app, 'approved', null);
    raise exception 'View-only approvals permission unexpectedly allowed BMC decision';
  exception when others then
    if sqlerrm = 'View-only approvals permission unexpectedly allowed BMC decision' then raise; end if;
    if sqlerrm not like '%BMC approval permission required%' then raise; end if;
  end;

  if not exists (select 1 from public.role_permissions where role='super_admin' and permission_key='admin:manage_bmc_partners' and is_enabled is true)
     or not exists (select 1 from public.role_permissions where role='manager' and permission_key='admin:manage_bmc_partners' and is_enabled is true)
     or exists (select 1 from public.role_permissions where role in ('admin_it','admin_dir','admin_acct','admin_cs') and permission_key='admin:manage_bmc_partners' and is_enabled is true) then
    raise exception 'BMC decision permission defaults are not restricted to designated management roles';
  end if;

  perform set_config('test.permission', 'admin:manage_bmc_partners', true);
  select count(*) into attribution_count from public.admin_list_bmc_division_applications();
  if attribution_count <> 3 then raise exception 'Dedicated BMC managers cannot read their review queue'; end if;
  perform public.admin_review_bmc_division_application(homes_app, 'approved', null);
  perform public.admin_review_bmc_division_application(travels_app, 'approved', null);
  perform public.admin_review_bmc_division_application(agro_app, 'approved', null);

  select id, referral_code into homes_code_id, homes_code
  from public.bmc_division_referral_codes where application_id=homes_app and is_active;
  select id, referral_code into travels_code_id, travels_code
  from public.bmc_division_referral_codes where application_id=travels_app and is_active;
  select id, referral_code into agro_code_id, agro_code
  from public.bmc_division_referral_codes where application_id=agro_app and is_active;

  if homes_code_id is null or travels_code_id is null or agro_code_id is null then
    raise exception 'Approval did not provision a separate active referral code for each division';
  end if;

  -- Homes attribution is recorded on referred-user signup.
  insert into auth.users(id,email,raw_user_meta_data)
  values (referred_id,'referred@example.test',jsonb_build_object('bmc_referral_code',homes_code));
  if not exists (
    select 1 from public.bmc_division_referral_attributions
    where source_type='signup' and source_record_id=referred_id
      and division='homes' and referrer_user_id=partner_id
  ) then
    raise exception 'Homes signup referral attribution was not recorded';
  end if;

  -- Travels attribution is recorded when a booking is submitted.
  insert into public.travel_bookings
    (name,email,phone,departure_date,return_date,travelers,package,status,customer_id,bmc_referral_code_id)
  values
    ('Referred Customer','travel@example.test','08000000000',current_date+10,current_date+15,1,'Explorer','received',referred_id,travels_code_id)
  returning id into travel_booking_id;
  if not exists (
    select 1 from public.bmc_division_referral_attributions
    where source_type='travel_booking' and division='travels'
      and referrer_user_id=partner_id and referred_user_id=referred_id
  ) then
    raise exception 'Travels booking referral attribution was not recorded';
  end if;

  -- Agrovest attribution is recorded only for Agrovest-only orders.
  insert into public.orders
    (user_id,customer_email,customer_name,total_amount,payment_reference,payment_status,items,bmc_referral_code_id)
  values
    (referred_id,'agro@example.test','Referred Customer',1000,'TEST-AGRO-1','pending',
     jsonb_build_array(jsonb_build_object('property_type','Agrovest')),agro_code_id);
  if not exists (
    select 1 from public.bmc_division_referral_attributions
    where source_type='order' and division='agrovest'
      and referrer_user_id=partner_id and referred_user_id=referred_id
  ) then
    raise exception 'Agrovest order referral attribution was not recorded';
  end if;

  -- Each individually approved Agrovest instalment earns 10% immediately.
  insert into public.payment_gateway_events
    (gateway, reference, order_id, user_id, amount, currency, status, metadata)
  select 'Paystack', 'TEST-AGRO-INSTALLMENT-1', id, user_id, 400, 'NGN', 'success',
         jsonb_build_object('source','bmc-installment-test')
  from public.orders where payment_reference='TEST-AGRO-1';
  insert into public.payment_gateway_events
    (gateway, reference, order_id, user_id, amount, currency, status, metadata)
  select 'Paystack', 'TEST-AGRO-INSTALLMENT-2', id, user_id, 600, 'NGN', 'success',
         jsonb_build_object('source','bmc-installment-test')
  from public.orders where payment_reference='TEST-AGRO-1';

  insert into public.payment_requests (user_id, type, amount, reference, status, order_id)
  select referred_id, 'agrovest', 400, 'TEST-AGRO-INSTALLMENT-1', 'pending', id
  from public.orders where payment_reference='TEST-AGRO-1'
  returning id into agro_request_1;
  insert into public.payment_requests (user_id, type, amount, reference, status, order_id)
  select referred_id, 'property', 600, 'TEST-AGRO-INSTALLMENT-2', 'pending', id
  from public.orders where payment_reference='TEST-AGRO-1'
  returning id into agro_request_2;

  update public.payment_requests set status='approved' where id=agro_request_1;
  update public.payment_requests set status='approved' where id=agro_request_2;

  select count(*) into commission_count
  from public.bmc_division_commissions
  where division='agrovest' and source_type='agrovest_payment'
    and source_record_id in (agro_request_1, agro_request_2)
    and referrer_user_id=partner_id and commission_rate=10 and status='earned';
  if commission_count <> 2 then
    raise exception 'Agrovest instalments did not create exactly one commission entry each';
  end if;
  if (select coalesce(sum(gross_customer_payment),0) from public.bmc_division_commissions
      where source_type='agrovest_payment' and source_record_id in (agro_request_1, agro_request_2)) <> 1000
     or (select coalesce(sum(commission_amount),0) from public.bmc_division_commissions
         where source_type='agrovest_payment' and source_record_id in (agro_request_1, agro_request_2)) <> 100 then
    raise exception 'Agrovest instalment commission totals do not equal 10% of cleared customer payments';
  end if;

  -- Replaying an already-approved request must not create a duplicate commission.
  update public.payment_requests set admin_notes='duplicate-event-check' where id=agro_request_1;
  if (select count(*) from public.bmc_division_commissions
      where source_type='agrovest_payment' and source_record_id=agro_request_1) <> 1 then
    raise exception 'Duplicate Agrovest payment approval created another commission';
  end if;

  -- Management can mark an earned commission paid with an auditable payout reference.
  select id into commission_id from public.bmc_division_commissions
  where source_type='agrovest_payment'
    and source_record_id=agro_request_1;
  perform public.admin_mark_bmc_commission_paid(commission_id, 'TEST-AGRO-PAYOUT-1');
  if not exists (
    select 1 from public.bmc_division_commissions
    where id=commission_id and status='paid' and payout_reference='TEST-AGRO-PAYOUT-1'
      and paid_by=admin_id and paid_at is not null
  ) then
    raise exception 'Agrovest commission payout was not recorded with its audit reference';
  end if;

  -- Travel bookings are enquiries, so commission is recorded only after a manager
  -- confirms the booking and records an independently verified cleared payment.
  update public.travel_bookings set status='confirmed' where id=travel_booking_id;
  perform set_config('request.jwt.claim.sub', admin_id::text, true);
  perform set_config('test.permission', 'admin:manage_travels', true);
  select public.admin_record_bmc_travel_payment(travel_booking_id, 500000, 'TEST-TRAVEL-PAID-1')
    into travel_payment_id;
  select public.admin_record_bmc_travel_payment(travel_booking_id, 1000000, 'TEST-TRAVEL-PAID-2')
    into travel_payment_id_2;
  select count(*) into commission_count
  from public.bmc_division_commissions
  where division='travels' and source_type='travel_payment'
    and source_record_id in (travel_payment_id, travel_payment_id_2)
    and referrer_user_id=partner_id and commission_rate=10 and status='earned';
  if commission_count <> 2 then
    raise exception 'Travels instalments did not create exactly one commission entry each';
  end if;
  if (select coalesce(sum(gross_customer_payment),0) from public.bmc_division_commissions
      where source_type='travel_payment' and source_record_id in (travel_payment_id, travel_payment_id_2)) <> 1500000
     or (select coalesce(sum(commission_amount),0) from public.bmc_division_commissions
         where source_type='travel_payment' and source_record_id in (travel_payment_id, travel_payment_id_2)) <> 150000 then
    raise exception 'Travels instalment commission totals do not equal 10% of cleared customer payments';
  end if;
  if not exists (
    select 1 from public.bmc_division_commissions
    where source_record_id=travel_payment_id
      and gross_customer_payment=500000 and commission_amount=50000
  ) then
    raise exception 'Travels commission was not calculated as 10% of the full cleared customer payment';
  end if;
  if (select count(*) from public.bmc_division_commissions where source_record_id=travel_payment_id) <> 1 then
    raise exception 'Travels payment created duplicate or upliner commission rows';
  end if;
  perform set_config('test.permission', 'admin:manage_bmc_partners', true);

  -- A verified full refund reverses an unpaid Travels commission and its payment record.
  select id into commission_id from public.bmc_division_commissions
  where source_type='travel_payment' and source_record_id=travel_payment_id;
  perform public.admin_reverse_bmc_division_commission(commission_id, 'Verified full customer refund');
  if not exists (
    select 1 from public.bmc_division_commissions
    where id=commission_id and status='reversed'
      and reversal_reason='Verified full customer refund'
  ) then
    raise exception 'Travels commission reversal was not recorded';
  end if;
  if not exists (
    select 1 from public.bmc_travel_commission_payments
    where id=travel_payment_id and payment_status='reversed'
  ) then
    raise exception 'Travels payment ledger was not reversed with its commission';
  end if;

  -- Invalid division mix must be rejected by the database trigger.
  begin
    insert into public.orders
      (user_id,customer_email,customer_name,total_amount,payment_reference,payment_status,items,bmc_referral_code_id)
    values
      (referred_id,'mixed@example.test','Mixed Cart',1000,'TEST-AGRO-MIXED','pending',
       jsonb_build_array(jsonb_build_object('property_type','Agrovest'),jsonb_build_object('property_type','Homes')),agro_code_id);
    raise exception 'Mixed division order unexpectedly accepted';
  exception when others then
    if sqlerrm = 'Mixed division order unexpectedly accepted' then raise; end if;
    if sqlerrm not like '%Agrovest referral codes can only be used for Agrovest-only orders%' then raise; end if;
  end;

  -- Self-referrals must not be attributed.
  insert into public.travel_bookings
    (name,email,phone,departure_date,return_date,travelers,package,status,customer_id,bmc_referral_code_id)
  values
    ('Partner Self','self@example.test','08000000001',current_date+10,current_date+15,1,'Explorer','received',partner_id,travels_code_id);
  select count(*) into attribution_count from public.bmc_division_referral_attributions
  where source_type='travel_booking' and referred_user_id=partner_id;
  if attribution_count <> 0 then raise exception 'Self-referral was incorrectly attributed'; end if;

  -- An applicant without verified BMC consent cannot be approved.
  insert into auth.users(id,email,raw_user_meta_data)
  values (no_consent_id,'no-consent@example.test','{}'::jsonb);
  insert into public.bmc_partner_divisions(user_id,division) values (no_consent_id,'homes');
  begin
    perform public.admin_review_bmc_division_application(
      (select id from public.bmc_partner_divisions where user_id=no_consent_id and division='homes'),
      'approved',null
    );
    raise exception 'Approval without consent unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'Approval without consent unexpectedly succeeded' then raise; end if;
    if sqlerrm not like '%Verified BMC Agreement acceptance and privacy acknowledgement are required%' then raise; end if;
  end;

  -- Suspending a division must deactivate its code.
  perform public.admin_review_bmc_division_application(travels_app,'suspended','Test suspension reason');
  if exists (select 1 from public.bmc_division_referral_codes where id=travels_code_id and is_active) then
    raise exception 'Suspending a division did not deactivate its referral code';
  end if;

  -- Profile membership must not be self-promotable, even with a spoofed custom GUC.
  perform set_config('request.jwt.claim.sub', partner_id::text, true);
  perform set_config('test.permission', '', true);
  perform set_config('bridgefort.bmc_membership_sync', '1', true);
  update public.profiles set is_pbo=true where id=partner_id;
  if (select is_pbo from public.profiles where id=partner_id) is distinct from false then
    raise exception 'Spoofable custom GUC allowed BMC user to self-promote to BH-Realtors';
  end if;

  if (select count(*) from public.bmc_partner_division_audit where application_id in (homes_app,travels_app,agro_app)) < 6 then
    raise exception 'BMC division audit history did not record submission and review events';
  end if;
end;
$$;

-- Verify authenticated users cannot bypass the approval RPC with direct updates.
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
do $$
begin
  begin
    update public.bmc_partner_divisions
    set application_status='approved', reviewed_at=now(), updated_at=now()
    where user_id='11111111-1111-4111-8111-111111111111' and division='homes';
    raise exception 'Direct BMC approval update unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;
reset role;

select 'BMC migrations and referral/approval safeguards passed' as result;
