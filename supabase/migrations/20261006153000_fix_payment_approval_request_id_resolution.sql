-- Resolve the payment request by the explicit UUID argument.
-- Avoid composite-row field ambiguity inside PL/pgSQL.
create or replace function private.admin_approve_payment_request(_request_id uuid,_decision text,_notes text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
 r public.payment_requests;
 caller uuid:=auth.uid();
 o_before public.orders;
 o_after public.orders;
 expected_paid numeric;
 final_paid numeric;
 final_balance numeric;
begin
 if caller is null then raise exception 'Authentication required'; end if;
 if not public.user_has_permission(caller,'admin:approve_payments') then raise exception 'You do not have permission to approve payments'; end if;
 if lower(_decision) not in ('approved','rejected') then raise exception 'Invalid payment decision'; end if;

 select * into r from public.payment_requests pr where pr.id=_request_id for update;
 if not found then raise exception 'Payment request not found'; end if;
 if r.status<>'pending' then raise exception 'Payment request is already processed'; end if;
 if r.amount is null or r.amount<=0 then raise exception 'Invalid payment amount'; end if;

 select public.resolve_payment_order(_request_id) into o_before;

 if lower(_decision)='approved' then
  if o_before.id is not null then
   if r.amount>greatest(o_before.total_amount-coalesce(o_before.amount_paid,0),0)+1 then
    raise exception 'Payment amount exceeds the outstanding order balance';
   end if;
   expected_paid:=least(coalesce(o_before.total_amount,0),coalesce(o_before.amount_paid,0)+r.amount);
  end if;

  update public.payment_requests
  set status='approved',processed_by=caller,processed_at=now(),
      admin_notes=nullif(trim(coalesce(_notes,'')),''),updated_at=now()
  where id=_request_id;

  if o_before.id is not null then
   select * into o_after from public.orders where id=o_before.id for update;
   final_paid:=greatest(coalesce(o_after.amount_paid,0),coalesce(expected_paid,0));
   final_paid:=least(coalesce(o_after.total_amount,0),final_paid);
   final_balance:=greatest(coalesce(o_after.total_amount,0)-final_paid,0);
   update public.orders
   set amount_paid=final_paid,balance=final_balance,
       payment_status=case when final_balance<=0 then 'paid' else 'pending' end,
       updated_at=now()
   where id=o_after.id;
  end if;
 else
  update public.payment_requests
  set status='rejected',processed_by=caller,processed_at=now(),
      admin_notes=nullif(trim(coalesce(_notes,'')),''),updated_at=now()
  where id=_request_id;
 end if;

 insert into public.payment_request_audit_log(
   payment_request_id,admin_id,action,previous_status,new_status,reason,amount
 )
 values(
   _request_id,caller,lower(_decision),'pending',lower(_decision),
   nullif(trim(coalesce(_notes,'')),''),r.amount
 );

 if o_before.id is not null then
   select * into o_after from public.orders where id=o_before.id;
 end if;

 return jsonb_build_object(
   'success',true,
   'request_id',_request_id,
   'decision',lower(_decision),
   'order_id',o_after.id,
   'amount_paid',coalesce(o_after.amount_paid,0),
   'balance',coalesce(o_after.balance,0)
 );
end;
$$;