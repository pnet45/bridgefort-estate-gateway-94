-- Separate BMC decision authority from the general approvals-view permission.
-- Only designated management roles receive this by default. Global admins retain
-- their existing global-admin authority through the canonical RBAC helper.

insert into public.permissions (key, label, category, description)
values (
  'admin:manage_bmc_partners',
  'Manage BMC partners',
  'admin',
  'Approve, reject, suspend, reinstate and reopen BMC division applications'
)
on conflict (key) do update
set label = excluded.label,
    category = excluded.category,
    description = excluded.description,
    updated_at = now();

insert into public.role_permissions (role, permission_key, is_enabled)
values
  ('super_admin', 'admin:manage_bmc_partners', true),
  ('manager', 'admin:manage_bmc_partners', true)
on conflict (role, permission_key) do update
set is_enabled = true,
    updated_at = now();

comment on table public.permissions is
  'Canonical permission catalogue. admin:manage_bmc_partners is separate from admin:view_approvals.';
