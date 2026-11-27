alter table public.inspection_bookings
  add column if not exists crm_lead_id uuid references public.crm_leads(id) on delete set null,
  add column if not exists service_journey_id uuid references public.service_journeys(id) on delete set null;

create index if not exists idx_inspection_bookings_crm_lead_id on public.inspection_bookings(crm_lead_id);
create index if not exists idx_inspection_bookings_service_journey_id on public.inspection_bookings(service_journey_id);

create or replace function public.capture_inspection_crm_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estate_id uuid;
  v_name text;
  v_phone text;
  v_lead_id uuid;
  v_journey_id uuid;
begin
  select id into v_estate_id from public.estate where lower(name) = lower(new.estate_name) order by created_at desc nulls last limit 1;
  select nullif(btrim(concat_ws(' ', first_name, last_name)), ''), phone into v_name, v_phone from public.profiles where id = new.user_id;

  select id into v_lead_id from public.crm_leads
  where source_record_type = 'inspection_booking' and source_record_id = new.id limit 1;

  if v_lead_id is null then
    insert into public.crm_leads(
      name,email,phone,source,status,estate_interest,estate_id,customer_id,
      source_record_type,source_record_id,priority,notes
    )
    values (
      coalesce(v_name, new.email, 'Inspection customer'), new.email, v_phone, 'inspection',
      'new', new.estate_name, v_estate_id, new.user_id,
      'inspection_booking', new.id, 'high', new.message
    )
    on conflict (source_record_type, source_record_id)
      where source_record_type is not null and source_record_id is not null
      do update set updated_at = now()
    returning id into v_lead_id;
  end if;

  select id into v_journey_id from public.service_journeys
  where source_record_type = 'inspection_booking' and source_record_id = new.id limit 1;

  if v_journey_id is null then
    insert into public.service_journeys(
      customer_id,lead_id,service_type,status,priority,source,
      estate_id,source_record_type,source_record_id,notes
    )
    values (
      new.user_id, v_lead_id, 'INSPECTION', 'NEW', 'HIGH', 'inspection', v_estate_id,
      'inspection_booking', new.id,
      concat('Inspection requested for ', new.estate_name, ' on ', new.inspection_date::text,
        ' at ', new.inspection_time::text,
        case when coalesce(new.message,'') <> '' then concat('. ', new.message) else '' end)
    )
    returning id into v_journey_id;
  end if;

  update public.inspection_bookings
  set crm_lead_id = v_lead_id, service_journey_id = v_journey_id, updated_at = now()
  where id = new.id;

  return new;
end;
$$;

revoke all on function public.capture_inspection_crm_lead() from public, anon, authenticated;
grant execute on function public.capture_inspection_crm_lead() to service_role;