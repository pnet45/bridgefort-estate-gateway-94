-- Phase 11: Account/RBAC reconciliation
-- Legacy admin rows are preserved for audit/history, but the legacy
-- "admin" role is no longer an authorization source.
update public.role_permissions
set is_enabled = false,
    updated_at = now()
where role = 'admin'
  and is_enabled is distinct from false;
