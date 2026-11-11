import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Order = {
  id: string;
  total_amount: number;
  amount_paid: number;
  payment_status: string | null;
};
type ReceiptDraft = Record<string, { path: string; name: string }>;
type BankTransferDraft = {
  receipts?: ReceiptDraft;
  amounts?: Record<string, string>;
  references?: Record<string, string>;
  transferDates?: Record<string, string>;
};

const draftKey = (userId: string) => `bridgefort:bank-transfer-receipts:${userId}`;
const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function BankTransferSubmission() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [references, setReferences] = useState<Record<string, string>>({});
  const [transferDates, setTransferDates] = useState<Record<string, string>>({});
  const [receipts, setReceipts] = useState<ReceiptDraft>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setReceipts({});
      return;
    }

    try {
      const saved = window.sessionStorage.getItem(draftKey(user.id));
      const parsed = saved ? JSON.parse(saved) as BankTransferDraft : {};
      setReceipts(parsed.receipts && typeof parsed.receipts === 'object' ? parsed.receipts : {});
      setAmounts(parsed.amounts && typeof parsed.amounts === 'object' ? parsed.amounts : {});
      setReferences(parsed.references && typeof parsed.references === 'object' ? parsed.references : {});
      setTransferDates(parsed.transferDates && typeof parsed.transferDates === 'object' ? parsed.transferDates : {});
    } catch (error) {
      console.warn('Could not restore bank-transfer receipt draft.', error);
      setReceipts({});
    }

    void supabase.from('orders')
      .select('id,total_amount,amount_paid,payment_status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) {
          console.warn('Order list unavailable for transfer submission', error);
          setMessage('Your orders could not be loaded. Please refresh and try again.');
          return;
        }
        setOrders((data || []).filter((order: any) =>
          Number(order.total_amount || 0) > Number(order.amount_paid || 0)
          && !['paid', 'cancelled', 'rejected'].includes(String(order.payment_status || '').toLowerCase()),
        ) as Order[]);
      });
  }, [user]);

  const persistDraft = (patch: Partial<BankTransferDraft>) => {
    if (!user) return;
    try {
      const saved = window.sessionStorage.getItem(draftKey(user.id));
      const previous = saved ? JSON.parse(saved) as BankTransferDraft : {};
      const next = { ...previous, ...patch };
      if (Object.values(next).every((value) => !value || Object.keys(value).length === 0)) {
        window.sessionStorage.removeItem(draftKey(user.id));
      } else {
        window.sessionStorage.setItem(draftKey(user.id), JSON.stringify(next));
      }
    } catch (error) {
      console.warn('Could not persist bank-transfer form draft.', error);
    }
  };

  const persistReceipts = (next: ReceiptDraft) => {
    setReceipts(next);
    persistDraft({ receipts: next });
  };

  const uploadReceipt = async (order: Order, file?: File) => {
    if (!user || !file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage('Proof must be JPG, PNG, WEBP or PDF, up to 5 MB.');
      return;
    }

    setUploadingId(order.id);
    setMessage('');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100) || 'transfer-proof';
    const path = `${user.id}/${order.id}/${Date.now()}-${safeName}`;

    try {
      const { error } = await supabase.storage.from('bank-transfer-receipts').upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;

      const previous = receipts[order.id]?.path;
      const next = { ...receipts, [order.id]: { path, name: file.name } };
      persistReceipts(next);

      if (previous && previous !== path) {
        const { error: cleanupError } = await supabase.storage.from('bank-transfer-receipts').remove([previous]);
        if (cleanupError) console.warn('Previous unsubmitted receipt cleanup failed.', cleanupError);
      }
      setMessage(`Receipt uploaded for order ${order.id.slice(0, 8)}. Your draft is retained if this page reloads.`);
    } catch (error: any) {
      setMessage(error?.message || 'Receipt upload failed. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const removeReceipt = async (orderId: string) => {
    const current = receipts[orderId];
    if (current?.path) {
      const { error } = await supabase.storage.from('bank-transfer-receipts').remove([current.path]);
      if (error) {
        setMessage(error.message || 'Could not remove the uploaded receipt.');
        return;
      }
    }
    const next = { ...receipts };
    delete next[orderId];
    persistReceipts(next);
    setMessage('Uploaded receipt removed.');
  };

  const submit = async (order: Order) => {
    if (!user) return;
    const amount = Number(amounts[order.id] || 0);
    const reference = (references[order.id] || '').trim();
    const transferDate = transferDates[order.id] || localDate();
    const receiptPath = receipts[order.id]?.path;
    const balance = Math.max(0, Number(order.total_amount || 0) - Number(order.amount_paid || 0));

    if (!Number.isFinite(amount) || amount <= 0 || amount > balance + 0.01) {
      setMessage('Enter a valid amount not exceeding the outstanding balance.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(transferDate) || Number.isNaN(Date.parse(transferDate))) {
      setMessage('Enter the date you made the bank transfer.');
      return;
    }
    if (reference.length < 3 || !receiptPath) {
      setMessage('Enter the transfer reference and upload the receipt before submitting.');
      return;
    }

    setSubmittingId(order.id);
    setMessage('');
    try {
      const { data, error } = await supabase.functions.invoke('submit-bank-transfer-request', {
        body: {
          order_id: order.id,
          amount,
          transfer_date: transferDate,
          transfer_reference: reference,
          receipt_path: receiptPath,
        },
      });
      if (error || data?.error || data?.success !== true) {
        throw new Error(data?.error || error?.message || 'Transfer submission could not be completed.');
      }

      const nextReceipts = { ...receipts };
      delete nextReceipts[order.id];
      const nextAmounts = { ...amounts };
      delete nextAmounts[order.id];
      const nextReferences = { ...references };
      delete nextReferences[order.id];
      const nextDates = { ...transferDates };
      delete nextDates[order.id];
      setReceipts(nextReceipts);
      setAmounts(nextAmounts);
      setReferences(nextReferences);
      setTransferDates(nextDates);
      persistDraft({ receipts: nextReceipts, amounts: nextAmounts, references: nextReferences, transferDates: nextDates });
      setMessage('Transfer submitted and pending verification. It will not be marked paid until authorised staff confirm the funds reached Bridgefort’s company account.');
    } catch (error: any) {
      setMessage(error?.message || 'Transfer submission failed. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (!user || orders.length === 0) return null;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h3 className="font-semibold text-foreground">Report a Bank Transfer</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select your order, upload the transfer receipt, and submit the bank reference. Uploads are saved immediately so a page reload does not discard the receipt.
        </p>
      </div>
      {message && <p role="status" aria-live="polite" className="rounded-lg border border-border bg-muted/50 p-3 text-sm">{message}</p>}
      {orders.map((order) => {
        const balance = Math.max(0, Number(order.total_amount || 0) - Number(order.amount_paid || 0));
        const receipt = receipts[order.id];
        const busy = uploadingId === order.id || submittingId === order.id;
        return (
          <div key={order.id} className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-sm font-medium text-foreground">
              Order {order.id.slice(0, 8)} · Outstanding balance ₦{balance.toLocaleString('en-NG')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Input
                type="number"
                min="1"
                max={balance}
                step="0.01"
                value={amounts[order.id] || ''}
                onChange={(event) => {
                  const next = { ...amounts, [order.id]: event.target.value };
                  setAmounts(next);
                  persistDraft({ amounts: next });
                }}
                placeholder="Transfer amount (₦)"
                aria-label="Transfer amount"
              />
              <Input
                type="date"
                max={localDate()}
                value={transferDates[order.id] || localDate()}
                onChange={(event) => {
                  const next = { ...transferDates, [order.id]: event.target.value };
                  setTransferDates(next);
                  persistDraft({ transferDates: next });
                }}
                aria-label="Transfer date"
              />
              <Input
                value={references[order.id] || ''}
                onChange={(event) => {
                  const next = { ...references, [order.id]: event.target.value };
                  setReferences(next);
                  persistDraft({ references: next });
                }}
                placeholder="Bank transfer reference"
                maxLength={120}
                aria-label="Bank transfer reference"
              />
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                disabled={busy || uploadingId !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) void uploadReceipt(order, file);
                }}
                aria-label="Transfer receipt upload"
              />
            </div>
            {receipt && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                <span className="min-w-0 truncate text-foreground">Receipt saved: {receipt.name}</span>
                <Button type="button" size="sm" variant="outline" onClick={() => void removeReceipt(order.id)} disabled={busy}>Remove receipt</Button>
              </div>
            )}
            <Button type="button" onClick={() => void submit(order)} disabled={busy}>
              {uploadingId === order.id ? 'Uploading receipt…' : submittingId === order.id ? 'Submitting…' : 'Submit for verification'}
            </Button>
          </div>
        );
      })}
    </section>
  );
}
