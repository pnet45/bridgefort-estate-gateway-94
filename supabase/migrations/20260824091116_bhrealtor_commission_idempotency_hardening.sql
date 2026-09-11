create unique index if not exists ux_mlm_commissions_membership_source on public.mlm_commissions(source_purchase_id, beneficiary_id, sponsor_level) where source_purchase_id is not null;
create unique index if not exists ux_mlm_commissions_order_source on public.mlm_commissions(source_order_id, beneficiary_id, sponsor_level) where source_order_id is not null;
create unique index if not exists ux_mlm_commissions_property_sale_source on public.mlm_commissions(source_property_sale_id, beneficiary_id, sponsor_level) where source_property_sale_id is not null;

create or replace function public.award_bhrealtor_membership_commissions()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  v_sponsor_id uuid; v_sponsor2_id uuid; v_buyer_is_pbo boolean;
  v_sponsor_is_active boolean; v_sponsor2_is_pbo boolean; v_sponsor2_is_active boolean;
  v_package public.mlm_packages; v_rate numeric; v_amount numeric; v_status text; v_inserted boolean;
begin
  if new.status <> 'completed' or old.status = 'completed' then return new; end if;
  if coalesce(new.amount,0) <= 5000 then return new; end if;
  select * into v_package from public.mlm_packages where package_code=new.package_code;
  if not found then return new; end if;
  select referred_by_id,is_pbo into v_sponsor_id,v_buyer_is_pbo from public.profiles where id=new.user_id;
  if not coalesce(v_buyer_is_pbo,false) or v_sponsor_id is null then return new; end if;
  select is_active into v_sponsor_is_active from public.profiles where id=v_sponsor_id;
  if not coalesce(v_sponsor_is_active,false) then return new; end if;

  v_rate:=coalesce(v_package.direct_commission_pct,0);
  if v_rate>0 then
    v_amount:=round(new.amount*v_rate/100,2);
    v_status:=case when public.bhrealtor_package_can_withdraw((select current_package from public.profiles where id=v_sponsor_id)) then 'available' else 'locked' end;
    insert into public.mlm_commissions(source_purchase_id,commission_source,beneficiary_id,sponsor_level,commission_rate,commission_amount,status,description)
    values(new.id,'membership',v_sponsor_id,1,v_rate,v_amount,v_status,format('%s membership referral commission - first level',v_package.package_name))
    on conflict (source_purchase_id,beneficiary_id,sponsor_level) where source_purchase_id is not null do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted then
      update public.profiles set total_commissions=coalesce(total_commissions,0)+v_amount, wallet_balance=case when v_status='available' then coalesce(wallet_balance,0)+v_amount else wallet_balance end, updated_at=now() where id=v_sponsor_id;
    end if;
  end if;

  select referred_by_id,is_pbo,is_active into v_sponsor2_id,v_sponsor2_is_pbo,v_sponsor2_is_active from public.profiles where id=v_sponsor_id;
  if v_sponsor2_id is not null and coalesce(v_sponsor2_is_pbo,false) and coalesce(v_sponsor2_is_active,false) and coalesce(v_package.indirect_commission_pct,0)>0 then
    v_rate:=v_package.indirect_commission_pct; v_amount:=round(new.amount*v_rate/100,2);
    v_status:=case when public.bhrealtor_package_can_withdraw((select current_package from public.profiles where id=v_sponsor2_id)) then 'available' else 'locked' end;
    insert into public.mlm_commissions(source_purchase_id,commission_source,beneficiary_id,sponsor_level,commission_rate,commission_amount,status,description)
    values(new.id,'membership',v_sponsor2_id,2,v_rate,v_amount,v_status,format('%s membership referral commission - second level',v_package.package_name))
    on conflict (source_purchase_id,beneficiary_id,sponsor_level) where source_purchase_id is not null do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted then
      update public.profiles set total_commissions=coalesce(total_commissions,0)+v_amount, wallet_balance=case when v_status='available' then coalesce(wallet_balance,0)+v_amount else wallet_balance end, updated_at=now() where id=v_sponsor2_id;
    end if;
  end if;
  return new;
end; $$;
