import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Pencil, Plus, Trash2, RefreshCw, ShieldCheck, Users, CheckCircle2, Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

type AdminUser = { id: string; email: string; legacy_role: string | null; rbac_roles: string[] };
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

const normalizeAccounts = (value: string | null | undefined) =>
  [...new Set((value || '').split(/[,\n;]+/).map(v => v.trim().toLowerCase()).filter(Boolean))];

const AdminMailboxManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [editing, setEditing] = useState<Mailbox | null>(null);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('gmail');
  const [googleAccounts, setGoogleAccounts] = useState('');
  const [accessLevel, setAccessLevel] = useState('full');
  const [isPrimary, setIsPrimary] = useState(false);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const [managerResult, mailboxResult] = await Promise.all([
      supabase.rpc('list_privileged_mailbox_managers'),
      supabase.from('admin_mailboxes').select('*').order('mailbox_email'),
    ]);

    if (managerResult.error) toast({ title: 'Unable to load authorized administrators', description: managerResult.error.message, variant: 'destructive' });
    else setUsers((managerResult.data || []) as AdminUser[]);
    if (mailboxResult.error) toast({ title: 'Unable to load mailboxes', description: mailboxResult.error.message, variant: 'destructive' });
    else setMailboxes((mailboxResult.data || []) as Mailbox[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null); setUserId(''); setEmail(''); setProvider('gmail'); setGoogleAccounts('');
    setAccessLevel('full'); setIsPrimary(false); setActive(true);
  };

  const edit = (mailbox: Mailbox) => {
    setEditing(mailbox); setUserId(mailbox.user_id); setEmail(mailbox.mailbox_email);
    setProvider(mailbox.mailbox_provider); setGoogleAccounts(mailbox.mailbox_provider === 'gmail' ? (mailbox.provider_account_id || '') : '');
    setAccessLevel(mailbox.access_level); setIsPrimary(mailbox.is_primary); setActive(mailbox.status === 'active');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId || !email.trim()) return;
    if (!users.some(u => u.id === userId)) {
      toast({ title: 'Administrator not authorized', description: 'This account is not authorized to manage mailbox assignments.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const assignedAccounts = provider === 'gmail' ? normalizeAccounts(googleAccounts) : [];
    const payload = {
      user_id: userId,
      mailbox_email: email.trim().toLowerCase(),
      mailbox_provider: provider,
      provider_account_id: assignedAccounts.join(',') || null,
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mailboxes;
    return mailboxes.filter(m => `${m.mailbox_email} ${m.mailbox_provider} ${m.provider_account_id || ''} ${users.find(u => u.id === m.user_id)?.email || ''}`.toLowerCase().includes(q));
  }, [mailboxes, users, search]);

  const totalGoogleAssignments = useMemo(() => new Set(mailboxes.flatMap(m => m.mailbox_provider === 'gmail' ? normalizeAccounts(m.provider_account_id) : [])).size, [mailboxes]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/55 p-5 shadow-[0_20px_70px_-30px_rgba(15,23,42,.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 md:p-7">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-white/30 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/10"><Mail className="h-6 w-6 text-primary" /></div>
            <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-bold tracking-tight">Mailbox & Google Access</h3><span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">RBAC protected</span></div><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Assign company mailboxes to authorized administrators and define which Google accounts are allowed to authenticate for each mailbox.</p></div>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="bg-white/50 backdrop-blur-xl dark:bg-white/5"><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/25 bg-white/45 p-4 backdrop-blur-xl dark:bg-white/5"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Mailbox assignments</span><Mail className="h-4 w-4 text-primary" /></div><div className="mt-2 text-2xl font-bold">{mailboxes.length}</div></div>
          <div className="rounded-2xl border border-white/25 bg-white/45 p-4 backdrop-blur-xl dark:bg-white/5"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Active</span><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div><div className="mt-2 text-2xl font-bold">{mailboxes.filter(m => m.status === 'active').length}</div></div>
          <div className="rounded-2xl border border-white/25 bg-white/45 p-4 backdrop-blur-xl dark:bg-white/5"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Assigned Google accounts</span><ShieldCheck className="h-4 w-4 text-sky-500" /></div><div className="mt-2 text-2xl font-bold">{totalGoogleAssignments}</div></div>
        </div>

        <form onSubmit={save} className="rounded-2xl border border-white/25 bg-white/45 p-5 shadow-inner backdrop-blur-xl dark:bg-white/5">
          <div className="mb-5 flex items-center justify-between gap-3"><div><h4 className="font-semibold">{editing ? 'Edit mailbox assignment' : 'Assign a company mailbox'}</h4><p className="text-xs text-muted-foreground">For Gmail, add one or more Google accounts that are permitted to authenticate for this company mailbox.</p></div>{editing && <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>}</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2"><Label>Administrator</Label><select className="h-10 w-full rounded-xl border bg-background/60 px-3 text-sm backdrop-blur" value={userId} onChange={e => setUserId(e.target.value)} required><option value="">Select administrator</option>{users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}</select></div>
            <div className="space-y-2"><Label>Company mailbox</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="support@bridgeforthomes.com" className="rounded-xl bg-background/60" required /></div>
            <div className="space-y-2"><Label>Provider</Label><select className="h-10 w-full rounded-xl border bg-background/60 px-3 text-sm backdrop-blur" value={provider} onChange={e => setProvider(e.target.value)}>{PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            {provider === 'gmail' && <div className="space-y-2 md:col-span-2 xl:col-span-3"><Label>Assigned Google accounts</Label><Input value={googleAccounts} onChange={e => setGoogleAccounts(e.target.value)} placeholder="support@bridgeforthomes.com, delegated@gmail.com" className="rounded-xl bg-background/60" /><p className="text-xs text-muted-foreground">Separate multiple accounts with commas. Only these Google identities can connect and operate this mailbox.</p></div>}
            <div className="space-y-2"><Label>Access level</Label><select className="h-10 w-full rounded-xl border bg-background/60 px-3 text-sm" value={accessLevel} onChange={e => setAccessLevel(e.target.value)}><option value="full">Full</option><option value="read">Read</option><option value="send">Send</option></select></div>
            <div className="flex items-center gap-6 pt-7"><label className="flex items-center gap-2 text-sm"><Switch checked={isPrimary} onCheckedChange={setIsPrimary} />Primary</label><label className="flex items-center gap-2 text-sm"><Switch checked={active} onCheckedChange={setActive} />Active</label></div>
            <div className="flex gap-2 pt-6"><Button type="submit" disabled={saving}>{editing ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{saving ? 'Saving...' : editing ? 'Update assignment' : 'Assign mailbox'}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
          </div>
        </form>

        <div className="rounded-2xl border border-white/25 bg-white/35 backdrop-blur-xl dark:bg-white/5">
          <div className="flex flex-col gap-3 border-b border-white/20 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h4 className="font-semibold">Current assignments</h4><p className="text-xs text-muted-foreground">Each assignment keeps mailbox access and Google authentication authorization separate.</p></div><div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search mailbox, admin or Google account" className="rounded-xl bg-background/50 pl-9" />{search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-muted-foreground" /></button>}</div></div>
          {loading ? <div className="p-8 text-center text-sm text-muted-foreground">Loading assignments...</div> : filtered.length === 0 ? <div className="p-8 text-center"><Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" /><p className="font-medium">No assignments found</p></div> : <div className="divide-y divide-white/20">{filtered.map(mailbox => { const admin = users.find(u => u.id === mailbox.user_id); const accounts = normalizeAccounts(mailbox.provider_account_id); return <div key={mailbox.id} className="flex flex-col gap-4 p-4 transition-colors hover:bg-white/25 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{mailbox.mailbox_email}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${mailbox.status === 'active' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>{mailbox.status}</span>{mailbox.is_primary && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">Primary</span>}</div><div className="mt-1 text-xs text-muted-foreground">{admin?.email || mailbox.user_id} · {mailbox.mailbox_provider} · {mailbox.access_level}</div>{mailbox.mailbox_provider === 'gmail' && <div className="mt-2 flex flex-wrap gap-1.5">{accounts.length ? accounts.map(account => <span key={account} className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-700 dark:text-sky-300">Google: {account}</span>) : <span className="text-[11px] text-amber-600 dark:text-amber-300">No Google account assigned</span>}</div>}</div><div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" onClick={() => edit(mailbox)}><Pencil className="mr-1.5 h-4 w-4" />Edit</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(mailbox)} aria-label={`Delete ${mailbox.mailbox_email}`}><Trash2 className="h-4 w-4" /></Button></div></div>; })}</div>}
        </div>
      </div>
    </section>
  );
};

export default AdminMailboxManagement;
