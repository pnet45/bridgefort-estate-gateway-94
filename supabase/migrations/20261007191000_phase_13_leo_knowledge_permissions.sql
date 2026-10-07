-- Leo knowledge-management permission
insert into public.permissions (key, label, category, description)
values (
  'admin:manage_ai_knowledge',
  'Manage Leo AI knowledge',
  'admin',
  'Create, update, publish, archive, review and reindex Leo business knowledge.'
)
on conflict (key) do update set
  label = excluded.label,
  category = excluded.category,
  description = excluded.description,
  updated_at = now();

insert into public.role_permissions (role, permission_key, is_enabled)
values
  ('super_admin','admin:manage_ai_knowledge',true),
  ('admin_dir','admin:manage_ai_knowledge',true),
  ('admin_it','admin:manage_ai_knowledge',true)
on conflict (role, permission_key)
do update set is_enabled = excluded.is_enabled, updated_at = now();

revoke all on function public.search_leo_knowledge(text,text,text[],integer) from anon, authenticated;
grant execute on function public.search_leo_knowledge(text,text,text[],integer) to service_role;
