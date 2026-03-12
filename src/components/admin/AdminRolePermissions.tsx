import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

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

const AdminRolePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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
