import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Coins, Loader2 } from 'lucide-react';

export default function BMCTravelCommissionPayment({ bookingId, bookingStatus, hasBmcReferral, onRecorded }: {
  bookingId: string;
  bookingStatus: string;
  hasBmcReferral: boolean;
  onRecorded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [grossAmount, setGrossAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [saving, setSaving] = useState(false);

  if (!hasBmcReferral || bookingStatus !== 'confirmed') return null;

  const recordPayment = async () => {
    const amount = Number(grossAmount);
    if (!Number.isFinite(amount) || amount <= 0 || !paymentReference.trim()) {
      toast({ title: 'Payment details required', description: 'Enter the full customer payment received and its verified payment reference.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('admin_record_bmc_travel_payment' as never, {
      _booking_id: bookingId,
      _gross_customer_payment: amount,
      _payment_reference: paymentReference.trim(),
    } as never);
    setSaving(false);
    if (error) {
      toast({ title: 'Unable to record cleared payment', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'BMC Travels commission recorded', description: 'The direct referrer has earned 10% of this cleared instalment.' });
    setGrossAmount('');
    setPaymentReference('');
    setOpen(false);
    onRecorded();
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} title="Record cleared BMC Travels customer payment">
        <Coins className="mr-1 h-3.5 w-3.5" /> Record payment
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record cleared Travels payment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This booking has a verified BMC Travels referral. Enter the gross amount received for this instalment, before third-party costs. Each cleared payment reference is recorded separately and earns 10% for the direct referrer only.</p>
          <div className="space-y-2">
            <Label htmlFor={`bmc-travel-gross-${bookingId}`}>Customer instalment received (₦)</Label>
            <Input id={`bmc-travel-gross-${bookingId}`} inputMode="decimal" type="number" min="0.01" step="0.01" value={grossAmount} onChange={(event) => setGrossAmount(event.target.value)} placeholder="e.g. 500000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`bmc-travel-reference-${bookingId}`}>Verified payment reference</Label>
            <Input id={`bmc-travel-reference-${bookingId}`} value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} maxLength={120} placeholder="Bank / gateway transaction reference" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={() => void recordPayment()} disabled={saving || !grossAmount.trim() || !paymentReference.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Record cleared payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
