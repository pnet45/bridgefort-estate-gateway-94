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
  const { user } = useAuth();
  const { isSuperAdmin } = useIsSuperAdmin();
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [hiddenTabs, setHiddenTabs] = useState<string[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuUpdating, setMenuUpdating] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    (async () => {
      setMenuLoading(true);
      const { data: roles, error: rolesError } = await supabase.from('admin_roles').select('user_id,role_name,expires_at').order('role_name');
      if (rolesError) {
        toast({ title: 'Unable to load admin accounts', description: rolesError.message, variant: 'destructive' });
        setMenuLoading(false);
        return;
      }
      const activeRoles = (roles || []).filter((row: any) => !row.expires_at || new Date(row.expires_at).getTime() > Date.now());
      const ids = Array.from(new Set(activeRoles.map((row: any) => row.user_id as string)));
      const { data: profiles, error: profileError } = ids.length
        ? await supabase.from('profiles').select('id,first_name,last_name').in('id', ids)
        : { data: [], error: null };
      if (cancelled) return;
      if (profileError) toast({ title: 'Unable to load admin profiles', description: profileError.message, variant: 'destructive' });
      const names = new Map<string, string>((profiles || []).map((p: any) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(' ').trim()]));
      const accounts = ids.map((id) => ({
        user_id: id,
        role_name: activeRoles.find((row: any) => row.user_id === id)?.role_name || 'admin',
        display_name: names.get(id) || id,
      })).filter((account) => account.user_id !== user?.id && account.role_name !== 'super_admin');
      setAdminAccounts(accounts);
      if (accounts.length) setSelectedAdminId((current) => accounts.some((a) => a.user_id === current) ? current : accounts[0].user_id);
      setMenuLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isSuperAdmin, user?.id]);

  useEffect(() => {
    if (!isSuperAdmin || !selectedAdminId) { setHiddenTabs([]); return; }
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
  }, [isSuperAdmin, selectedAdminId]);

  const toggleAdminTab = async (tabKey: string) => {
    if (!selectedAdminId || !isSuperAdmin) return;
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
    <div className="space-y-6">
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" />Admin Menu Access</CardTitle>
            <p className="text-sm text-muted-foreground">Choose which Admin Console tabs each other admin can see. Hidden tabs are also blocked when a user opens a tab URL directly. Global Admin accounts are excluded from this editor.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {menuLoading ? <div className="flex justify-center py-5"><Loader2 className="h-6 w-6 animate-spin" /></div> : adminAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other admin accounts were found.</p>
            ) : (
              <>
                <div className="max-w-xl space-y-2">
                  <Label>Select admin account</Label>
                  <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                    <SelectTrigger><SelectValue placeholder="Choose an admin" /></SelectTrigger>
                    <SelectContent>{adminAccounts.map((account) => <SelectItem key={account.user_id} value={account.user_id}>{account.display_name} — {account.role_name.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(ADMIN_TAB_PERMISSION_MAP).map(([tabKey, permissionKey]) => {
                    const visible = !hiddenTabs.includes(tabKey);
                    return <div key={tabKey} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                      <div className="min-w-0"><Label>{ADMIN_TAB_LABELS[tabKey] || tabKey}</Label><p className="mt-1 text-xs text-muted-foreground">{permissionKey}</p></div>
                      <Switch checked={visible} onCheckedChange={() => void toggleAdminTab(tabKey)} disabled={!selectedAdminId || menuUpdating === tabKey || tabKey === 'permissions'} aria-label={`Show ${ADMIN_TAB_LABELS[tabKey] || tabKey}`} />
                    </div>;
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
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
    </div>
  );
};

export default AdminRolePermissions;
