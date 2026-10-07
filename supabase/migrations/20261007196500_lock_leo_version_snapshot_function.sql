-- Keep Leo knowledge version snapshots server-side only.
revoke execute on function public.snapshot_leo_knowledge_version() from anon, authenticated;
grant execute on function public.snapshot_leo_knowledge_version() to service_role;
