import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Coins, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

type Commission = {
  commission_id: string;
  division: 'agrovest' | 'travels';
  referrer_user_id: string;
  referrer_name: string | null;
  source_type: string;
  gross_customer_payment: number;
  commission_rate: number;
  commission_amount: number;
  status: 'earned' | 'paid' | 'reversed';
  payment_reference: string | null;
  created_at: string;
  paid_at: string | null;
  payout_reference: string | null;
};

const money = (value: number) => Number(value || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 });

export default function AdminBMCCommissions() {
  const [rows, setRows] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [division, setDivision] = useState('all');
  const [selected, setSelected] = useState<Commission | null>(null);
  const [payoutReference, setPayoutReference] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_bmc_division_commissions' as never, {
      _division: division === 'all' ? null : division,
    } as never) as unknown as { data: Commission[] | null; error: { message: string } | null };
    if (error) {
      toast({ title: 'Unable to load BMC commissions', description: error.message, variant: 'destructive' });
      setRows([]);
    } else {
      setRows(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, [division]);

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => ({
    agrovest: rows.filter((row) => row.division === 'agrovest' && row.status === 'earned').reduce((sum, row) => sum + Number(row.commission_amount), 0),
    travels: rows.filter((row) => row.division === 'travels' && row.status === 'earned').reduce((sum, row) => sum + Number(row.commission_amount), 0),
  }), [rows]);

  const markPaid = async () => {
    if (!selected || payoutReference.trim().length < 3) {
      toast({ title: 'Payout reference required', description: 'Enter the bank or payment transaction reference.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('admin_mark_bmc_commission_paid' as never, {
      _commission_id: selected.commission_id,
      _payout_reference: payoutReference.trim(),
    } as never);
    setSaving(false);
    if (error) {
      toast({ title: 'Commission payout update failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Commission marked as paid', description: 'The payout reference has been saved in the commission audit record.' });
    setSelected(null);
    setPayoutReference('');
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary/10 p-3 text-primary"><Coins className="h-5 w-5" /></span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">BMC Division Commissions</h2>
            <p className="text-sm text-muted-foreground">Separate Agrovest and Travels direct-referral commissions. Homes remains in the BH-Realtors commission workspace.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All divisions</SelectItem>
              <SelectItem value="agrovest">Agrovest</SelectItem>
              <SelectItem value="travels">Travels</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Agrovest earned · awaiting payout</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{money(totals.agrovest)}</p>
          <p className="mt-1 text-xs text-muted-foreground">10% of full cleared customer payments</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Travels earned · awaiting payout</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{money(totals.travels)}</p>
          <p className="mt-1 text-xs text-muted-foreground">10% of full cleared customer payments</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        {loading ? <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : rows.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No BMC commission records found.</p> : (
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr><th className="p-3 text-left">BMC</th><th className="p-3 text-left">Division</th><th className="p-3 text-left">Gross customer payment</th><th className="p-3 text-left">Rate</th><th className="p-3 text-left">Commission</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Payment / payout reference</th><th className="p-3 text-right">Action</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.commission_id} className="border-t border-border">
                  <td className="p-3"><p className="font-medium text-foreground">{row.referrer_name || 'BMC partner'}</p><p className="text-xs text-muted-foreground">{row.referrer_user_id.slice(0, 8)}…</p></td>
                  <td className="p-3 capitalize text-foreground">{row.division}</td>
                  <td className="p-3 text-foreground">{money(row.gross_customer_payment)}</td>
                  <td className="p-3 text-foreground">{row.commission_rate}%</td>
                  <td className="p-3 font-semibold text-foreground">{money(row.commission_amount)}</td>
                  <td className="p-3"><Badge variant="outline">{row.status}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">{row.payout_reference || row.payment_reference || '—'}</td>
                  <td className="p-3 text-right">{row.status === 'earned' ? <Button size="sm" onClick={() => { setSelected(row); setPayoutReference(''); }}><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark paid</Button> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open && !saving) setSelected(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm BMC commission payout</DialogTitle></DialogHeader>
          {selected && <div className="space-y-3">
            <p className="text-sm text-muted-foreground">You are marking {money(selected.commission_amount)} for {selected.referrer_name || 'this BMC'} ({selected.division}) as paid. Enter the verified payout reference.</p>
            <Input value={payoutReference} onChange={(event) => setPayoutReference(event.target.value)} maxLength={120} placeholder="Bank transfer / payout reference" />
          </div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={saving}>Cancel</Button>
            <Button onClick={() => void markPaid()} disabled={saving || payoutReference.trim().length < 3}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Confirm payout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
