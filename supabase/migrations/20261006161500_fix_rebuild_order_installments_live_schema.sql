-- Rebuild installment schedules from the live orders/payments schema.
-- orders has no installment_months; payments stores months.
-- order_installments uses amount_due, not scheduled_amount/balance.
create or replace function public.rebuild_order_installments(_order_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  o public.orders;
  n integer;
  each_amount numeric;
  i integer;
begin
  select * into o from public.orders where id=_order_id;
  if not found then raise exception 'Order not found'; end if;

  select greatest(1,coalesce(max(p.months),1))
  into n
  from public.payments p
  where p.reference=o.payment_reference;

  delete from public.order_installments
  where order_id=_order_id and coalesce(amount_paid,0)=0;

  each_amount:=case when n>0 then o.total_amount/n else o.total_amount end;

  for i in 1..n loop
    insert into public.order_installments(
      order_id,installment_number,amount_due,amount_paid,status
    )
    values(
      o.id,i,each_amount,0,'pending'
    )
    on conflict(order_id,installment_number) do nothing;
  end loop;
end;
$$;