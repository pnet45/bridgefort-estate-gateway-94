create table if not exists public.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marketing_enabled boolean not null default true,
  account_updates_enabled boolean not null default true,
  training_enabled boolean not null default true,
  travel_enabled boolean not null default true,
  property_updates_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.email_preferences enable row level security;
revoke all on public.email_preferences from anon;
grant select, insert, update on public.email_preferences to authenticated;
grant all on public.email_preferences to service_role;

drop policy if exists "Users can view own email preferences" on public.email_preferences;
create policy "Users can view own email preferences" on public.email_preferences for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own email preferences" on public.email_preferences;
create policy "Users can insert own email preferences" on public.email_preferences for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own email preferences" on public.email_preferences;
create policy "Users can update own email preferences" on public.email_preferences for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.email_preference_enabled(p_user_id uuid,p_category text)
returns boolean language sql stable security invoker set search_path = public, pg_catalog
as $$
  select case lower(coalesce(p_category, ''))
    when 'marketing' then coalesce(ep.marketing_enabled, true)
    when 'account_updates' then coalesce(ep.account_updates_enabled, true)
    when 'training' then coalesce(ep.training_enabled, true)
    when 'travel' then coalesce(ep.travel_enabled, true)
    when 'property_updates' then coalesce(ep.property_updates_enabled, true)
    else true
  end
  from (select 1) x
  left join public.email_preferences ep on ep.user_id = p_user_id;
$$;

revoke all on function public.email_preference_enabled(uuid,text) from public;
grant execute on function public.email_preference_enabled(uuid,text) to authenticated, service_role;