create or replace function public.issue_estate_subscription_for_order() returns trigger language plpgsql security definer set search_path=public as $$
declare item jsonb; pname text; pcode text; pplan text; pproperty uuid; existing public.estate_subscriptions; estate_key text;
begin
 if new.payment_status not in ('awaiting_approval','paid','completed') then return new; end if;
 select * into existing from public.estate_subscriptions where order_id=new.id limit 1;
 if existing.id is not null then
   if existing.subscription_status='pending' and new.payment_status in ('paid','completed') then update public.estate_subscriptions set subscription_status='active',updated_at=now() where id=existing.id; end if;
   return new;
 end if;
 item:=coalesce(new.items->0,'{}'::jsonb);
 pname:=trim(coalesce(item->>'property_name',item->>'estate_name',item->>'title','Estate Subscription'));
 pcode:=public.estate_code_from_name(pname);
 if pcode is null or length(pcode)=0 then pcode:='EST'; end if;
 pplan:=coalesce(item->>'payment_plan',item->>'plan_type');
 begin pproperty:=(item->>'property_id')::uuid; exception when others then pproperty:=null; end;
 estate_key:=lower(regexp_replace(pname,'[^a-z0-9]+','_','gi'));
 perform public.create_estate_subscription(estate_key,pname,pcode,pproperty,new.user_id,new.id,null,new.total_amount,pplan,case when new.payment_status in ('paid','completed') then 'active' else 'pending' end);
 return new;
end; $$;

-- Ensure the live trigger is singular by its PostgreSQL trigger identity.
drop trigger if exists trg_issue_estate_subscription on public.orders;
create trigger trg_issue_estate_subscription after insert or update of payment_status on public.orders for each row execute function public.issue_estate_subscription_for_order();
