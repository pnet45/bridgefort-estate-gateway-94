import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Shield, Settings2 } from 'lucide-react';
import { useIsSuperAdmin } from '@/hooks/useIsSuperAdmin';
import { useAuth } from '@/contexts/auth';
import { ADMIN_TAB_PERMISSION_MAP } from '@/lib/rbac';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Permission {
  id: string;
  role: string;
  permission_key: string;
  is_enabled: boolean;
}

const PERMISSION_LABELS: Record<string, string> = {
  can_view_properties: 'View Properties',
  can_purchase: 'Purchase Properties',
  can_book_inspection: 'Book Inspections',
  can_download_forms: 'Download Forms',
  can_view_blog: 'View Blog',
  can_register_training: 'Register for Training',
  can_refer_clients: 'Refer Clients',
  can_manage_inspections: 'Manage Inspections',
};

const ROLES = ['client', 'pbo', 'staff', 'guest'];

const ADMIN_TAB_LABELS: Record<string, string> = {
  overview: 'Dashboard', properties: 'Properties', allocations: 'Allocations', crm: 'CRM',
  users: 'Users', approvals: 'Approvals', subscribers: 'Subscribers', emails: 'Email Centre',
  analytics: 'Analytics', 'mlm-funnel': 'BHRealtors Funnel', activity: 'Activity Logs',
  content: 'Content', promotions: 'Promotions', 'leo-knowledge': 'Leo Knowledge',
  training: 'Training', cms: 'CMS Hub', gallery: 'Circular Gallery',
  'other-payments': 'Other Payments', permissions: 'Permissions', departments: 'Departments',
  travels: 'Travels',
};

interface AdminAccount { user_id: string; role_name: string; display_name: string; }

const AdminRolePermissions = () => {
  const { user, userRole, hasPermission } = useAuth();
  const { isSuperAdmin } = useIsSuperAdmin();
  const normalizedRole = String(userRole || '').trim().toLowerCase();
  const isDirectoryAdmin = normalizedRole === 'admin_dir' || normalizedRole === 'super_admin';
  const canManageAdminMenus = isSuperAdmin || isDirectoryAdmin || normalizedRole === 'manager' || hasPermission('admin:manage_permissions') || hasPermission('admin:all');
  const canManageRolePermissions = isSuperAdmin || isDirectoryAdmin || hasPermission('admin:manage_permissions') || hasPermission('admin:all');
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [hiddenTabs, setHiddenTabs] = useState<string[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuUpdating, setMenuUpdating] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (canManageRolePermissions) void fetchPermissions();
    else setLoading(false);
  }, [canManageRolePermissions]);

  useEffect(() => {
    if (!canManageAdminMenus) return;
    let cancelled = false;
    (async () => {
      setMenuLoading(true);
      const { data: accountsData, error: accountsError } = await supabase.rpc('get_manageable_admin_accounts');
      if (accountsError) {
        toast({ title: 'Unable to load admin accounts', description: accountsError.message, variant: 'destructive' });
        setMenuLoading(false);
        return;
      }
      if (cancelled) return;
      const accounts = ((accountsData || []) as Array<{ user_id: string; role_name: string; display_name: string }>)
        .filter((account) => account.user_id !== user?.id);
      setAdminAccounts(accounts);
      if (accounts.length) setSelectedAdminId((current) => accounts.some((a) => a.user_id === current) ? current : accounts[0].user_id);
      setMenuLoading(false);
    })();
    return () => { cancelled = true; };
  }, [canManageAdminMenus, user?.id]);

  useEffect(() => {
    if (!canManageAdminMenus || !selectedAdminId) { setHiddenTabs([]); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('admin_menu_visibility').select('tab_key,is_visible').eq('user_id', selectedAdminId);
      if (cancelled) return;
      if (error) {
        toast({ title: 'Unable to load menu access', description: error.message, variant: 'destructive' });
        return;
      }
      setHiddenTabs((data || []).filter((row: any) => row.is_visible === false).map((row: any) => row.tab_key));
    })();
    return () => { cancelled = true; };
  }, [canManageAdminMenus, selectedAdminId]);

  const toggleAdminTab = async (tabKey: string) => {
    if (!selectedAdminId || !canManageAdminMenus) return;
    const hide = !hiddenTabs.includes(tabKey);
    setMenuUpdating(tabKey);
    const { error } = await supabase.from('admin_menu_visibility').upsert({
      user_id: selectedAdminId, tab_key: tabKey, is_visible: !hide,
      updated_by: user?.id, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,tab_key' });
    if (error) {
      toast({ title: 'Could not update menu access', description: error.message, variant: 'destructive' });
    } else {
      setHiddenTabs((current) => hide ? [...current, tabKey] : current.filter((key) => key !== tabKey));
      toast({ title: 'Admin menu updated', description: `${ADMIN_TAB_LABELS[tabKey] || tabKey} is now ${hide ? 'hidden from' : 'visible to'} the selected admin.` });
    }
    setMenuUpdating(null);
  };

  const fetchPermissions = async () => {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .order('role');
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setPermissions(data || []);
    }
    setLoading(false);
  };

  const togglePermission = async (perm: Permission) => {
    setUpdating(perm.id);
    const { error } = await supabase
      .from('role_permissions')
      .update({ is_enabled: !perm.is_enabled, updated_at: new Date().toISOString() })
      .eq('id', perm.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setPermissions(prev => prev.map(p => p.id === perm.id ? { ...p, is_enabled: !p.is_enabled } : p));
    }
    setUpdating(null);
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
        <div className="flex items-start gap-3"><Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><div className="min-w-0"><h2 className="font-semibold">Admin access control</h2><p className="mt-1 text-sm text-muted-foreground">Assign only the workspaces each admin needs. Menu visibility and action permissions are separate safeguards; sensitive actions remain subject to server-side authorization.</p></div></div>
      </div>
      {canManageAdminMenus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" />Admin Menu Access</CardTitle>
            <p className="text-sm text-muted-foreground">Choose which Admin Console tabs each other admin can access. This also filters Leo’s admin navigation. Global Admin accounts and your own account are protected from changes. Hiding a tab does not grant permissions that the admin does not already have.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {menuLoading ? <div className="flex justify-center py-5"><Loader2 className="h-6 w-6 animate-spin" /></div> : adminAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other admin accounts were found.</p>
            ) : (
              <>
                <div className="w-full max-w-xl space-y-2">
                  <Label>Select admin account</Label>
                  <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                    <SelectTrigger className="min-h-11 w-full"><SelectValue placeholder="Choose an admin" /></SelectTrigger>
                    <SelectContent>{adminAccounts.map((account) => <SelectItem key={account.user_id} value={account.user_id}>{account.display_name} — {account.role_name.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(ADMIN_TAB_PERMISSION_MAP).map(([tabKey, permissionKey]) => {
                    const visible = !hiddenTabs.includes(tabKey);
                    return <div key={tabKey} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 sm:p-4">
                      <div className="min-w-0 flex-1"><Label>{ADMIN_TAB_LABELS[tabKey] || tabKey}</Label><p className="mt-1 text-xs text-muted-foreground">{permissionKey}</p></div>
                      <Switch checked={visible} onCheckedChange={() => void toggleAdminTab(tabKey)} disabled={!selectedAdminId || menuUpdating === tabKey || tabKey === 'permissions' || (tabKey === 'permissions' && !isSuperAdmin)} aria-label={`Show ${ADMIN_TAB_LABELS[tabKey] || tabKey}`} />
                    </div>;
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
      {canManageRolePermissions && <>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Role Permissions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ROLES.map(role => {
          const rolePerms = permissions.filter(p => p.role === role);
          return (
            <Card key={role}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Badge variant="outline">{role}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rolePerms.map(perm => (
                  <div key={perm.id} className="flex items-center justify-between">
                    <Label className="text-sm">{PERMISSION_LABELS[perm.permission_key] || perm.permission_key}</Label>
                    <Switch
                      checked={perm.is_enabled}
                      onCheckedChange={() => togglePermission(perm)}
                      disabled={updating === perm.id}
                    />
                  </div>
                ))}
                {rolePerms.length === 0 && (
                  <p className="text-sm text-muted-foreground">No permissions configured</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      </>}
    </div>
  );
};

export default AdminRolePermissions;
