import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, CalendarDays, CheckCircle2, Clock3, CreditCard, Loader2, WalletCards } from 'lucide-react';

const money = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value || 0);

const PropertiesTab = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const loadProperties = async () => {
    setLoading(true); setError('');
    const { data, error: queryError } = await supabase.from('my_properties').select('*').order('created_at', { ascending: false });
    if (queryError) setError(queryError.message);
    setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => { loadProperties(); }, []);

  const grouped = useMemo(() => properties.map((p) => ({ ...p, balance: Math.max(Number(p.total_amount || 0) - Number(p.amount_paid || 0), 0) })), [properties]);

  const startPayment = async (property: any) => {
    const amount = Number(amounts[property.order_id]);
    if (!amount || amount <= 0) return setError('Enter the amount you want to pay.');
    if (amount > property.balance) return setError('Payment cannot be more than your outstanding balance.');
    setPayingId(property.order_id); setError('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email;
      if (!email) throw new Error('Your account email could not be found.');

      // Do not call an untracked generic payment-request endpoint here. The
      // Paystack initializer resolves the Order server-side and uses the
      // client-entered amount only as the flexible installment amount, capped
      // by the authoritative Order balance.
      const { data, error: fnError } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email,
          order_id: property.order_id,
          amount,
          payment_type: 'installment',
          metadata: {
            order_id: property.order_id,
            payment_type: 'installment',
            property_name: property.property_name,
            plot_id: property.plot_id,
            amount_paid_now: amount,
          },
        },
      });
      if (fnError) throw fnError;
      const checkoutUrl = data?.data?.authorization_url || data?.authorization_url || data?.data?.checkout_url || data?.checkout_url;
      if (checkoutUrl) window.location.href = checkoutUrl;
      else throw new Error(data?.message || data?.error || 'Payment checkout could not be created.');
    } catch (e: any) { setError(e?.message || 'Unable to start payment. Please try again.'); }
    finally { setPayingId(null); }
  };

  if (loading) return <Card className="border-white/10 bg-background/70 backdrop-blur-xl"><CardContent className="flex items-center justify-center py-16"><Loader2 className="mr-2 animate-spin" /> Loading your properties...</CardContent></Card>;

  return <div className="space-y-6">
    <Card className="overflow-hidden border-white/10 bg-background/70 backdrop-blur-xl shadow-xl">
      <CardHeader className="border-b border-white/10 bg-white/[0.03]"><CardTitle className="flex items-center gap-2"><Building size={20} /> My Properties</CardTitle><p className="text-sm text-muted-foreground">Track your estate purchases, payments, balances and progress in one place.</p></CardHeader>
      <CardContent className="p-4 md:p-6 space-y-5">
        {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
        {!grouped.length ? <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-muted-foreground">No purchased property found yet. Start browsing available properties to make your first purchase.</div> : grouped.map((p) => {
          const paid = Number(p.amount_paid || 0), total = Number(p.total_amount || 0), balance = p.balance, progress = total ? Math.min((paid / total) * 100, 100) : 0;
          return <div key={p.order_id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:p-5 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">{p.property_name || 'Estate Property'}</h3><Badge variant={balance <= 0 ? 'default' : 'secondary'}>{balance <= 0 ? 'Fully Paid' : 'Ongoing'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{p.property_type || 'Estate Land'} {p.plot_id ? `• Plot ${p.plot_id}` : ''}</p></div><div className="text-sm text-muted-foreground">Order #{String(p.order_id).slice(0, 8)}</div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-black/10 p-3"><p className="text-xs text-muted-foreground">Purchase Price</p><p className="font-semibold">{money(total)}</p></div><div className="rounded-xl bg-black/10 p-3"><p className="text-xs text-muted-foreground">Amount Paid</p><p className="font-semibold">{money(paid)}</p></div><div className="rounded-xl bg-black/10 p-3"><p className="text-xs text-muted-foreground">Balance</p><p className="font-semibold">{money(balance)}</p></div></div>
            <div className="mt-5"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Payment progress</span><span>{Math.round(progress)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div></div>
            {balance > 0 && <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="mb-3 flex items-center gap-2 text-sm font-medium"><WalletCards size={16} /> Flexible installment payment</div><p className="mb-3 text-xs text-muted-foreground">There is no fixed amount. Pay whatever amount you currently have, up to your outstanding balance. Approved payments reduce the earliest outstanding installment.</p><div className="flex flex-col gap-2 sm:flex-row"><Input type="number" min="1" max={balance} value={amounts[p.order_id] || ''} onChange={(e) => setAmounts((x) => ({ ...x, [p.order_id]: e.target.value }))} placeholder={`Up to ${money(balance)}`} /><Button onClick={() => startPayment(p)} disabled={payingId === p.order_id}>{payingId === p.order_id ? <Loader2 className="mr-2 animate-spin" size={16} /> : <CreditCard className="mr-2" size={16} />} Make Payment</Button></div></div>}
            <div className="mt-5 border-t border-white/10 pt-4"><div className="flex items-center gap-2 text-sm font-medium"><Clock3 size={15} /> Timeline</div><div className="mt-3 grid gap-2 text-xs text-muted-foreground"><div className="flex items-center gap-2"><CheckCircle2 size={14} /> Order created {p.created_at ? new Date(p.created_at).toLocaleDateString('en-NG') : ''}</div>{paid > 0 && <div className="flex items-center gap-2"><CheckCircle2 size={14} /> Payments received: {money(paid)}</div>}<div className="flex items-center gap-2"><CalendarDays size={14} /> {balance <= 0 ? 'Property fully paid' : 'Payment plan in progress'}</div></div></div>
          </div>;
        })}
      </CardContent>
    </Card>
  </div>;
};

export default PropertiesTab;
