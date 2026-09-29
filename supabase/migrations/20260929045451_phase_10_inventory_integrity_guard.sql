-- Phase 10: protect estate inventory counts from new invalid values.
-- Existing inconsistent rows are intentionally not modified by this migration.

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

  return new;
end;
$$;

drop trigger if exists estate_inventory_counts_guard on public.estate;

create trigger estate_inventory_counts_guard
before insert or update of total_plots, sold_plots
on public.estate
for each row
execute function public.validate_estate_inventory_counts();
