import React, { useMemo, useState } from 'react';
import { CheckCircle2, Copy, FileUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Props {
  orderId: string;
  amountDue: number;
  orderReference: string;
  propertyDescription: string;
  paymentPlan: string;
  onComplete: (requestId: string) => void;
  onBack: () => void;
}

const BANK = { name: 'Zenith Bank', accountName: 'Bridgefort Homes Development Ltd', accountNumber: '1312214947' };

const BankTransferSubmission: React.FC<Props> = ({ orderId, amountDue, orderReference, propertyDescription, paymentPlan, onComplete, onBack }) => {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [amount, setAmount] = useState(String(amountDue));
  const [transferDate, setTransferDate] = useState(today);
  const [transferReference, setTransferReference] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK.accountNumber);
      toast({ title: 'Copied', description: 'Account number copied.' });
    } catch {
      toast({ title: 'Copy unavailable', description: 'Please copy the account number manually.' });
    }
  };

  const submit = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > amountDue) {
      toast({ title: 'Check amount', description: 'Enter an amount greater than zero and no more than the amount due.', variant: 'destructive' });
      return;
    }
    if (!transferReference.trim()) {
      toast({ title: 'Transfer reference required', description: 'Enter the narration or bank transaction reference.', variant: 'destructive' });
      return;
    }
    if (!receipt) {
      toast({ title: 'Receipt required', description: 'Upload your transfer receipt to continue.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    const safeName = receipt.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
    const path = `${(await supabase.auth.getUser()).data.user?.id}/${orderId}/${crypto.randomUUID()}-${safeName}`;
    try {
      const { error: uploadError } = await supabase.storage.from('bank-transfer-receipts').upload(path, receipt, {
        contentType: receipt.type, cacheControl: '3600', upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data, error } = await supabase.functions.invoke('submit-bank-transfer-request', {
        body: { order_id: orderId, amount: numericAmount, transfer_date: transferDate, transfer_reference: transferReference.trim(), receipt_path: path },
      });
      if (error || !data?.success) {
        await supabase.storage.from('bank-transfer-receipts').remove([path]);
        throw new Error(data?.error || error?.message || 'Could not submit transfer');
      }
      setSubmittedId(data.request_id);
      onComplete(data.request_id);
    } catch (error: any) {
      toast({ title: 'Submission failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  if (submittedId) return <Card className="max-w-2xl mx-auto"><CardContent className="p-6 text-center space-y-3">
    <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
    <h2 className="text-xl font-semibold">Transfer submitted</h2>
    <p className="text-sm text-muted-foreground">Your evidence has been received. Your payment is pending administrator verification; your order has not yet been marked as paid.</p>
    <p className="text-sm font-medium break-all">Submission reference: {submittedId}</p>
  </CardContent></Card>;

  return <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" onClick={onBack}>Back to checkout</Button>
      <span className="text-sm text-muted-foreground">Order {orderReference}</span>
    </div>
    <Card>
      <CardHeader><CardTitle>Bank transfer details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Amount due for this checkout</p>
          <p className="text-2xl font-bold">₦{amountDue.toLocaleString('en-NG')}</p>
        </div>
        <div className="space-y-1"><p className="text-xs text-muted-foreground">Bank</p><p className="font-semibold">{BANK.name}</p></div>
        <div className="space-y-1"><p className="text-xs text-muted-foreground">Account name</p><p className="font-semibold">{BANK.accountName}</p></div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-xs text-muted-foreground">Account number</p><p className="text-xl font-bold tracking-wider">{BANK.accountNumber}</p></div>
          <Button type="button" variant="outline" onClick={copyAccount}><Copy className="h-4 w-4 mr-2"/>Copy number</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Property / purchase</p><p className="text-sm font-medium">{propertyDescription || 'Bridgefort property order'}</p></div><div><p className="text-xs text-muted-foreground">Payment plan</p><p className="text-sm font-medium">{paymentPlan || 'Selected checkout plan'}</p></div></div><p className="text-sm text-muted-foreground">Use your order reference as the transfer narration where your banking app allows it. After transferring, complete the form below. Payments are confirmed only after administrator verification.</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Submit transfer evidence</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label htmlFor="transfer-amount">Amount transferred (₦)</Label><Input id="transfer-amount" type="number" min="1" max={amountDue} step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="transfer-date">Transfer date</Label><Input id="transfer-date" type="date" max={today} value={transferDate} onChange={e=>setTransferDate(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="transfer-reference">Bank narration / transaction reference</Label><Input id="transfer-reference" value={transferReference} onChange={e=>setTransferReference(e.target.value)} maxLength={120} placeholder="Enter the reference shown by your bank" /></div>
        <div className="space-y-2"><Label htmlFor="transfer-receipt">Receipt (JPG, PNG, WebP or PDF; max 5 MB)</Label><Input id="transfer-receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>{const f=e.target.files?.[0]||null; if(f&&(f.size>5*1024*1024||!['image/jpeg','image/png','image/webp','application/pdf'].includes(f.type))){toast({title:'Unsupported receipt',description:'Use JPG, PNG, WebP or PDF up to 5 MB.',variant:'destructive'});e.target.value='';setReceipt(null);}else setReceipt(f);}} /></div>
        <Button className="w-full" onClick={submit} disabled={busy}>{busy?<><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Submitting…</>:<><FileUp className="h-4 w-4 mr-2"/>Submit for verification</>}</Button>
      </CardContent>
    </Card>
  </div>;
};

export default BankTransferSubmission;
