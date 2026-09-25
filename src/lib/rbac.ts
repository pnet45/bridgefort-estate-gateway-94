export const ADMIN_TAB_PERMISSION_MAP: Record<string, string> = {
  overview: 'admin:view_dashboard',
  properties: 'admin:view_properties',
  crm: 'admin:view_crm',
  users: 'admin:view_users',
  approvals: 'admin:view_approvals',
  subscribers: 'admin:view_subscribers',
  emails: 'admin:view_email_center',
  analytics: 'admin:view_analytics',
  'mlm-funnel': 'admin:view_mlm_funnel',
  activity: 'admin:view_activity',
  content: 'admin:view_content',
  training: 'admin:view_dashboard',
  cms: 'admin:view_cms',
  gallery: 'admin:view_cms',
  'other-payments': 'admin:view_other_payments',
  permissions: 'admin:manage_permissions',
  departments: 'admin:manage_departments',
  travels: 'admin:view_travels',
};

export const CANONICAL_PERMISSION_ALIASES: Record<string, string[]> = {
  'crm.view': ['admin:view_crm'],
  'crm.create': ['admin:view_crm'],
  'crm.edit': ['admin:view_crm'],
  'crm.assign': ['admin:view_crm'],
  'crm.export': ['admin:view_crm'],
  'property.view': ['admin:view_properties'],
  'property.create': ['admin:view_properties'],
  'property.edit': ['admin:view_properties'],
  'property.publish': ['admin:view_properties'],
  'payment.view': ['admin:view_approvals'],
  'payment.verify': ['admin:view_approvals'],
  'payment.approve': ['admin:view_approvals'],
  'booking.view': ['admin:view_travels'],
  'booking.manage': ['admin:view_travels'],
  'approvals.view': ['admin:view_approvals'],
  'approvals.decide': ['admin:view_approvals'],
  'users.view': ['admin:view_users'],
  'users.manage': ['admin:view_users'],
  'roles.view': ['admin:manage_permissions'],
  'roles.manage': ['admin:manage_permissions'],
  'reports.view': ['admin:view_analytics'],
  'reports.export': ['admin:view_analytics'],
};

export function hasPermission(permissionSet: string[] | null | undefined, required: string | string[]): boolean {
  if (!permissionSet || permissionSet.length === 0) return false;
  const requiredPermissions = Array.isArray(required) ? required : [required];
  return requiredPermissions.some((permission) => {
    if (!permission) return false;
    if (permission === 'admin:all' || permission === 'super_admin') return true;
    return permissionSet.includes(permission) || (CANONICAL_PERMISSION_ALIASES[permission] ?? []).some((alias) => permissionSet.includes(alias)) || permissionSet.includes('admin:all');
  });
}

export function getAllowedAdminTabs(permissionSet: string[] | null | undefined): string[] {
  return Object.entries(ADMIN_TAB_PERMISSION_MAP)
    .filter(([, permissionKey]) => hasPermission(permissionSet, permissionKey))
    .map(([tabKey]) => tabKey);
}

export const ADMIN_ROLE_NAMES = new Set([
  'super_admin', 'admin', 'manager', 'team_leader', 'associate', 'staff',
  'admin_dir', 'admin_adm', 'admin_acct', 'admin_sales', 'admin_cs', 'admin_legal', 'admin_it',
]);

export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && ADMIN_ROLE_NAMES.has(role);
}

export function getPrimaryRole(roles: string[] | null | undefined): string | null {
  if (!roles || roles.length === 0) return null;
  const ordered = [
    'super_admin', 'admin_dir', 'admin',
    'admin_adm', 'admin_acct', 'admin_sales', 'admin_cs', 'admin_legal', 'admin_it',
    'manager', 'team_leader', 'associate', 'staff',
  ];
  for (const role of ordered) if (roles.includes(role)) return role;
  return roles[0] ?? null;
}
