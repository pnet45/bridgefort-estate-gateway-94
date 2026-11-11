import React, { useEffect, useMemo, useState } from 'react';
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

const readTransferDraft = (key: string) => {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft.savedAt || Date.now() - draft.savedAt > 2 * 60 * 60 * 1000) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
};

const BankTransferSubmission: React.FC<Props> = ({ orderId, amountDue, orderReference, propertyDescription, paymentPlan, onComplete, onBack }) => {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const draftKey = `bridgefort:bank-transfer-draft:v1:${orderId}`;
  const [draft] = useState(() => readTransferDraft(draftKey));
  const [amount, setAmount] = useState(() => draft?.amount || String(amountDue));
  const [transferDate, setTransferDate] = useState(() => draft?.transferDate || today);
  const [transferReference, setTransferReference] = useState(() => draft?.transferReference || '');
  const [receiptPath, setReceiptPath] = useState<string | null>(() => draft?.receiptPath || null);
  const [receiptName, setReceiptName] = useState<string>(() => draft?.receiptName || '');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(draftKey, JSON.stringify({
        savedAt: Date.now(),
        amount,
        transferDate,
        transferReference,
        receiptPath,
        receiptName,
      }));
    } catch (error) {
      console.warn('Unable to preserve bank transfer form draft.', error);
    }
  }, [draftKey, amount, transferDate, transferReference, receiptPath, receiptName]);

  const handleReceiptChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0] || null;
    input.value = '';
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (file.size > 5 * 1024 * 1024 || !allowedTypes.includes(file.type)) {
      toast({ title: 'Unsupported receipt', description: 'Use JPG, PNG, WebP or PDF up to 5 MB.', variant: 'destructive' });
      return;
    }

    setUploadingReceipt(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Please sign in again before uploading your receipt.');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
      const path = `${authData.user.id}/${orderId}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('bank-transfer-receipts').upload(path, file, {
        contentType: file.type, cacheControl: '3600', upsert: false,
      });
      if (uploadError) throw uploadError;

      const previousPath = receiptPath;
      const nextDraft = {
        savedAt: Date.now(),
        amount,
        transferDate,
        transferReference,
        receiptPath: path,
        receiptName: file.name,
      };
      // Save the durable Storage path before clearing the upload state. If the
      // mobile browser remounts after the picker, the receipt can be submitted
      // without asking the customer to choose the file again.
      try {
        window.sessionStorage.setItem(draftKey, JSON.stringify(nextDraft));
      } catch (storageError) {
        console.warn('Receipt uploaded but browser draft storage is unavailable.', storageError);
        toast({ title: 'Receipt uploaded', description: 'Keep this page open until you submit the transfer.' });
      }
      setReceiptPath(path);
      setReceiptName(file.name);
      if (previousPath && previousPath !== path) {
        const { error: removeError } = await supabase.storage.from('bank-transfer-receipts').remove([previousPath]);
        if (removeError) console.warn('Previous receipt cleanup failed:', removeError);
      }
      toast({ title: 'Receipt uploaded', description: 'Your receipt is saved. Complete the form to submit it for verification.' });
    } catch (error: any) {
      toast({ title: 'Receipt upload failed', description: error?.message || 'Please choose the file again.', variant: 'destructive' });
    } finally {
      setUploadingReceipt(false);
    }
  };

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
    if (!receiptPath) {
      toast({ title: 'Receipt required', description: 'Choose and upload your transfer receipt to continue.', variant: 'destructive' });
      return;
    }
    if (uploadingReceipt) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-bank-transfer-request', {
        body: { order_id: orderId, amount: numericAmount, transfer_date: transferDate, transfer_reference: transferReference.trim(), receipt_path: receiptPath },
      });
      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Could not submit transfer');
      }
      window.sessionStorage.removeItem(draftKey);
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
      <Button type="button" variant="outline" onClick={onBack}>Back to checkout</Button>
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
        <div className="space-y-2"><Label htmlFor="transfer-receipt">Receipt (JPG, PNG, WebP or PDF; max 5 MB)</Label><Input id="transfer-receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleReceiptChange} disabled={uploadingReceipt || busy} /><p className="text-xs text-muted-foreground">{uploadingReceipt ? 'Uploading receipt…' : receiptPath ? `Uploaded: ${receiptName}` : 'Choose a receipt to upload. Your form and uploaded receipt will be retained if the page reloads.'}</p></div>
        <Button type="button" className="w-full" onClick={submit} disabled={busy || uploadingReceipt || !receiptPath}>{busy?<><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Submitting…</>:<><FileUp className="h-4 w-4 mr-2"/>Submit for verification</>}</Button>
      </CardContent>
    </Card>
  </div>;
};

export default BankTransferSubmission;
