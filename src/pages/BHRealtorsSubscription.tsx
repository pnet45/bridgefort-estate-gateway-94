import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { initializePayment } from '@/integrations/paystack/client';
import {
  subscriptionEstates,
  FREQUENCY_INSTALLMENT,
  FREQUENCY_DAYS,
  type Frequency,
  type SubscriptionEstate,
} from '@/data/bhSubscriptionEstates';
import { Calendar, CreditCard, Loader2, TrendingUp } from 'lucide-react';

const naira = (n: number) => `₦${n.toLocaleString()}`;

const BHRealtorsSubscription: React.FC = () => {
  const { user } = useAuth();
  const [estate, setEstate] = useState<SubscriptionEstate>(subscriptionEstates[0]);
  const [plotSize, setPlotSize] = useState<string>(subscriptionEstates[0].plots[0].size);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [busy, setBusy] = useState(false);
  const [subs, setSubs] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    document.title = 'BHRealtors Subscription | Bridgefort Homes';
    window.scrollTo(0, 0);
  }, []);

  const plot = estate.plots.find((p) => p.size === plotSize) ?? estate.plots[0];
  const installment = FREQUENCY_INSTALLMENT[frequency];
  const totalInstallments = Math.ceil(plot.price / installment);
  const totalDays = totalInstallments * FREQUENCY_DAYS[frequency];
  const expectedEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + totalDays);
    return d;
  }, [totalDays]);

  const loadSubs = async () => {
    if (!user) return;
    setLoadingSubs(true);
    const { data } = await supabase
      .from('bh_subscriptions' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setSubs(data || []);
    setLoadingSubs(false);
  };
  useEffect(() => { loadSubs(); }, [user?.id]);

  const handleStart = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to start a subscription.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const { data: created, error } = await (supabase.from('bh_subscriptions' as any).insert({
        user_id: user.id,
        estate_slug: estate.slug,
        estate_name: `${estate.name}, ${estate.location}`,
        plot_size: plot.size,
        total_amount: plot.price,
        frequency,
        installment_amount: installment,
        total_installments: totalInstallments,
        expected_end_date: expectedEnd.toISOString().slice(0, 10),
      }).select().single() as any);
      if (error) throw error;

      const pay = await initializePayment({
        email: user.email ?? '',
        amount: installment,
        currency: 'NGN',
        reference: `bh-sub-${created.id}-${Date.now()}`,
        callback_url: `${window.location.origin}/payment-success?bh_sub=${created.id}`,
        metadata: {
          customer_name: user.email ?? '',
          custom_fields: [
            { display_name: 'Purpose', variable_name: 'purpose', value: 'bh_subscription_first_installment' },
            { display_name: 'Subscription', variable_name: 'subscription_id', value: String(created.id) },
          ],
        },
      });
      if (pay?.data?.authorization_url) {
        window.location.href = pay.data.authorization_url;
      } else {
        throw new Error('Unable to initialize Paystack.');
      }
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.message || 'Could not start subscription', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const payInstallment = async (sub: any) => {
    if (!user) return;
    try {
      const pay = await initializePayment({
        email: user.email ?? '',
        amount: Number(sub.installment_amount),
        currency: 'NGN',
        reference: `bh-sub-${sub.id}-${Date.now()}`,
        callback_url: `${window.location.origin}/payment-success?bh_sub=${sub.id}`,
        metadata: {
          customer_name: user.email ?? '',
          custom_fields: [
            { display_name: 'Purpose', variable_name: 'purpose', value: 'bh_subscription_installment' },
            { display_name: 'Subscription', variable_name: 'subscription_id', value: String(sub.id) },
          ],
        },
      });
      if (pay?.data?.authorization_url) window.location.href = pay.data.authorization_url;
    } catch (e: any) {
      toast({ title: 'Payment failed', description: e?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <Badge className="bg-yellow-400 text-indigo-950 mb-3">PROMO • 5K DAILY</Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-indigo-900 mb-2">
              Become a Landlord with as Low as ₦5,000 Daily
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Pick an estate, choose your plot, and subscribe daily, weekly, or monthly. We track every payment
              and show your timeline to completion.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
            {/* Configurator */}
            <Card className="border-indigo-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-indigo-900">Start a Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="mb-1 block">Estate</Label>
                  <Select
                    value={estate.slug}
                    onValueChange={(v) => {
                      const e = subscriptionEstates.find((x) => x.slug === v)!;
                      setEstate(e);
                      setPlotSize(e.plots[0].size);
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {subscriptionEstates.map((e) => (
                        <SelectItem key={e.slug} value={e.slug}>
                          {e.name} — {e.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-indigo-700 mt-1">{estate.status}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Plot Size</Label>
                    <Select value={plotSize} onValueChange={setPlotSize}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {estate.plots.map((p) => (
                          <SelectItem key={p.size} value={p.size}>
                            {p.size} — {naira(p.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 block">Payment Frequency</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily — ₦5,000</SelectItem>
                        <SelectItem value="weekly">Weekly — ₦35,000</SelectItem>
                        <SelectItem value="monthly">Monthly — ₦150,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-500">Plot price:</span> <strong>{naira(plot.price)}</strong></div>
                  <div><span className="text-slate-500">Per installment:</span> <strong>{naira(installment)}</strong></div>
                  <div><span className="text-slate-500">Installments:</span> <strong>{totalInstallments.toLocaleString()}</strong></div>
                  <div><span className="text-slate-500">Estimated finish:</span> <strong>{expectedEnd.toLocaleDateString()}</strong></div>
                </div>

                <Button onClick={handleStart} disabled={busy} className="w-full bg-indigo-700 hover:bg-indigo-800 text-white">
                  {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Starting…</> : <><CreditCard className="mr-2 h-4 w-4" /> Pay first installment via Paystack</>}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Each installment is a Paystack transaction. Missed dates roll to the next window; timeline updates automatically.
                </p>
              </CardContent>
            </Card>

            {/* My Subscriptions timeline */}
            <Card className="border-indigo-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-indigo-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> My Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSubs && <p className="text-sm text-slate-500">Loading…</p>}
                {!loadingSubs && !subs.length && (
                  <p className="text-sm text-slate-500">No active subscriptions yet. Start one on the left.</p>
                )}
                {subs.map((s) => {
                  const pct = Math.min(100, Math.round((Number(s.paid_amount) / Number(s.total_amount)) * 100));
                  const remainingInstallments = Math.max(0, s.total_installments - s.paid_installments);
                  const remainingDays = remainingInstallments * FREQUENCY_DAYS[s.frequency as Frequency];
                  return (
                    <div key={s.id} className="rounded-xl border border-indigo-100 p-4 bg-white">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-indigo-900">{s.estate_name}</p>
                          <p className="text-xs text-slate-500">
                            {s.plot_size} • {s.frequency} • {naira(Number(s.installment_amount))}/installment
                          </p>
                        </div>
                        <Badge variant="secondary">{s.status}</Badge>
                      </div>
                      <Progress value={pct} className="h-2 mb-2" />
                      <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                        <span>{naira(Number(s.paid_amount))} / {naira(Number(s.total_amount))} ({pct}%)</span>
                        <span>{s.paid_installments}/{s.total_installments} paid</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />~{remainingDays} days left</span>
                        <span>Ends: {new Date(s.expected_end_date).toLocaleDateString()}</span>
                      </div>
                      {s.status === 'active' && (
                        <Button size="sm" className="mt-3 w-full" onClick={() => payInstallment(s)}>
                          Pay next installment ({naira(Number(s.installment_amount))})
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Link to="/bh-realtors" className="text-xs text-indigo-700 hover:underline block text-center">
                  Back to BHRealtors dashboard
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BHRealtorsSubscription;
