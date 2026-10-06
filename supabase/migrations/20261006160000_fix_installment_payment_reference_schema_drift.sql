-- payments.reference is the live schema column. Keep installment synchronization
-- aligned with the actual payment table contract.
create or replace function public.sync_installment_from_payment_request()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_order_id uuid;
  inst public.order_installments;
  remaining numeric:=coalesce(new.amount,0);
  applied numeric;
  new_paid numeric;
  new_balance numeric;
begin
  if new.status not in ('approved','completed','paid') or new.related_payment_id is null then
    return new;
  end if;
  if lower(coalesce(new.type,'')) like '%document%' then
    return new;
  end if;

  select o.id into v_order_id
  from public.payments p
  join public.orders o on o.payment_reference=p.reference
  where p.id=new.related_payment_id
  limit 1;

  if v_order_id is null then
    select o.id into v_order_id
    from public.orders o
    where o.payment_reference=new.reference
    limit 1;
  end if;

  if v_order_id is null or remaining<=0 then
    return new;
  end if;

  perform public.rebuild_order_installments(v_order_id);

  if remaining > (
    select greatest(total_amount-coalesce(amount_paid,0),0)
    from public.orders
    where id=v_order_id
  ) then
    raise exception 'Payment amount exceeds authoritative order balance';
  end if;

  for inst in
    select * from public.order_installments
    where order_id=v_order_id
      and status not in ('paid','cancelled')
      and greatest(amount_due-coalesce(amount_paid,0),0)>0
    order by installment_number,payment_sequence nulls first
    for update
  loop
    exit when remaining<=0;
    applied:=least(remaining,greatest(inst.amount_due-coalesce(inst.amount_paid,0),0));
    update public.order_installments
    set amount_paid=coalesce(amount_paid,0)+applied,
        status=case when coalesce(amount_paid,0)+applied>=amount_due then 'paid' else 'partial' end,
        payment_id=new.related_payment_id,
        payment_reference=new.reference,
        paid_at=case when coalesce(amount_paid,0)+applied>=amount_due then now() else paid_at end,
        updated_at=now()
    where id=inst.id;
    remaining:=remaining-applied;
  end loop;

  select coalesce(sum(amount_paid),0) into new_paid
  from public.order_installments where order_id=v_order_id;

  update public.orders
  set amount_paid=least(total_amount,new_paid),
      balance=greatest(total_amount-least(total_amount,new_paid),0),
      payment_status=case when greatest(total_amount-least(total_amount,new_paid),0)<=0 then 'paid' else 'pending' end,
      updated_at=now()
  where id=v_order_id
  returning balance into new_balance;

  return new;
end;
$$;