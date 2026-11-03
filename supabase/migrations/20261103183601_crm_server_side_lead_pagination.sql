-- Server-side CRM lead filtering, pagination, full-dataset metrics and export support.
-- SECURITY INVOKER preserves the caller's existing CRM RLS visibility.
-- This migration is intentionally additive and does not alter CRM policies.

create index if not exists crm_leads_created_id_page_idx
  on public.crm_leads (created_at desc, id desc);

create index if not exists crm_follow_ups_lead_pending_schedule_idx
  on public.crm_follow_ups (lead_id, scheduled_at asc, id asc)
  where completed_at is null and cancelled_at is null;

create or replace function public.get_crm_lead_page(
  p_search text default null,
  p_status text default null,
  p_assignee uuid default null,
  p_unassigned boolean default false,
  p_priority text default null,
  p_source text default null,
  p_overdue_only boolean default false,
  p_page integer default 1,
  p_page_size integer default 25
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with visible_leads as (
    select l.*
    from public.crm_leads as l
    where
      (nullif(btrim(p_search), '') is null
        or strpos(lower(coalesce(l.name, '')), lower(btrim(p_search))) > 0
        or strpos(lower(coalesce(l.email, '')), lower(btrim(p_search))) > 0
        or strpos(coalesce(l.phone, ''), btrim(p_search)) > 0)
      and (nullif(p_status, '') is null or l.status = p_status)
      and (p_unassigned is false or l.assigned_to is null)
      and (p_assignee is null or l.assigned_to = p_assignee)
      and (nullif(p_priority, '') is null or l.priority = p_priority)
      and (nullif(p_source, '') is null or l.source = p_source)
      and (
        p_overdue_only is false
        or exists (
          select 1
          from public.crm_follow_ups as overdue
          where overdue.lead_id = l.id
            and overdue.completed_at is null
            and overdue.cancelled_at is null
            and overdue.scheduled_at < now()
        )
      )
  ),
  page_rows as (
    select
      to_jsonb(l) || jsonb_build_object('next_action', to_jsonb(next_action)) as item
    from visible_leads as l
    left join lateral (
      select f.id, f.lead_id, f.scheduled_at, f.completed_at, f.action_type,
             f.notes, f.created_at, f.cancelled_at, f.completion_notes
      from public.crm_follow_ups as f
      where f.lead_id = l.id
        and f.completed_at is null
        and f.cancelled_at is null
      order by f.scheduled_at asc, f.id asc
      limit 1
    ) as next_action on true
    order by l.created_at desc, l.id desc
    limit least(greatest(coalesce(p_page_size, 25), 1), 1000)
    offset (greatest(coalesce(p_page, 1), 1) - 1)
      * least(greatest(coalesce(p_page_size, 25), 1), 1000)
  ),
  filtered_count as (
    select count(*)::bigint as total_count from visible_leads
  ),
  all_metrics as (
    select
      count(*)::bigint as total,
      count(*) filter (where l.status = 'new')::bigint as new,
      count(*) filter (where l.status = 'qualified')::bigint as qualified,
      count(*) filter (where l.status = 'won')::bigint as won,
      count(*) filter (where l.status in ('won', 'lost'))::bigint as closed,
      coalesce(sum(l.conversion_value) filter (where l.status = 'won'), 0) as won_value,
      count(*) filter (where exists (
        select 1 from public.crm_follow_ups as f
        where f.lead_id = l.id
          and f.completed_at is null
          and f.cancelled_at is null
          and f.scheduled_at < now()
      ))::bigint as overdue
    from public.crm_leads as l
  )
  select jsonb_build_object(
    'rows', coalesce((select jsonb_agg(item) from page_rows), '[]'::jsonb),
    'total_count', (select total_count from filtered_count),
    'metrics', (
      select jsonb_build_object(
        'total', total,
        'new', new,
        'qualified', qualified,
        'won', won,
        'overdue', overdue,
        'won_value', won_value,
        'closed', closed,
        'win_rate', case when closed > 0 then round((won::numeric / closed) * 100)::integer else 0 end
      )
      from all_metrics
    )
  );
$$;

revoke all on function public.get_crm_lead_page(text, text, uuid, boolean, text, text, boolean, integer, integer) from public, anon;
grant execute on function public.get_crm_lead_page(text, text, uuid, boolean, text, text, boolean, integer, integer) to authenticated;
