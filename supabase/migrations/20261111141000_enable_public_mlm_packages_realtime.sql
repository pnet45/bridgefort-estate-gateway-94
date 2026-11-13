-- Public BHRealtor package pricing is cached in the browser and refreshed
-- from this table's Realtime events. Keep the publication limited to this
-- public reference/pricing table; private wallet and commission tables are
-- deliberately not included.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'mlm_packages'
     )
  then
    alter publication supabase_realtime add table public.mlm_packages;
  end if;
end
$$;
