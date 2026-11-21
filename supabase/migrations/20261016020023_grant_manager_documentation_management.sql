-- The manager admin can view the Email Center; grant the matching documentation
-- management permission so the legal-document controls are usable by that role.
update public.role_permissions
set is_enabled = true
where role = 'manager'
  and permission_key = 'admin:manage_documentation';
