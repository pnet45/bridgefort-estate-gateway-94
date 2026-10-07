import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, RefreshCw, Search, MapPinned, UserRound, CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { hasPermission as hasRbacPermission } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

type AllocationStatus = 'pending' | 'allocated' | 'possession_ready' | 'possessed' | 'cancelled';

type Allocation = {
  id: string;
  user_id: string;
  estate_id: string | null;
  order_id: string | null;
  property_id: string | null;
  plot_id: string | null;
  plot_label: string | null;
  estate_name_snapshot: string;
  location_snapshot: string | null;
  allocation_status: AllocationStatus;
  allocation_date: string | null;
  possession_date: string | null;
  allocation_letter_url: string | null;
  source_reference: string | null;
  notes: string | null;
  last_notified_status: AllocationStatus | null;
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
};

type Estate = {
  id: string;
  name: string;
  location: string | null;
  phase: number | null;
  scheme: number | null;
};

type ClientProperty = {
  key: string;
  order_id: string;
  item_property_id: string | null;
  plot_id: string | null;
  property_name: string | null;
  property_type: string | null;
  payment_status: string | null;
  balance: number | null;
};

type FormState = {
  user_id: string;
  estate_id: string;
  order_id: string;
  property_id: string;
  plot_id: string;
  plot_label: string;
  allocation_status: AllocationStatus;
  allocation_date: string;
  possession_date: string;
  allocation_letter_url: string;
  source_reference: string;
  notes: string;
};

const emptyForm: FormState = {
  user_id: '',
  estate_id: '',
  order_id: '',
  property_id: '',
  plot_id: '',
  plot_label: '',
  allocation_status: 'pending',
  allocation_date: '',
  possession_date: '',
  allocation_letter_url: '',
  source_reference: '',
  notes: '',
};

const statusLabel: Record<AllocationStatus, string> = {
  pending: 'Pending',
  allocated: 'Allocated',
  possession_ready: 'Possession Ready',
  possessed: 'Possessed',
  cancelled: 'Cancelled',
};

const statusVariant = (status: AllocationStatus) => {
  if (status === 'possessed') return 'default';
  if (status === 'cancelled') return 'destructive';
  if (status === 'pending') return 'secondary';
  return 'outline';
};

const toInputDate = (value: string | null) => value ? value.slice(0, 10) : '';
const toInputDateTime = (value: string | null) => value ? value.slice(0, 16) : '';

const AdminClientAllocations: React.FC = () => {
  const { user, permissions } = useAuth();
  const canView = hasRbacPermission(permissions, ['admin:view_allocations', 'admin:manage_allocations']);
  const canManage = hasRbacPermission(permissions, 'admin:manage_allocations');

  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [clientProperties, setClientProperties] = useState<ClientProperty[]>([]);
  const [selectedPropertyKey, setSelectedPropertyKey] = useState('');
  const [orders, setOrders] = useState<Array<{ id: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Allocation | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AllocationStatus>('all');

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allocations.filter(a => {
      const client = clientMap.get(a.user_id);
      const haystack = [
        client?.name,
        client?.email,
        a.estate_name_snapshot,
        a.location_snapshot,
        a.plot_id,
        a.plot_label,
        a.source_reference,
      ].filter(Boolean).join(' ').toLowerCase();
      return (!q || haystack.includes(q)) && (statusFilter === 'all' || a.allocation_status === statusFilter);
    });
  }, [allocations, clientMap, search, statusFilter]);

  const load = async () => {
    if (!canView) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [allocationsResult, profilesResult, usersResult, estatesResult] = await Promise.all([
        supabase.from('client_allocations').select('*').order('updated_at', { ascending: false }),
        supabase.from('profiles').select('id,first_name,last_name').order('first_name'),
        supabase.from('users').select('id,email'),
        supabase.from('estate').select('id,name,location,phase,scheme').order('name'),
      ]);
      if (allocationsResult.error) throw allocationsResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (usersResult.error) throw usersResult.error;
      if (estatesResult.error) throw estatesResult.error;

      const emails = new Map((usersResult.data || []).map((u: any) => [u.id, u.email || '']));
      setClients((profilesResult.data || []).map((p: any) => ({
        id: p.id,
        name: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unnamed Client',
        email: emails.get(p.id) || '',
      })).filter((c: Client) => c.email));
      setAllocations((allocationsResult.data || []) as Allocation[]);
      setEstates((estatesResult.data || []) as Estate[]);
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Could not load allocations', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [canView]);

  useEffect(() => {
    const channel = supabase.channel('client-allocation-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_allocations' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [canView]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOrders([]);
    setClientProperties([]);
    setSelectedPropertyKey('');
    setDialogOpen(true);
  };

  const openEdit = async (allocation: Allocation) => {
    setEditing(allocation);
    setForm({
      user_id: allocation.user_id,
      estate_id: allocation.estate_id || '',
      order_id: allocation.order_id || '',
      property_id: allocation.property_id || '',
      plot_id: allocation.plot_id || '',
      plot_label: allocation.plot_label || '',
      allocation_status: allocation.allocation_status,
      allocation_date: toInputDateTime(allocation.allocation_date),
      possession_date: toInputDateTime(allocation.possession_date),
      allocation_letter_url: allocation.allocation_letter_url || '',
      source_reference: allocation.source_reference || '',
      notes: allocation.notes || '',
    });
    await loadOrders(allocation.user_id);
    const properties = await loadClientProperties(allocation.user_id);
    const matchedProperty = properties.find(p => p.item_property_id === allocation.property_id || p.plot_id === allocation.plot_id);
    setSelectedPropertyKey(matchedProperty?.key || '');
    setDialogOpen(true);
  };

  const loadClientProperties = async (userId: string): Promise<ClientProperty[]> => {
    if (!userId) {
      setClientProperties([]);
      return [];
    }

    // my_properties is a client-scoped view (auth.uid()), so an admin session
    // cannot use it to load another client's properties. Build the same
    // verified property records directly from that client's real orders/items.
    const { data, error } = await supabase
      .from('orders')
      .select('id,amount_paid,balance,payment_status,items,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast({ title: 'Could not load client properties', description: error.message, variant: 'destructive' });
      setClientProperties([]);
      return [];
    }

    const properties: ClientProperty[] = [];
    (data || []).forEach((order: any) => {
      const status = String(order.payment_status || '').toLowerCase();
      const qualifies = Number(order.amount_paid || 0) > 0 || ['paid', 'completed', 'awaiting_approval'].includes(status);
      if (!qualifies || !Array.isArray(order.items)) return;

      order.items.forEach((item: any, index: number) => {
        const propertyId = item?.property_id ? String(item.property_id) : null;
        const plotId = item?.plot_id ? String(item.plot_id) : null;
        if (!propertyId && !plotId) return;

        properties.push({
          key: order.id + ':' + index,
          order_id: order.id,
          item_property_id: propertyId,
          plot_id: plotId,
          property_name: item?.property_name ? String(item.property_name) : null,
          property_type: item?.property_type ? String(item.property_type) : null,
          payment_status: order.payment_status || null,
          balance: Number(order.balance || 0),
        });
      });
    });

    setClientProperties(properties);
    return properties;
  };

  const loadOrders = async (userId: string) => {
    if (!userId) {
      setOrders([]);
      return;
    }
    const { data, error } = await supabase
      .from('orders')
      .select('id,customer_email,customer_name,total_amount,payment_status,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      toast({ title: 'Could not load client orders', description: error.message, variant: 'destructive' });
      return;
    }
    setOrders((data || []).map((o: any) => ({
      id: o.id,
      label: `${o.customer_name || o.customer_email || 'Order'} • ${o.payment_status || 'pending'} • ₦${Number(o.total_amount || 0).toLocaleString('en-NG')}`,
    })));
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!canManage) return;
    if (!form.user_id || !form.estate_id || !form.property_id || !form.plot_id) {
      toast({ title: 'Missing verified property details', description: 'Select the client, estate and an existing client property before saving the allocation.', variant: 'destructive' });
      return;
    }

    const estate = estates.find(e => e.id === form.estate_id);
    const clientProperty = clientProperties.find(p => p.key === form.property_id);
    if (!estate || !clientProperty) {
      toast({ title: 'Property verification required', description: 'The selected property could not be verified against the client property records.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        user_id: form.user_id,
        estate_id: form.estate_id,
        order_id: clientProperty.order_id || form.order_id || null,
        property_id: clientProperty.item_property_id || null,
        plot_id: form.plot_id.trim(),
        plot_label: form.plot_label.trim() || null,
        estate_name_snapshot: estate.name,
        location_snapshot: estate.location || null,
        allocation_status: form.allocation_status,
        allocation_date: form.allocation_date ? new Date(form.allocation_date).toISOString() : null,
        possession_date: form.possession_date ? new Date(form.possession_date).toISOString() : null,
        allocation_letter_url: form.allocation_letter_url.trim() || null,
        source_reference: form.source_reference.trim() || null,
        notes: form.notes.trim() || null,
        updated_by: user?.id || null,
      };

      const result = editing
        ? await supabase.from('client_allocations').update(payload).eq('id', editing.id)
        : await supabase.from('client_allocations').insert({ ...payload, created_by: user?.id || null });

      if (result.error) throw result.error;
      toast({ title: editing ? 'Allocation updated' : 'Allocation created', description: 'The client engagement automation can now use this record.' });
      setDialogOpen(false);
      await load();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Could not save allocation', description: error?.message || 'Please check the plot and try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!canView) {
    return <Card><CardContent className="p-6 text-sm text-muted-foreground">You do not have permission to view client allocations.</CardContent></Card>;
  }

  return (
    <div className="space-y-5">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><MapPinned className="h-5 w-5 text-primary" /> Client Allocations & Possession</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">The operational record used by Bridgefort's allocation update automation.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
            {canManage && <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Allocation</Button>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client, estate or plot..." className="pl-9" /></div>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(statusLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Estate / Plot</TableHead><TableHead>Status</TableHead><TableHead>Allocation</TableHead><TableHead>Possession</TableHead><TableHead>Notification</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading allocations...</TableCell></TableRow> :
                  filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No allocation records yet. Create one only after the allocation has been verified.</TableCell></TableRow> :
                  filtered.map(a => {
                    const c = clientMap.get(a.user_id);
                    return <TableRow key={a.id}>
                      <TableCell><div className="font-medium">{c?.name || 'Unknown client'}</div><div className="text-xs text-muted-foreground">{c?.email || a.user_id}</div></TableCell>
                      <TableCell><div className="font-medium">{a.estate_name_snapshot}</div><div className="text-xs text-muted-foreground">{a.plot_id}{a.plot_label ? ` • ${a.plot_label}` : ''}</div></TableCell>
                      <TableCell><Badge variant={statusVariant(a.allocation_status) as any}>{statusLabel[a.allocation_status]}</Badge></TableCell>
                      <TableCell>{a.allocation_date ? new Date(a.allocation_date).toLocaleDateString('en-NG') : '—'}</TableCell>
                      <TableCell>{a.possession_date ? new Date(a.possession_date).toLocaleDateString('en-NG') : '—'}</TableCell>
                      <TableCell>{a.last_notified_status ? <span className="text-xs">{statusLabel[a.last_notified_status]}<br />{a.last_notified_at ? new Date(a.last_notified_at).toLocaleDateString('en-NG') : ''}</span> : <span className="text-xs text-muted-foreground">Not sent</span>}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => openEdit(a)} disabled={!canManage}><Pencil className="h-4 w-4" /></Button></TableCell>
                    </TableRow>;
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Client Allocation' : 'Create Verified Client Allocation'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Client *</label>
              <Select value={form.user_id} onValueChange={async v => { setField('user_id', v); setField('order_id', ''); setField('property_id', ''); setField('plot_id', ''); setSelectedPropertyKey(''); await loadOrders(v); await loadClientProperties(v); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent className="max-h-72">{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.email}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Estate *</label>
              <Select value={form.estate_id} onValueChange={v => setField('estate_id', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select estate" /></SelectTrigger>
                <SelectContent className="max-h-72">{estates.map(e => <SelectItem key={e.id} value={e.id}>{e.name}{e.phase ? ` • Phase ${e.phase}` : ''}{e.scheme ? ` • Scheme ${e.scheme}` : ''}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Existing Client Property *</label>
              <Select value={selectedPropertyKey || 'none'} onValueChange={v => {
                const property = clientProperties.find(p => p.key === v);
                setSelectedPropertyKey(v === 'none' ? '' : v);
                setField('property_id', property?.item_property_id || '');
                if (property?.order_id) setField('order_id', property.order_id);
                if (property?.plot_id) setField('plot_id', property.plot_id);
              }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select an existing client property" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="none">Select property</SelectItem>
                  {clientProperties.map((p, index) => {
                    const value = p.key;
                    if (!value) return null;
                    return <SelectItem key={value + index} value={value}>{p.property_name || p.property_type || 'Client property'}{p.plot_id ? ` • Plot ${p.plot_id}` : ''}{p.order_id ? ` • Order ${p.order_id.slice(0, 8)}` : ''}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">This must come from the client's existing property record; the allocation workflow should not create a property from scratch.</p>
            </div>
            <div>
              <label className="text-sm font-medium">Client Order</label>
              <Select value={form.order_id || 'none'} onValueChange={v => setField('order_id', v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Optional order" /></SelectTrigger>
                <SelectContent className="max-h-72"><SelectItem value="none">No linked order</SelectItem>{orders.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Allocated Plot ID *</label><Input className="mt-1" value={form.plot_id} onChange={e => setField('plot_id', e.target.value)} placeholder="Verified allocated plot" /></div>
            <div><label className="text-sm font-medium">Plot label / description</label><Input className="mt-1" value={form.plot_label} onChange={e => setField('plot_label', e.target.value)} placeholder="e.g. 500sqm corner plot" /></div>
            <div><label className="text-sm font-medium">Property ID</label><Input className="mt-1" value={form.property_id} readOnly placeholder="Selected from client property" /></div>
            <div>
              <label className="text-sm font-medium">Allocation status *</label>
              <Select value={form.allocation_status} onValueChange={v => setField('allocation_status', v as AllocationStatus)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(statusLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Allocation date</label><Input type="datetime-local" className="mt-1" value={form.allocation_date} onChange={e => setField('allocation_date', e.target.value)} /></div>
            <div><label className="text-sm font-medium">Possession date</label><Input type="datetime-local" className="mt-1" value={form.possession_date} onChange={e => setField('possession_date', e.target.value)} /></div>
            <div><label className="text-sm font-medium">Allocation letter URL</label><Input className="mt-1" value={form.allocation_letter_url} onChange={e => setField('allocation_letter_url', e.target.value)} placeholder="Optional document link" /></div>
            <div><label className="text-sm font-medium">Source / reference</label><Input className="mt-1" value={form.source_reference} onChange={e => setField('source_reference', e.target.value)} placeholder="Allocation letter, exercise, file no., etc." /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium">Notes</label><Textarea className="mt-1 min-h-24" value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Verified allocation/possession notes..." /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? 'Save Changes' : 'Create Allocation'}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClientAllocations;
