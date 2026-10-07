create or replace function public.validate_client_allocation_order()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  order_row public.orders%rowtype;
  has_verified_item boolean := false;
begin
  if new.order_id is null then
    raise exception 'A purchased order is required for client allocation';
  end if;

  select * into order_row from public.orders where id = new.order_id;

  if not found then
    raise exception 'The selected purchased order could not be verified';
  end if;

  if order_row.user_id is distinct from new.user_id then
    raise exception 'The selected order does not belong to the selected client';
  end if;

  if not (
    coalesce(order_row.amount_paid, 0) > 0
    or lower(coalesce(order_row.payment_status, '')) in ('paid', 'completed', 'awaiting_approval')
  ) then
    raise exception 'The selected order does not have a qualifying payment';
  end if;

  if new.property_id is not null then
    select exists (
      select 1 from jsonb_array_elements(
        case when jsonb_typeof(order_row.items) = 'array' then order_row.items else '[]'::jsonb end
      ) as item
      where item->>'property_id' = new.property_id
    ) into has_verified_item;
  else
    select exists (
      select 1 from jsonb_array_elements(
        case when jsonb_typeof(order_row.items) = 'array' then order_row.items else '[]'::jsonb end
      ) as item
      where nullif(item->>'plot_id', '') is not null
    ) into has_verified_item;
  end if;

  if not has_verified_item then
    raise exception 'The selected property could not be verified against the purchased order';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_client_allocation_order on public.client_allocations;

create trigger trg_validate_client_allocation_order
before insert or update of user_id, order_id, property_id
on public.client_allocations
for each row
execute function public.validate_client_allocation_order();

revoke all on function public.validate_client_allocation_order() from public;
grant execute on function public.validate_client_allocation_order() to authenticated;
