-- Fix admin approval authorization context, subscriber directory schema drift,
-- and payment approval state synchronization.
--
-- This migration intentionally keeps the canonical admin_roles/admin_permissions
-- authorization model. It does not alter migration history or bypass RLS.

-- ============================================================
-- 1. Estate Subscribers: profiles has no full_name column.
--    Build the subscriber name from first/last name, then order.customer_name.
-- ============================================================

create or replace function private.admin_get_estate_subscribers(
  _search text default null,
  _estate_code text default null
)
returns table(
  subscription_number text,
  subscriber_name text,
  estate_name text,
  estate_code text,
  client_id uuid,
  order_id uuid,
  subscription_status text,
  payment_plan text,
  subscription_amount numeric,
  subscribed_at timestamptz,
  client_email text,
  phone_number text,
  plot_count integer,
  order_total numeric,
  amount_paid numeric,
  outstanding_balance numeric,
  pbo_referral_code text,
  order_payment_status text,
  payment_reference text
)
language plpgsql
security definer
set search_path=public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not (
    public.user_has_permission(auth.uid(),'admin:view_subscribers')
    or public.user_has_permission(auth.uid(),'admin:all')
  ) then
    raise exception 'Admin access required';
  end if;

  return query
  select
    es.subscription_number,
    coalesce(
      nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
      o.customer_name,
      'Unnamed Subscriber'
    )::text as subscriber_name,
    es.estate_name,
    es.estate_code,
    es.user_id,
    es.order_id,
    es.subscription_status,
    es.payment_plan,
    es.amount,
    es.subscribed_at,
    coalesce(nullif(p.email,''), nullif(o.customer_email,''), u.email)::text,
    nullif(p.phone_number,'')::text,
    greatest(
      1,
      coalesce(
        (
          select sum(
            case
              when jsonb_typeof(x->'quantity') = 'number'
                then greatest(coalesce((x->>'quantity')::integer,1),1)
              else 1
            end
          )
          from jsonb_array_elements(coalesce(o.items,'[]'::jsonb)) x
        ),
        1
      )
    )::integer,
    coalesce(o.total_amount, es.amount, 0),
    coalesce(o.amount_paid, 0),
    greatest(
      coalesce(
        o.balance,
        coalesce(o.total_amount, es.amount, 0) - coalesce(o.amount_paid, 0)
      ),
      0
    ),
    nullif(p.pbo_referral_code,''),
    o.payment_status,
    o.payment_reference
  from public.estate_subscriptions es
  left join public.orders o on o.id = es.order_id
  left join public.profiles p on p.id = es.user_id
  left join auth.users u on u.id = es.user_id
  where (
    _search is null
    or trim(_search) = ''
    or es.subscription_number ilike '%' || trim(_search) || '%'
    or es.estate_name ilike '%' || trim(_search) || '%'
    or coalesce(p.email,o.customer_email,u.email) ilike '%' || trim(_search) || '%'
    or coalesce(p.phone_number,'') ilike '%' || trim(_search) || '%'
    or coalesce(p.pbo_referral_code,'') ilike '%' || trim(_search) || '%'
    or coalesce(
      nullif(trim(concat_ws(' ',p.first_name,p.last_name)), ''),
      o.customer_name
    ) ilike '%' || trim(_search) || '%'
  )
  and (
    _estate_code is null
    or trim(_estate_code) = ''
    or upper(es.estate_code) = upper(trim(_estate_code))
  )
  order by es.created_at desc;
end;
$$;

create or replace function public.admin_get_estate_subscribers(
  _search text default null,
  _estate_code text default null
)
returns table(
  subscription_number text,
  subscriber_name text,
  estate_name text,
  estate_code text,
  client_id uuid,
  order_id uuid,
  subscription_status text,
  payment_plan text,
  subscription_amount numeric,
  subscribed_at timestamptz,
  client_email text,
  phone_number text,
  plot_count integer,
  order_total numeric,
  amount_paid numeric,
  outstanding_balance numeric,
  pbo_referral_code text,
  order_payment_status text,
  payment_reference text
)
language sql
stable
set search_path=public
as $$
  select * from private.admin_get_estate_subscribers($1,$2);
$$;

revoke all on function public.admin_get_estate_subscribers(text,text) from public,anon;
grant execute on function public.admin_get_estate_subscribers(text,text) to authenticated,service_role;
revoke all on function private.admin_get_estate_subscribers(text,text) from public,anon;
grant execute on function private.admin_get_estate_subscribers(text,text) to authenticated,service_role;


-- ============================================================
-- 2. Payment request state sync.
--    Do not blindly mark a partially paid order as paid.
-- ============================================================

create or replace function public.sync_payment_request_state()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_order public.orders;
  v_payment public.payments;
  v_order_balance numeric;
begin
  if TG_OP = 'INSERT' and NEW.status = 'pending' then
    if NEW.related_payment_id is not null then
      update public.payments
      set
        amount_paid = coalesce(NEW.amount, amount_paid),
        balance = greatest(0, coalesce(total_amount, 0) - coalesce(NEW.amount, 0)),
        status = 'awaiting_approval',
        updated_at = now()
      where id = NEW.related_payment_id
        and status not in ('completed', 'rejected');
    end if;

    if NEW.reference is not null then
      update public.orders
      set payment_status = 'awaiting_approval', updated_at = now()
      where payment_reference = NEW.reference
        and payment_status not in ('paid', 'approved', 'rejected');

      update public.estate_documentation_payments
      set status = 'awaiting_approval', updated_at = now()
      where reference = NEW.reference
        and status not in ('completed', 'rejected');
    end if;

    return NEW;
  end if;

  if TG_OP = 'UPDATE'
     and OLD.status = 'pending'
     and NEW.status in ('approved','rejected') then

    if NEW.related_payment_id is not null then
      select * into v_payment
      from public.payments
      where id = NEW.related_payment_id;

      update public.payments
      set
        status = case
          when NEW.status = 'rejected' then 'rejected'
          when coalesce(v_payment.balance,0) <= 0 then 'completed'
          else 'active'
        end,
        updated_at = now()
      where id = NEW.related_payment_id;
    end if;

    if NEW.reference is not null then
      select * into v_order
      from public.orders
      where payment_reference = NEW.reference
      limit 1;

      v_order_balance := greatest(
        coalesce(v_order.total_amount,0) - coalesce(v_order.amount_paid,0),
        0
      );

      update public.orders
      set
        payment_status = case
          when NEW.status = 'rejected' then 'rejected'
          when v_order.id is not null and v_order_balance <= 0 then 'paid'
          else 'pending'
        end,
        updated_at = now()
      where payment_reference = NEW.reference;

      update public.estate_documentation_payments
      set
        status = case
          when NEW.status = 'approved' then 'completed'
          else 'rejected'
        end,
        updated_at = now()
      where reference = NEW.reference;
    end if;
  end if;

  return NEW;
end;
$$;


-- ============================================================
-- 3. Authoritative payment approval/rejection.
--    The request itself is finalized first; linked order totals are
--    reconciled from the authoritative request amount. The existing
--    installment trigger is allowed to do its work, then the final
--    order state is normalized.
-- ============================================================

create or replace function private.admin_approve_payment_request(
  _request_id uuid,
  _decision text,
  _notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  r public.payment_requests;
  caller uuid := auth.uid();
  o_before public.orders;
  o_after public.orders;
  expected_paid numeric;
  final_paid numeric;
  final_balance numeric;
begin
  if caller is null then
    raise exception 'Authentication required';
  end if;

  if not public.user_has_permission(caller,'admin:approve_payments') then
    raise exception 'You do not have permission to approve payments';
  end if;

  if lower(_decision) not in ('approved','rejected') then
    raise exception 'Invalid payment decision';
  end if;

  select * into r
  from public.payment_requests
  where id = _request_id
  for update;

  if not found then
    raise exception 'Payment request not found';
  end if;

  if r.status <> 'pending' then
    raise exception 'Payment request is already processed';
  end if;

  if r.amount is null or r.amount <= 0 then
    raise exception 'Invalid payment amount';
  end if;

  select public.resolve_payment_order(r.id) into o_before;

  if lower(_decision) = 'approved' then
    if o_before.id is not null then
      if r.amount > greatest(o_before.total_amount - coalesce(o_before.amount_paid,0),0) + 1 then
        raise exception 'Payment amount exceeds the outstanding order balance';
      end if;
      expected_paid := least(
        coalesce(o_before.total_amount,0),
        coalesce(o_before.amount_paid,0) + r.amount
      );
    else
      expected_paid := null;
    end if;

    update public.payment_requests
    set
      status = 'approved',
      processed_by = caller,
      processed_at = now(),
      admin_notes = nullif(trim(coalesce(_notes,'')),''),
      updated_at = now()
    where id = r.id;

    -- For full/ordinary gateway requests without an installment record,
    -- the request transition trigger does not increase orders.amount_paid.
    -- Reconcile it here without double-counting installment-triggered updates.
    if o_before.id is not null then
      select * into o_after
      from public.orders
      where id = o_before.id
      for update;

      final_paid := greatest(
        coalesce(o_after.amount_paid,0),
        coalesce(expected_paid,0)
      );
      final_paid := least(coalesce(o_after.total_amount,0), final_paid);
      final_balance := greatest(coalesce(o_after.total_amount,0) - final_paid, 0);

      update public.orders
      set
        amount_paid = final_paid,
        balance = final_balance,
        payment_status = case when final_balance <= 0 then 'paid' else 'pending' end,
        updated_at = now()
      where id = o_after.id;
    end if;

  else
    update public.payment_requests
    set
      status = 'rejected',
      processed_by = caller,
      processed_at = now(),
      admin_notes = nullif(trim(coalesce(_notes,'')),''),
      updated_at = now()
    where id = r.id;
  end if;

  -- Keep an explicit audit record for every financial decision.
  insert into public.payment_request_audit_log(
    payment_request_id,
    admin_id,
    action,
    previous_status,
    new_status,
    reason,
    amount
  )
  values(
    r.id,
    caller,
    lower(_decision),
    'pending',
    lower(_decision),
    nullif(trim(coalesce(_notes,'')),''),
    r.amount
  );

  if o_before.id is not null then
    select * into o_after from public.orders where id = o_before.id;
  end if;

  return jsonb_build_object(
    'success', true,
    'request_id', r.id,
    'decision', lower(_decision),
    'order_id', o_after.id,
    'amount_paid', coalesce(o_after.amount_paid,0),
    'balance', coalesce(o_after.balance,0)
  );
end;
$$;

create or replace function public.admin_approve_payment_request(
  _request_id uuid,
  _decision text,
  _notes text default null
)
returns jsonb
language sql
set search_path=public
as $$
  select private.admin_approve_payment_request($1,$2,$3);
$$;

revoke all on function public.admin_approve_payment_request(uuid,text,text) from public,anon;
grant execute on function public.admin_approve_payment_request(uuid,text,text) to authenticated;
revoke all on function private.admin_approve_payment_request(uuid,text,text) from public,anon;
grant execute on function private.admin_approve_payment_request(uuid,text,text) to authenticated,service_role;
