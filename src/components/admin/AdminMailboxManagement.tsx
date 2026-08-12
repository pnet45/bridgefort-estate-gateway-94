import React, { useEffect, useState } from 'react';
import { Mail, Pencil, Plus, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

type AdminUser = { id: string; email: string; role: string | null };
type Mailbox = {
  id: string;
  user_id: string;
  mailbox_email: string;
  mailbox_provider: string;
  provider_account_id: string | null;
  is_primary: boolean;
  access_level: string;
  status: string;
};

const PROVIDERS = ['gmail', 'outlook', 'other'];

const AdminMailboxManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [editing, setEditing] = useState<Mailbox | null>(null);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('gmail');
  const [providerAccountId, setProviderAccountId] = useState('');
  const [accessLevel, setAccessLevel] = useState('full');
  const [isPrimary, setIsPrimary] = useState(false);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [userResult, mailboxResult] = await Promise.all([
      supabase.from('users').select('id,email,role').order('email'),
      supabase.from('admin_mailboxes').select('*').order('mailbox_email'),
    ]);
    if (userResult.error) toast({ title: 'Unable to load administrators', description: userResult.error.message, variant: 'destructive' });
    else setUsers((userResult.data || []).filter((u: AdminUser) => u.role?.startsWith('admin') || u.role === 'super_admin'));
    if (mailboxResult.error) toast({ title: 'Unable to load mailboxes', description: mailboxResult.error.message, variant: 'destructive' });
    else setMailboxes((mailboxResult.data || []) as Mailbox[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null); setUserId(''); setEmail(''); setProvider('gmail'); setProviderAccountId('');
    setAccessLevel('full'); setIsPrimary(false); setActive(true);
  };

  const edit = (mailbox: Mailbox) => {
    setEditing(mailbox); setUserId(mailbox.user_id); setEmail(mailbox.mailbox_email);
    setProvider(mailbox.mailbox_provider); setProviderAccountId(mailbox.provider_account_id || '');
    setAccessLevel(mailbox.access_level); setIsPrimary(mailbox.is_primary); setActive(mailbox.status === 'active');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId || !email.trim()) return;
    setSaving(true);
    const payload = {
      user_id: userId,
      mailbox_email: email.trim().toLowerCase(),
      mailbox_provider: provider,
      provider_account_id: providerAccountId.trim() || null,
      is_primary: isPrimary,
      access_level: accessLevel,
      status: active ? 'active' : 'inactive',
    };
    const result = editing
      ? await supabase.from('admin_mailboxes').update(payload).eq('id', editing.id)
      : await supabase.from('admin_mailboxes').insert(payload);
    if (result.error) toast({ title: 'Mailbox assignment failed', description: result.error.message, variant: 'destructive' });
    else { toast({ title: editing ? 'Mailbox assignment updated' : 'Mailbox assigned' }); reset(); await load(); }
    setSaving(false);
  };

  const remove = async (mailbox: Mailbox) => {
    if (!window.confirm(`Remove ${mailbox.mailbox_email} from this administrator?`)) return;
    const { error } = await supabase.from('admin_mailboxes').delete().eq('id', mailbox.id);
    if (error) toast({ title: 'Mailbox could not be removed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Mailbox assignment removed' }); await load(); }
  };

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><Mail className="h-5 w-5 text-primary" /></div><div><h3 className="font-semibold">Mailbox Assignment</h3><p className="text-sm text-muted-foreground">Create and assign company mailboxes to authorized administrators.</p></div></div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
      </div>

      <form onSubmit={save} className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1"><Label>Administrator</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={userId} onChange={e => setUserId(e.target.value)} required><option value="">Select administrator</option>{users.map(u => <option key={u.id} value={u.id}>{u.email}{u.role ? ` — ${u.role}` : ''}</option>)}</select></div>
        <div className="space-y-2"><Label>Mailbox email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="support@bridgeforthomes.com" required /></div>
        <div className="space-y-2"><Label>Provider</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={provider} onChange={e => setProvider(e.target.value)}>{PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
        <div className="space-y-2"><Label>Provider account ID <span className="text-muted-foreground">(optional)</span></Label><Input value={providerAccountId} onChange={e => setProviderAccountId(e.target.value)} /></div>
        <div className="space-y-2"><Label>Access level</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={accessLevel} onChange={e => setAccessLevel(e.target.value)}><option value="full">Full</option><option value="read">Read</option><option value="send">Send</option></select></div>
        <div className="flex items-center gap-6 pt-7"><label className="flex items-center gap-2 text-sm"><Switch checked={isPrimary} onCheckedChange={setIsPrimary} />Primary</label><label className="flex items-center gap-2 text-sm"><Switch checked={active} onCheckedChange={setActive} />Active</label></div>
        <div className="flex gap-2 md:col-span-2 lg:col-span-3"><Button type="submit" disabled={saving}>{editing ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{editing ? 'Update Assignment' : 'Assign Mailbox'}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
      </form>

      <div className="overflow-hidden rounded-lg border">
        <div className="border-b px-4 py-3 font-medium">Current Assignments</div>
        {loading ? <div className="p-5 text-sm text-muted-foreground">Loading mailbox assignments...</div> : mailboxes.length === 0 ? <div className="p-5 text-sm text-muted-foreground">No mailbox assignments found.</div> : <div className="divide-y">{mailboxes.map(mailbox => { const admin = users.find(u => u.id === mailbox.user_id); return <div key={mailbox.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-medium">{mailbox.mailbox_email}</div><div className="text-xs text-muted-foreground">{admin?.email || mailbox.user_id} · {mailbox.mailbox_provider} · {mailbox.access_level} · {mailbox.status}{mailbox.is_primary ? ' · Primary' : ''}</div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => edit(mailbox)}><Pencil className="mr-1 h-4 w-4" />Edit</Button><Button variant="ghost" size="sm" className="text-red-500" onClick={() => remove(mailbox)}><Trash2 className="h-4 w-4" /></Button></div></div>; })}</div>}
      </div>
    </section>
  );
};

export default AdminMailboxManagement;
