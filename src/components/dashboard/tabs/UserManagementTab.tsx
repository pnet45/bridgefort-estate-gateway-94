import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, UserPlus, Users, Unlock, Lock, Search, ArrowUpDown, ShieldCheck, RefreshCw } from 'lucide-react';
import { logAdminActivity } from '@/utils/logAdminActivity';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface RoleOption { name: string; display_name: string; description?: string | null; }
interface UserWithRole {
  id: string; email: string; first_name: string | null; last_name: string | null; created_at: string;
  role: string | null; roleDisplay: string; isGlobalAdmin: boolean; account_locked: boolean; account_locked_reason: string | null;
}
interface LockedAccount { email: string; attempt_count: number; last_attempt: string; }
type SortKey = 'name' | 'email' | 'role' | 'created_at';

const UserManagementTab = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [lockedAccounts, setLockedAccounts] = useState<LockedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'client' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: profiles, error: profilesError }, { data: usersData, error: usersError }, { data: userRoles, error: rolesError }, { data: adminRoles, error: adminRolesError }, { data: roleOptions, error: roleOptionsError }] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, created_at, account_locked, account_locked_reason'),
        supabase.from('users').select('id, email'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('admin_roles').select('user_id, role_name, expires_at'),
        supabase.from('roles').select('name, display_name, description').order('display_name')
      ]);
      if (profilesError) throw profilesError;
      if (usersError) throw usersError;
      if (rolesError) throw rolesError;
      if (adminRolesError) throw adminRolesError;
      if (roleOptionsError) throw roleOptionsError;

      const now = Date.now();
      const activeAdminRoles = (adminRoles || []).filter((r: any) => !r.expires_at || new Date(r.expires_at).getTime() > now);
      const combined: UserWithRole[] = (profiles || []).map((profile: any) => {
        const account = (usersData || []).find((u: any) => u.id === profile.id);
        const adminRole = activeAdminRoles.find((r: any) => r.user_id === profile.id);
        const genericRole = (userRoles || []).find((r: any) => r.user_id === profile.id);
        const effectiveRole = adminRole?.role_name || genericRole?.role || null;
        const global = effectiveRole === 'admin_dir' || effectiveRole === 'super_admin';
        const display = adminRole ? ((roleOptions || []).find((r: any) => r.name === adminRole.role_name)?.display_name || adminRole.role_name) : ((roleOptions || []).find((r: any) => r.name === genericRole?.role)?.display_name || genericRole?.role || 'No role');
        return { id: profile.id, email: account?.email || 'Unknown', first_name: profile.first_name, last_name: profile.last_name, created_at: profile.created_at, role: effectiveRole, roleDisplay: display, isGlobalAdmin: global, account_locked: !!profile.account_locked, account_locked_reason: profile.account_locked_reason || null };
      });
      setUsers(combined);
      setRoles((roleOptions || []).filter((r: any) => !['admin_dir', 'super_admin', 'admin_acct', 'admin_adm', 'admin_sales', 'admin_cs', 'admin_legal', 'admin_it'].includes(r.name)) as RoleOption[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users and roles');
    } finally { setLoading(false); }
  };

  const fetchLockedAccounts = async () => {
    try {
      const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { data, error } = await supabase.from('failed_login_attempts').select('email, attempted_at').gte('attempted_at', since).order('attempted_at', { ascending: false });
      if (error) throw error;
      const map = new Map<string, { count: number; last: string }>();
      (data || []).forEach((attempt: any) => { const item = map.get(attempt.email); if (item) { item.count += 1; item.last = attempt.attempted_at > item.last ? attempt.attempted_at : item.last; } else map.set(attempt.email, { count: 1, last: attempt.attempted_at }); });
      setLockedAccounts(Array.from(map.entries()).filter(([, v]) => v.count >= 5).map(([email, v]) => ({ email, attempt_count: v.count, last_attempt: v.last })));
    } catch (error) { console.error('Error fetching locked accounts:', error); }
  };

  useEffect(() => { fetchData(); fetchLockedAccounts(); }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...users].filter(u => {
      const name = `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase();
      const matchesSearch = !q || name.includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'locked' ? u.account_locked : !u.account_locked);
      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      const av = sortKey === 'name' ? `${a.first_name || ''} ${a.last_name || ''}` : sortKey === 'role' ? a.roleDisplay : sortKey === 'email' ? a.email : a.created_at;
      const bv = sortKey === 'name' ? `${b.first_name || ''} ${b.last_name || ''}` : sortKey === 'role' ? b.roleDisplay : sortKey === 'email' ? b.email : b.created_at;
      return String(av).localeCompare(String(bv)) * (sortAsc ? 1 : -1);
    });
  }, [users, search, roleFilter, statusFilter, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => { if (sortKey === key) setSortAsc(v => !v); else { setSortKey(key); setSortAsc(true); } };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error('Email and password are required');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', { body: { email: formData.email, password: formData.password, firstName: formData.firstName, lastName: formData.lastName, role: formData.role } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(data?.message || 'User created successfully');
      setDialogOpen(false); setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'client' }); await fetchData();
    } catch (error: any) { toast.error(error.message || 'Failed to create user'); }
    finally { setCreating(false); }
  };

  const handleUpdateRole = async (target: UserWithRole, newRole: string) => {
    if (target.isGlobalAdmin) return toast.error('Admin-Dir and Super_Admin roles are protected');
    try {
      const { error } = await supabase.rpc('admin_set_user_role', { _target_user_id: target.id, _role: newRole });
      if (error) throw error;
      await logAdminActivity({ actionType: 'user_role_updated', actionDescription: `Updated role for ${target.email} to ${newRole}`, entityType: 'user', entityId: target.id, metadata: { role: newRole } });
      toast.success('Role updated successfully'); await fetchData();
    } catch (error: any) { toast.error(error.message || 'Failed to update role'); }
  };

  const handleToggleLock = async (target: UserWithRole) => {
    if (target.isGlobalAdmin) return toast.error('Global administrator accounts are protected');
    const locking = !target.account_locked;
    const reason = locking ? (window.prompt('Reason for locking this account:', 'Account under review') || 'Account locked by admin') : null;
    try {
      const { error } = await supabase.from('profiles').update({ account_locked: locking, account_locked_reason: reason, account_locked_at: locking ? new Date().toISOString() : null }).eq('id', target.id);
      if (error) throw error;
      await logAdminActivity({ actionType: locking ? 'user_account_locked' : 'user_account_unlocked', actionDescription: `${locking ? 'Locked' : 'Unlocked'} account for ${target.email}`, entityType: 'user', entityId: target.id, metadata: locking ? { reason } : undefined });
      toast.success(locking ? 'Account locked' : 'Account unlocked'); await fetchData();
    } catch (error: any) { toast.error(error.message || 'Failed to update account'); }
  };

  const handleUnlockAccount = async (email: string) => {
    setUnlocking(email);
    try { const { error } = await supabase.rpc('clear_failed_logins', { clear_email: email }); if (error) throw error; toast.success(`Account ${email} has been unlocked`); await fetchLockedAccounts(); }
    catch (error: any) { toast.error(error.message || 'Failed to unlock account'); }
    finally { setUnlocking(null); }
  };

  const cycleSort = (key: SortKey) => <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => handleSort(key)} aria-label={`Sort by ${key}`}><ArrowUpDown className="h-3.5 w-3.5" /></Button>;

  return (
    <div className="space-y-5">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />User Management</CardTitle><CardDescription>Manage user accounts, roles and account security. Global administrators are protected.</CardDescription></div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { fetchData(); fetchLockedAccounts(); }}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" />Create User</Button></DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Create New User</DialogTitle><DialogDescription>Enter the account details below. The form adapts to the screen size and submits all fields together.</DialogDescription></DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="First name" /></div>
                      <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last name" /></div>
                      <div className="space-y-2"><Label htmlFor="role">Role</Label><Select value={formData.role} onValueChange={role => setFormData({ ...formData, role })}><SelectTrigger id="role"><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="client">Client</SelectItem>{roles.map(r => <SelectItem key={r.name} value={r.name}>{r.display_name}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2 lg:col-span-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="name@company.com" /></div>
                      <div className="space-y-2"><Label htmlFor="password">Password *</Label><PasswordInput id="password" required minLength={6} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Minimum 6 characters" /></div>
                    </div>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={creating}>{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create User</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative lg:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." className="pl-9" /></div>
            <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger><SelectValue placeholder="Filter by role" /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem>{Array.from(new Map(users.map(u => [u.role, u.roleDisplay])).entries()).filter(([role]) => role).sort((a,b) => a[1].localeCompare(b[1])).map(([role,label]) => <SelectItem key={role} value={role as string}>{label}</SelectItem>)}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Filter status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="locked">Locked</SelectItem></SelectContent></Select>
          </div>

          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Name {cycleSort('name')}</TableHead><TableHead>Email {cycleSort('email')}</TableHead><TableHead>Role {cycleSort('role')}</TableHead><TableHead>Joined {cycleSort('created_at')}</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredUsers.length === 0 ? <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No users match the current filters.</TableCell></TableRow> : filteredUsers.map(user => <TableRow key={user.id} className={user.isGlobalAdmin ? 'bg-muted/30' : undefined}><TableCell className="font-medium">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}</TableCell><TableCell>{user.email}</TableCell><TableCell><div className="flex items-center gap-2"><Badge variant={user.isGlobalAdmin ? 'default' : 'secondary'}>{user.roleDisplay}</Badge>{user.isGlobalAdmin && <ShieldCheck className="h-4 w-4 text-primary" />}</div></TableCell><TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell><TableCell>{user.account_locked ? <Badge variant="destructive">Locked</Badge> : <Badge variant="outline">Active</Badge>}</TableCell><TableCell><div className="flex justify-end gap-2">{user.isGlobalAdmin ? <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3.5 w-3.5" />Protected</Badge> : <><Select value={user.role || ''} onValueChange={value => handleUpdateRole(user, value)}><SelectTrigger className="w-40"><SelectValue placeholder="Change role" /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r.name} value={r.name}>{r.display_name}</SelectItem>)}</SelectContent></Select><Button size="icon" variant="outline" onClick={() => handleToggleLock(user)} title={user.account_locked ? 'Unlock account' : 'Lock account'}>{user.account_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</Button></>}</div></TableCell></TableRow>)}</TableBody></Table></div>}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Recent Login Protection</CardTitle><CardDescription>Accounts with five or more failed attempts in the last 15 minutes.</CardDescription></CardHeader><CardContent>{lockedAccounts.length === 0 ? <p className="text-sm text-muted-foreground">No recently locked accounts.</p> : <div className="space-y-2">{lockedAccounts.map(account => <div key={account.email} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{account.email}</p><p className="text-xs text-muted-foreground">{account.attempt_count} failed attempts · {new Date(account.last_attempt).toLocaleString()}</p></div><Button variant="outline" size="sm" disabled={unlocking === account.email} onClick={() => handleUnlockAccount(account.email)}>{unlocking === account.email && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}<Unlock className="mr-2 h-4 w-4" />Unlock</Button></div>)}</div>}</CardContent></Card>
    </div>
  );
};

export default UserManagementTab;
