-- Bridgefort Travels Stage 1.5: public enquiry protection and canonical permissions.
-- This migration is committed to a review branch only. Do not apply to production
-- until migration parity, SQL review, and release approval are complete.

create table if not exists public.travel_enquiry_rate_limits (
  client_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.travel_enquiry_rate_limits enable row level security;
revoke all on table public.travel_enquiry_rate_limits from public, anon, authenticated;
grant all on table public.travel_enquiry_rate_limits to service_role;

create or replace function public.consume_travel_enquiry_rate_limit(
  _client_key text,
  _window_seconds integer default 900,
  _max_requests integer default 5
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_request_count integer;
begin
  if _client_key is null
     or length(_client_key) <> 64
     or _client_key !~ '^[0-9a-f]{64}$'
     or _window_seconds < 60
     or _window_seconds > 86400
     or _max_requests < 1
     or _max_requests > 100 then
    raise exception 'Invalid travel enquiry rate-limit parameters';
  end if;

  insert into public.travel_enquiry_rate_limits as current_limit (
    client_key, window_started_at, request_count, updated_at
  )
  values (_client_key, now(), 1, now())
  on conflict (client_key) do update
  set
    window_started_at = case
      when current_limit.window_started_at <= now() - make_interval(secs => _window_seconds)
        then now()
      else current_limit.window_started_at
    end,
    request_count = case
      when current_limit.window_started_at <= now() - make_interval(secs => _window_seconds)
        then 1
      else current_limit.request_count + 1
    end,
    updated_at = now()
  returning request_count into v_request_count;

  return v_request_count <= _max_requests;
end;
$function$;

revoke all on function public.consume_travel_enquiry_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_travel_enquiry_rate_limit(text, integer, integer)
  to service_role;

-- Public customers must submit through submit-travel-booking so validation,
-- rate limiting, CRM linkage, and customer/admin notifications remain atomic
-- at the application boundary. The Edge Function uses the service role.
drop policy if exists "Anyone can submit a travel booking" on public.travel_bookings;
drop policy if exists "travel_bookings_staff_insert" on public.travel_bookings;
create policy "travel_bookings_staff_insert"
  on public.travel_bookings
  for insert
  to authenticated
  with check (
    public.is_global_admin(auth.uid())
    or public.user_has_permission(auth.uid(), 'admin:manage_travels')
  );

revoke insert on table public.travel_bookings from anon;
grant insert on table public.travel_bookings to authenticated, service_role;

-- A view permission is not a management permission. Only manager admins receive
-- the explicit travel-management capability here; global admins bypass it.
insert into public.role_permissions (role, permission_key, is_enabled)
values ('admin_acct', 'admin:manage_travels', true)
on conflict (role, permission_key)
do update set is_enabled = excluded.is_enabled;

-- Correct the existing permissive update policy: booking.manage currently maps
-- to admin:view_travels and must not allow view-only staff to change bookings.
drop policy if exists "travel_bookings_staff_update" on public.travel_bookings;
create policy "travel_bookings_staff_update"
  on public.travel_bookings
  for update
  to authenticated
  using (
    public.is_global_admin(auth.uid())
    or public.user_has_permission(auth.uid(), 'admin:manage_travels')
  )
  with check (
    public.is_global_admin(auth.uid())
    or public.user_has_permission(auth.uid(), 'admin:manage_travels')
  );

-- Replace the legacy role-name check with the canonical permission system.
drop policy if exists "Admins manage blackouts" on public.travel_package_blackouts;
drop policy if exists "travel_package_blackouts_manage" on public.travel_package_blackouts;
create policy "travel_package_blackouts_manage"
  on public.travel_package_blackouts
  for all
  to authenticated
  using (
    public.is_global_admin(auth.uid())
    or public.user_has_permission(auth.uid(), 'admin:manage_travels')
  )
  with check (
    public.is_global_admin(auth.uid())
    or public.user_has_permission(auth.uid(), 'admin:manage_travels')
  );

comment on table public.travel_enquiry_rate_limits is
  'Hashed client keys for persistent public Bridgefort Travels enquiry throttling; no raw IP addresses are stored.';
