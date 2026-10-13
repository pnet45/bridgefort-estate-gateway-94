create table if not exists public.leo_public_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null default now(),
  message_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.leo_public_rate_limits enable row level security;
revoke all on public.leo_public_rate_limits from public, anon, authenticated;
grant all on public.leo_public_rate_limits to service_role;

create index if not exists leo_public_rate_limits_updated_at_idx
  on public.leo_public_rate_limits (updated_at);

create or replace function public.consume_leo_public_rate_limit(
  p_rate_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  is_allowed boolean;
begin
  if p_rate_key is null or length(p_rate_key) > 128
    or p_limit is null or p_window_seconds is null
    or p_limit < 1 or p_limit > 100
    or p_window_seconds < 1 or p_window_seconds > 3600 then
    raise exception 'Invalid Leo public rate limit arguments';
  end if;

  insert into public.leo_public_rate_limits (rate_key, window_started_at, message_count, updated_at)
  values (p_rate_key, now(), 1, now())
  on conflict (rate_key) do update
  set message_count = case
        when public.leo_public_rate_limits.window_started_at
          <= now() - make_interval(secs => p_window_seconds)
          then 1
        else public.leo_public_rate_limits.message_count + 1
      end,
      window_started_at = case
        when public.leo_public_rate_limits.window_started_at
          <= now() - make_interval(secs => p_window_seconds)
          then now()
        else public.leo_public_rate_limits.window_started_at
      end,
      updated_at = now()
  returning message_count <= p_limit into is_allowed;

  if random() < 0.01 then
    delete from public.leo_public_rate_limits
    where updated_at < now() - interval '7 days';
  end if;

  return is_allowed;
end;
$$;

revoke all on function public.consume_leo_public_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_leo_public_rate_limit(text, integer, integer)
  to service_role;
