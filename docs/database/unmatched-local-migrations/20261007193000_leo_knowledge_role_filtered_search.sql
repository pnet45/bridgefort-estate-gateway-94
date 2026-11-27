-- Leo knowledge retrieval hardening
-- Adds role-array authorization and review/expiry checks to the server-only search path.

create or replace function public.search_leo_knowledge_v2(
  p_query text,
  p_allowed_audiences text[] default array['public']::text[],
  p_roles text[] default array['customer']::text[],
  p_limit integer default 6
)
returns table(
  id uuid,
  document_id uuid,
  title text,
  source_url text,
  audience text,
  topics text[],
  heading text,
  content text,
  rank real
)
language sql
security definer
set search_path=public
as $$
  with q as (
    select websearch_to_tsquery(
      'simple',
      regexp_replace(trim(coalesce(p_query,'')), '\s+', ' OR ', 'g')
    ) as query
  )
  select
    c.id,c.document_id,d.title,d.source_url,d.audience,d.topics,c.heading,c.content,
    ts_rank_cd(c.search_vector,q.query) as rank
  from public.leo_knowledge_chunks c
  join public.leo_knowledge_documents d on d.id=c.document_id
  cross join q
  where d.status='published'
    and d.audience = any(p_allowed_audiences)
    and (
      d.audience='public'
      or (d.audience='staff' and 'admin' = any(coalesce(p_roles,'{}'::text[])))
      or (
        d.audience='restricted'
        and exists (
          select 1
          from unnest(coalesce(d.allowed_roles,'{}'::text[])) allowed_role
          where allowed_role = any(coalesce(p_roles,'{}'::text[]))
        )
      )
    )
    and (
      d.metadata->>'expires_at' is null
      or (d.metadata->>'expires_at')::timestamptz >= now()
    )
    and (
      d.metadata->>'review_date' is null
      or (d.metadata->>'review_date')::date <= current_date
    )
    and q.query is not null
    and c.search_vector @@ q.query
  order by rank desc,d.updated_at desc,c.chunk_index
  limit greatest(1,least(coalesce(p_limit,6),12));
$$;

revoke all on function public.search_leo_knowledge_v2(text,text[],text[],integer) from public,anon,authenticated;
grant execute on function public.search_leo_knowledge_v2(text,text[],text[],integer) to service_role;
