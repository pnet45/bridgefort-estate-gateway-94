import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, DollarSign } from 'lucide-react';

interface OtherPayment {
  id: string;
  estate_id: string;
  payment_name: string;
  amount: number;
  description: string | null;
  is_active: boolean;
}

interface Estate {
  id: string;
  name: string;
}

const PRESET_PAYMENTS = [
  'Registered Survey',
  'Seal and Registered Deed of Assignment',
  'Primary Infrastructure Fee (50% of actual cost of 1 plot)',
  'Secondary Infrastructure Fee',
];

const AdminOtherPayments = () => {
  const [payments, setPayments] = useState<OtherPayment[]>([]);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OtherPayment | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedEstate, setSelectedEstate] = useState<string>('all');
  const [form, setForm] = useState({ estate_id: '', payment_name: '', amount: 0, description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: estateData }, { data: paymentData }] = await Promise.all([
      supabase.from('estate').select('id, name').order('name'),
      supabase.from('estate_other_payments').select('*').order('payment_name'),
    ]);
    setEstates(estateData || []);
    setPayments(paymentData || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.estate_id || !form.payment_name || !form.amount) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('estate_other_payments')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editing.id);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Updated', description: 'Payment updated successfully' });
    } else {
      const { error } = await supabase.from('estate_other_payments').insert(form);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Created', description: 'Payment created successfully' });
    }
    setSaving(false);
    setDialogOpen(false);
    setEditing(null);
    setForm({ estate_id: '', payment_name: '', amount: 0, description: '' });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('estate_other_payments').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else fetchData();
  };

  const toggleActive = async (p: OtherPayment) => {
    await supabase.from('estate_other_payments')
      .update({ is_active: !p.is_active, updated_at: new Date().toISOString() })
      .eq('id', p.id);
    fetchData();
  };

  const filtered = selectedEstate === 'all' ? payments : payments.filter(p => p.estate_id === selectedEstate);
  const getEstateName = (id: string) => estates.find(e => e.id === id)?.name || 'Unknown';

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Other Payments (Per Estate)</CardTitle>
        <Button onClick={() => { setEditing(null); setForm({ estate_id: '', payment_name: '', amount: 0, description: '' }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Payment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={selectedEstate} onValueChange={setSelectedEstate}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Filter by estate" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Estates</SelectItem>
              {estates.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estate</TableHead>
              <TableHead>Payment Name</TableHead>
              <TableHead>Amount (₦)</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>{getEstateName(p.estate_id)}</TableCell>
                <TableCell>{p.payment_name}</TableCell>
                <TableCell>₦{p.amount.toLocaleString()}</TableCell>
                <TableCell><Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} /></TableCell>
                <TableCell className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setForm({ estate_id: p.estate_id, payment_name: p.payment_name, amount: p.amount, description: p.description || '' }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No payments configured</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Other Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Estate *</Label>
              <Select value={form.estate_id} onValueChange={v => setForm(f => ({ ...f, estate_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select estate" /></SelectTrigger>
                <SelectContent>{estates.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Name *</Label>
              <Select value={form.payment_name} onValueChange={v => setForm(f => ({ ...f, payment_name: v }))}>
                <SelectTrigger><SelectValue placeholder="Select or type name" /></SelectTrigger>
                <SelectContent>
                  {PRESET_PAYMENTS.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input value={form.payment_name} onChange={e => setForm(f => ({ ...f, payment_name: e.target.value }))} placeholder="Or type custom name" />
            </div>
            <div className="space-y-2">
              <Label>Amount (₦) *</Label>
              <Input type="number" min="0" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminOtherPayments;
