create or replace function public.get_pbo_referral_leaderboard()
returns table(pbo_id uuid, first_name text, last_initial text, current_package text, current_rank text, downline_count bigint)
language sql
stable
security definer
set search_path = public
as $function$
  select p.id as pbo_id,
    p.first_name,
    left(coalesce(p.last_name, ''), 1) as last_initial,
    p.current_package,
    p.current_rank,
    count(d.id) as downline_count
  from public.profiles p
  left join public.profiles d on d.referred_by_id = p.id
  where p.is_pbo = true
  group by p.id, p.first_name, p.last_name, p.current_package, p.current_rank
  having count(d.id) > 0
    and (
      public.is_global_admin(auth.uid())
      or exists (
        select 1
        from public.profiles me
        where me.id = auth.uid()
          and me.is_pbo = true
      )
    )
  order by count(d.id) desc;
$function$;

revoke execute on function public.get_pbo_referral_leaderboard() from anon;
grant execute on function public.get_pbo_referral_leaderboard() to authenticated;
