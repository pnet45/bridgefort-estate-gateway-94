-- Aggregate CRM staff performance in Postgres instead of downloading all leads
-- and follow-ups to the browser. SECURITY INVOKER preserves existing CRM RLS.
-- The protected admin directory ensures only active, named administrator accounts
-- are returned. This migration does not alter tables, grants, or RLS policies.

create or replace function public.get_crm_staff_performance(
  p_month_start timestamptz,
  p_month_end timestamptz
)
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  new_leads bigint,
  won_leads bigint,
  lost_leads bigint,
  won_value numeric,
  completed_follow_ups bigint,
  pending_follow_ups bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with active_admins as (
    select directory.user_id, directory.first_name, directory.last_name
    from public.get_crm_admin_assignees() as directory
  ),
  lead_metrics as (
    select
      l.assigned_to as user_id,
      count(*) filter (
        where l.created_at >= p_month_start and l.created_at < p_month_end
      )::bigint as new_leads,
      count(*) filter (
        where l.closed_at >= p_month_start and l.closed_at < p_month_end
          and l.status = 'won'
      )::bigint as won_leads,
      count(*) filter (
        where l.closed_at >= p_month_start and l.closed_at < p_month_end
          and l.status = 'lost'
      )::bigint as lost_leads,
      coalesce(sum(l.conversion_value) filter (
        where l.closed_at >= p_month_start and l.closed_at < p_month_end
          and l.status = 'won'
      ), 0)::numeric as won_value
    from public.crm_leads as l
    join active_admins as a on a.user_id = l.assigned_to
    group by l.assigned_to
  ),
  follow_up_metrics as (
    select
      l.assigned_to as user_id,
      count(*) filter (
        where f.completed_at >= p_month_start and f.completed_at < p_month_end
      )::bigint as completed_follow_ups,
      count(*) filter (
        where f.completed_at is null and f.cancelled_at is null
      )::bigint as pending_follow_ups
    from public.crm_leads as l
    join active_admins as a on a.user_id = l.assigned_to
    join public.crm_follow_ups as f on f.lead_id = l.id
    group by l.assigned_to
  )
  select
    a.user_id,
    a.first_name,
    a.last_name,
    coalesce(lm.new_leads, 0),
    coalesce(lm.won_leads, 0),
    coalesce(lm.lost_leads, 0),
    coalesce(lm.won_value, 0),
    coalesce(fm.completed_follow_ups, 0),
    coalesce(fm.pending_follow_ups, 0)
  from active_admins as a
  left join lead_metrics as lm on lm.user_id = a.user_id
  left join follow_up_metrics as fm on fm.user_id = a.user_id
  order by a.first_name nulls last, a.last_name nulls last;
$$;

revoke all on function public.get_crm_staff_performance(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_crm_staff_performance(timestamptz, timestamptz) to authenticated;
