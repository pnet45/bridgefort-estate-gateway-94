import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useIsGlobalAdmin } from '@/hooks/useIsGlobalAdmin';
import { Loader2, Shield, LockKeyhole } from 'lucide-react';

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
const ADMIN_TAB_PERMISSIONS = [{"key":"admin:view_dashboard","label":"Dashboard"},{"key":"admin:view_properties","label":"Properties"},{"key":"admin:view_allocations","label":"Allocations"},{"key":"admin:view_documentation","label":"Documentation"},{"key":"admin:view_crm","label":"CRM"},{"key":"admin:view_users","label":"Users"},{"key":"admin:view_approvals","label":"Approvals"},{"key":"admin:view_subscribers","label":"Subscribers"},{"key":"admin:view_email_center","label":"Emails"},{"key":"admin:view_analytics","label":"Analytics"},{"key":"admin:view_mlm_funnel","label":"MLM Funnel"},{"key":"admin:view_activity","label":"Activity Logs"},{"key":"admin:view_content","label":"Content Management"},{"key":"admin:view_cms","label":"CMS Hub and Gallery"},{"key":"admin:view_other_payments","label":"Other Payments"},{"key":"admin:manage_departments","label":"Departments"},{"key":"admin:view_travels","label":"Travels"}] as const;
const ADMIN_ROLES = [{"key":"admin","label":"Administrator"},{"key":"admin_adm","label":"Admin & Operations"},{"key":"admin_acct","label":"Manager Admin"},{"key":"admin_sales","label":"Sales Admin"},{"key":"admin_cs","label":"Customer Service Admin"},{"key":"admin_legal","label":"Legal Admin"},{"key":"admin_it","label":"IT Admin"}] as const;


const AdminRolePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { isGlobalAdmin, loading: globalAdminLoading } = useIsGlobalAdmin();

  useEffect(() => {
    fetchPermissions();
  }, []);

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

  const toggleAdminTab = async (role: string, permissionKey: string, enabled: boolean) => {
    if (!isGlobalAdmin) return;
    const updateKey = role + ':' + permissionKey;
    setUpdating(updateKey);
    const { error } = await supabase
      .from('role_permissions')
      .upsert({ role, permission_key: permissionKey, is_enabled: enabled, updated_at: new Date().toISOString() }, { onConflict: 'role,permission_key' });
    if (error) {
      toast({ title: 'Could not update admin tab access', description: error.message, variant: 'destructive' });
      await fetchPermissions();
    } else {
      await fetchPermissions();
      toast({ title: 'Admin tab access updated', description: role + (enabled ? ' can now access ' : ' can no longer access ') + (ADMIN_TAB_PERMISSIONS.find(item => item.key === permissionKey)?.label || permissionKey) + '.' });
    }
    setUpdating(null);
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

  if (loading || globalAdminLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {isGlobalAdmin && (
        <section className="space-y-4 rounded-xl border p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-lg font-bold">Admin Tab Access</h2>
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Choose which workspace tabs each administrator role can see. Changes affect navigation access only; existing server-side permissions and data protections still apply.</p>
              </div>
            </div>
            <Badge variant="outline">Global admin only</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {ADMIN_ROLES.map(role => (
              <Card key={role.key} className="min-w-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{role.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">{role.key}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ADMIN_TAB_PERMISSIONS.map(tab => {
                    const permission = permissions.find(item => item.role === role.key && item.permission_key === tab.key);
                    const enabled = permission?.is_enabled === true;
                    const busy = updating === role.key + ':' + tab.key || (permission ? updating === permission.id : false);
                    return (
                      <div key={tab.key} className="flex min-h-10 items-center justify-between gap-3 border-b pb-2 last:border-0 last:pb-0">
                        <Label className="min-w-0 flex-1 text-sm leading-5">{tab.label}</Label>
                        <Switch checked={enabled} onCheckedChange={(value) => void toggleAdminTab(role.key, tab.key, value)} disabled={busy || !isGlobalAdmin} aria-label={role.label + ': ' + tab.label} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
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
