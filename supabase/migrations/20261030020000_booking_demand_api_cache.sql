-- Booking.com Demand API 3.2: server-only cache for static destination reference data.
-- Live prices and availability are never cached; they are fetched on demand.

create table if not exists public.booking_demand_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.booking_demand_cache enable row level security;
revoke all on table public.booking_demand_cache from public, anon, authenticated;
grant all on table public.booking_demand_cache to service_role;

create index if not exists booking_demand_cache_expiry_idx
  on public.booking_demand_cache(expires_at);

comment on table public.booking_demand_cache is
  'Server-only cache for static Booking.com Demand API reference data. Never store live prices or availability here.';
