-- Behavioural regression test for the published BMC / BH-Realtors commission schedule.
-- Runs only against the disposable PostgreSQL fixture used by GitHub Actions.

create trigger test_award_bhrealtor_property_sale_commission
after update of payment_status on public.orders
for each row execute function public.award_bhrealtor_property_sale_commission();

do $$
declare
  v_upline uuid := '10000000-0000-4000-8000-000000000001';
  v_realtor uuid := '10000000-0000-4000-8000-000000000002';
  v_land_buyer uuid := '10000000-0000-4000-8000-000000000003';
  v_house_buyer uuid := '10000000-0000-4000-8000-000000000004';
  v_land_order uuid;
  v_house_order uuid;
  v_rate numeric;
  v_count integer;
begin
  insert into auth.users(id,email) values
    (v_upline,'upline@example.test'),
    (v_realtor,'realtor@example.test'),
    (v_land_buyer,'landbuyer@example.test'),
    (v_house_buyer,'housebuyer@example.test');

  update public.profiles set is_pbo=true, is_active=true, current_package='gold'
  where id in (v_upline,v_realtor);
  update public.profiles set referred_by_id=v_upline where id=v_realtor;
  update public.profiles set referred_by_id=v_realtor where id in (v_land_buyer,v_house_buyer);

  insert into public.orders(user_id,customer_email,customer_name,total_amount,payment_reference,payment_status,items)
  values (v_land_buyer,'landbuyer@example.test','Land Buyer',1000000,'TEST-LAND-001','pending',
    '[{"property_type":"Land","property_id":"LAND-001","plot_id":"PLOT-001","price":1000000,"quantity":1}]'::jsonb)
  returning id into v_land_order;

  update public.orders set payment_status='paid' where id=v_land_order;

  insert into public.orders(user_id,customer_email,customer_name,total_amount,payment_reference,payment_status,items)
  values (v_house_buyer,'housebuyer@example.test','House Buyer',20000000,'TEST-HOUSE-001','pending',
    '[{"property_type":"House","property_id":"HOUSE-001","price":20000000,"quantity":1}]'::jsonb)
  returning id into v_house_order;

  update public.orders set payment_status='paid' where id=v_house_order;

  select commission_rate into v_rate
  from public.mlm_commissions
  where source_order_id=v_land_order and beneficiary_id=v_realtor and sponsor_level=1;
  if v_rate is distinct from 15 then
    raise exception 'Expected 15%% direct land commission, received %', v_rate;
  end if;

  select commission_rate into v_rate
  from public.mlm_commissions
  where source_order_id=v_house_order and beneficiary_id=v_realtor and sponsor_level=1;
  if v_rate is distinct from 5 then
    raise exception 'Expected 5%% direct house commission, received %', v_rate;
  end if;

  select count(*) into v_count
  from public.mlm_commissions
  where source_order_id=v_house_order and sponsor_level=2;
  if v_count <> 0 then
    raise exception 'House sale must not create an additional second-level property commission';
  end if;

  select count(*) into v_count
  from public.mlm_commissions
  where source_order_id=v_land_order and beneficiary_id=v_upline and sponsor_level=2 and commission_rate=5;
  if v_count <> 1 then
    raise exception 'Expected existing 5%% second-level land commission to remain intact';
  end if;
end;
$$;
