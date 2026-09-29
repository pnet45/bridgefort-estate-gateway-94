-- Phase 10: keep sold-out state consistent with authoritative estate counts.
-- Existing inconsistent rows are intentionally not modified.

create or replace function public.validate_estate_inventory_counts()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.total_plots is not null and new.total_plots < 0 then
    raise exception 'total_plots cannot be negative';
  end if;

  if new.sold_plots is not null and new.sold_plots < 0 then
    raise exception 'sold_plots cannot be negative';
  end if;

  if new.total_plots is not null
     and new.sold_plots is not null
     and new.sold_plots > new.total_plots then
    raise exception 'sold_plots cannot exceed total_plots';
  end if;

  if new.total_plots is not null and new.sold_plots is not null then
    new.is_sold_out := new.sold_plots >= new.total_plots;
  end if;

  return new;
end;
$$;
