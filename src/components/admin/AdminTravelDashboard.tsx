import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, RefreshCw, Search, Plane, CalendarX, Plus, Trash2 } from 'lucide-react';

interface Booking {
  id: string; name: string; email: string; phone: string;
  departure_date: string; return_date: string; travelers: number;
  package: string; destination: string | null; notes: string | null;
  status: string; status_note: string | null;
  created_at: string;
}

interface Blackout {
  id: string; package: string; start_date: string; end_date: string; reason: string | null;
}

const STATUS = ['received', 'confirmed', 'rejected', 'cancelled'];
const STATUS_COLOURS: Record<string, string> = {
  received: 'bg-blue-500',
  confirmed: 'bg-green-600',
  rejected: 'bg-red-600',
  cancelled: 'bg-gray-500',
};
const PACKAGES = ['Explorer', 'Premium', 'Luxury', 'Custom', 'Visa Only', 'Flight Only'];

const AdminTravelDashboard: React.FC = () => {
  const [tab, setTab] = useState<'bookings' | 'blackouts'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState('received');
  const [editNote, setEditNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Blackout form
  const [boForm, setBoForm] = useState({ package: 'Explorer', start_date: '', end_date: '', reason: '' });
  const [boSaving, setBoSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: b }, { data: bk }] = await Promise.all([
      supabase.from('travel_bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('travel_package_blackouts').select('*').order('start_date', { ascending: true }),
    ]);
    setBookings((b as Booking[]) || []);
    setBlackouts((bk as Blackout[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (b.name + b.email + b.phone + (b.destination || '') + b.package).toLowerCase().includes(q);
    }
    return true;
  });

  const counts = STATUS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length; return acc;
  }, {});

  const openEdit = (b: Booking) => {
    setEditing(b);
    setEditStatus(b.status);
    setEditNote(b.status_note || '');
  };

  const saveStatus = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.functions.invoke('manage-travel-booking', {
      body: { action: 'update_status', bookingId: editing.id, status: editStatus, status_note: editNote || null },
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Booking updated', description: 'Customer has been notified by email.' });
    setEditing(null);
    fetchAll();
  };

  const resendEmail = async (b: Booking) => {
    const { error } = await supabase.functions.invoke('manage-travel-booking', {
      body: { action: 'resend_confirmation', bookingId: b.id },
    });
    if (error) toast({ title: 'Resend failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Confirmation resent', description: `Sent to ${b.email}` });
  };

  const addBlackout = async () => {
    if (!boForm.start_date || !boForm.end_date) {
      toast({ title: 'Dates required', variant: 'destructive' }); return;
    }
    if (boForm.end_date < boForm.start_date) {
      toast({ title: 'End must be after start', variant: 'destructive' }); return;
    }
    setBoSaving(true);
    const { error } = await supabase.from('travel_package_blackouts').insert({
      package: boForm.package, start_date: boForm.start_date, end_date: boForm.end_date,
      reason: boForm.reason || null,
    });
    setBoSaving(false);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Blackout added' });
    setBoForm({ package: 'Explorer', start_date: '', end_date: '', reason: '' });
    fetchAll();
  };

  const deleteBlackout = async (id: string) => {
    if (!confirm('Delete this blackout?')) return;
    const { error } = await supabase.from('travel_package_blackouts').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Blackout removed' });
    fetchAll();
  };

  const updateBlackout = async (b: Blackout, patch: Partial<Blackout>) => {
    const { error } = await supabase.from('travel_package_blackouts').update(patch).eq('id', b.id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Saved' }); fetchAll(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><Plane className="h-5 w-5 text-primary" /></div>
          <div>
            <h2 className="text-2xl font-bold text-white">Travel Management</h2>
            <p className="text-sm text-slate-400">Super-admin only — bookings, statuses, and blackouts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === 'bookings' ? 'default' : 'outline'} onClick={() => setTab('bookings')}>
            Bookings ({bookings.length})
          </Button>
          <Button variant={tab === 'blackouts' ? 'default' : 'outline'} onClick={() => setTab('blackouts')}>
            <CalendarX className="h-4 w-4 mr-1" /> Blackouts ({blackouts.length})
          </Button>
          <Button variant="ghost" onClick={fetchAll} className="text-slate-300">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {tab === 'bookings' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATUS.map(s => (
              <div key={s} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="text-xs uppercase text-slate-400">{s}</div>
                <div className="text-2xl font-bold text-white">{counts[s] || 0}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name, email, destination…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No bookings match.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Trip</th>
                      <th className="text-left p-3">Dates</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Submitted</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    {filtered.map(b => (
                      <tr key={b.id} className="border-t border-slate-700 hover:bg-slate-700/40">
                        <td className="p-3">
                          <div className="font-medium">{b.name}</div>
                          <div className="text-xs text-slate-400">{b.email}</div>
                          <div className="text-xs text-slate-400">{b.phone}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{b.package}</div>
                          <div className="text-xs text-slate-400">{b.destination || '—'} · {b.travelers} pax</div>
                        </td>
                        <td className="p-3 text-xs">
                          <div>{b.departure_date}</div>
                          <div className="text-slate-400">→ {b.return_date}</div>
                        </td>
                        <td className="p-3">
                          <Badge className={`${STATUS_COLOURS[b.status]} text-white`}>{b.status}</Badge>
                          {b.status_note && <div className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">{b.status_note}</div>}
                        </td>
                        <td className="p-3 text-xs text-slate-400">{new Date(b.created_at).toLocaleDateString()}</td>
                        <td className="p-3 text-right space-x-1">
                          <Button size="sm" variant="outline" onClick={() => openEdit(b)}>Manage</Button>
                          <Button size="sm" variant="ghost" onClick={() => resendEmail(b)} className="text-slate-300">
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'blackouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-3 h-fit">
            <h3 className="font-semibold text-white flex items-center gap-2"><Plus className="h-4 w-4" /> Add Blackout</h3>
            <div>
              <Label className="text-slate-300">Package</Label>
              <Select value={boForm.package} onValueChange={v => setBoForm({ ...boForm, package: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{PACKAGES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Start date</Label>
              <Input type="date" value={boForm.start_date} onChange={e => setBoForm({ ...boForm, start_date: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1" />
            </div>
            <div>
              <Label className="text-slate-300">End date</Label>
              <Input type="date" value={boForm.end_date} onChange={e => setBoForm({ ...boForm, end_date: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1" />
            </div>
            <div>
              <Label className="text-slate-300">Reason (optional)</Label>
              <Input value={boForm.reason} onChange={e => setBoForm({ ...boForm, reason: e.target.value })} placeholder="Fully booked, holiday…" className="bg-slate-900 border-slate-700 text-white mt-1" />
            </div>
            <Button onClick={addBlackout} disabled={boSaving} className="w-full">
              {boSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add blackout'}
            </Button>
          </div>

          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : blackouts.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No blackouts configured. All dates are available.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="text-left p-3">Package</th>
                    <th className="text-left p-3">Start</th>
                    <th className="text-left p-3">End</th>
                    <th className="text-left p-3">Reason</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {blackouts.map(b => (
                    <tr key={b.id} className="border-t border-slate-700">
                      <td className="p-3">
                        <Select value={b.package} onValueChange={v => updateBlackout(b, { package: v })}>
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>{PACKAGES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Input type="date" defaultValue={b.start_date} onBlur={e => e.target.value !== b.start_date && updateBlackout(b, { start_date: e.target.value })} className="bg-slate-900 border-slate-700 text-white h-9" />
                      </td>
                      <td className="p-3">
                        <Input type="date" defaultValue={b.end_date} onBlur={e => e.target.value !== b.end_date && updateBlackout(b, { end_date: e.target.value })} className="bg-slate-900 border-slate-700 text-white h-9" />
                      </td>
                      <td className="p-3">
                        <Input defaultValue={b.reason || ''} onBlur={e => e.target.value !== (b.reason || '') && updateBlackout(b, { reason: e.target.value || null })} className="bg-slate-900 border-slate-700 text-white h-9" />
                      </td>
                      <td className="p-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => deleteBlackout(b.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage booking — {editing?.name}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted/50 rounded p-3">
                <div><strong>Package:</strong> {editing.package}</div>
                <div><strong>Destination:</strong> {editing.destination || '—'}</div>
                <div><strong>Dates:</strong> {editing.departure_date} → {editing.return_date}</div>
                <div><strong>Travelers:</strong> {editing.travelers}</div>
                {editing.notes && <div className="mt-2"><strong>Notes:</strong> {editing.notes}</div>}
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Note to customer (optional)</Label>
                <Textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={3} maxLength={500} placeholder="Add context — included in the email…" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveStatus} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save & email customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTravelDashboard;
