import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Sprout, Calendar, Clock, Plus, Wallet } from 'lucide-react';
import {
  fiveKEstates, getFiveKEstate, frequencyMeta, suggestedInstallment,
  estimatePayoffPeriods, PromoFrequency,
} from '@/data/fiveKDailyPromo';
import { initializePayment } from '@/integrations/paystack/client';
import { useEcommerce } from '@/contexts/ecommerce';

interface PromoPlanRow {
  id: string;
  property_id: string;
  plan_type: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: string;
  created_at: string;
  promo_estate_slug: string | null;
  promo_installment_amount: number | null;
}

const formatMoney = (n: number) => `₦${Math.round(n).toLocaleString()}`;

const formatCountdown = (days: number) => {
  if (days <= 0) return 'Complete';
  if (days < 14) return `${days} day${days === 1 ? '' : 's'}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
};

const LandSavingsPromoTab: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useEcommerce();
  const [plans, setPlans] = useState<PromoPlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [estateSlug, setEstateSlug] = useState(fiveKEstates[0].slug);
  const [tierIndex, setTierIndex] = useState(0);
  const [frequency, setFrequency] = useState<PromoFrequency>('daily');
  const [creating, setCreating] = useState(false);

  const estate = getFiveKEstate(estateSlug)!;
  const tier = estate.tiers[tierIndex] || estate.tiers[0];
  const installment = suggestedInstallment(frequency);

  const fetchPlans = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .in('plan_type', ['daily', 'weekly', 'monthly'])
      .order('created_at', { ascending: false });
    if (!error) setPlans((data || []) as PromoPlanRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreatePlan = async () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to start a savings plan.', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { data: createdPlans, error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          property_id: `5k-daily-${estate.slug}`,
          plan_type: frequency,
          months: 0,
          principal_amount: tier.price,
          interest_percent: 0,
          interest_amount: 0,
          total_amount: tier.price,
          amount_paid: 0,
          balance: tier.price,
          status: 'pending',
          promo_estate_slug: estate.slug,
          promo_installment_amount: installment,
        })
        .select()
        .single();

      if (error) throw error;

      const createdPlan = createdPlans as PromoPlanRow;
      if (!createdPlan?.id) throw new Error('Could not create savings plan');

      toast({ title: 'Opening payment', description: 'You will be redirected to Paystack to complete your first installment.' });
      await handlePayInstallment(createdPlan);
      await fetchPlans();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Could not start plan', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handlePayInstallment = async (plan: PromoPlanRow) => {
    if (!user) return;
    try {
      const amount = plan.promo_installment_amount || 5000;
      const reference = `PROMO_${plan.id}_${Date.now()}`;
      const paymentData = await initializePayment({
        email: user.email || '',
        amount,
        reference,
        callback_url: `${window.location.origin}/payment-success`,
        metadata: {
          customer_name: user.email || 'Bridgefort Client',
          custom_fields: [
            { display_name: 'Payment Type', variable_name: 'payment_type', value: 'promo_installment' },
            { display_name: 'Promo Plan ID', variable_name: 'promo_plan_id', value: plan.id },
          ],
        },
      });
      if (paymentData?.data?.authorization_url) {
        window.location.href = paymentData.data.authorization_url;
      } else {
        throw new Error('Could not start payment');
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Payment error', description: e?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-estate-blue">
            <Sprout className="h-5 w-5" /> 5K Daily Promo — Start a Land Savings Plan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Become a landlord with as low as ₦5,000 daily. Pick an estate, a plot size, and how
            often you want to pay — we'll track your progress and countdown right here.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label className="mb-1 block">Estate</Label>
              <Select value={estateSlug} onValueChange={(v) => { setEstateSlug(v); setTierIndex(0); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {fiveKEstates.map((e) => (
                    <SelectItem key={e.slug} value={e.slug}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Plot Size / Price</Label>
              <Select value={String(tierIndex)} onValueChange={(v) => setTierIndex(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {estate.tiers.map((t, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {t.sqm}sqm — {formatMoney(t.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Payment Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as PromoFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-estate-blue/5 border border-estate-blue/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Suggested {frequencyMeta[frequency].label.toLowerCase()} payment</p>
              <p className="text-2xl font-bold text-estate-blue">{formatMoney(installment)}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ {estimatePayoffPeriods(tier.price, frequency, installment).installments} payments to reach {formatMoney(tier.price)}
            </div>
            <Button onClick={handleCreatePlan} disabled={creating} className="bg-estate-blue hover:bg-estate-darkBlue">
              <Plus className="mr-2 h-4 w-4" /> {creating ? 'Starting...' : 'Start This Plan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-3">My Savings Plans</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your plans…</p>
        ) : plans.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
            You don't have any active 5K Daily Promo plans yet. Start one above.
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const planEstate = getFiveKEstate(plan.promo_estate_slug || '');
              const progressPct = plan.total_amount > 0 ? Math.min(100, (plan.amount_paid / plan.total_amount) * 100) : 0;
              const remaining = Math.max(0, plan.total_amount - plan.amount_paid);
              const meta = frequencyMeta[plan.plan_type as PromoFrequency] || frequencyMeta.daily;
              const installmentAmt = plan.promo_installment_amount || 5000;
              const { installments, totalDays } = estimatePayoffPeriods(remaining, plan.plan_type as PromoFrequency, installmentAmt);
              const isComplete = plan.amount_paid >= plan.total_amount;

              return (
                <Card key={plan.id} className={isComplete ? 'border-green-300' : ''}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{planEstate?.name || plan.property_id}</p>
                        <p className="text-xs text-muted-foreground">{planEstate?.location}</p>
                      </div>
                      <Badge className={isComplete ? 'bg-green-100 text-green-800' : 'bg-estate-blue/10 text-estate-blue'}>
                        {isComplete ? 'Completed' : `${meta.label} Plan`}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{formatMoney(plan.amount_paid)} paid of {formatMoney(plan.total_amount)}</span>
                        <span>{progressPct.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>

                    {!isComplete && (
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatCountdown(totalDays)} remaining</span>
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {installments} {meta.unitLabel}{installments === 1 ? '' : 's'} left</span>
                        </div>
                        <Button size="sm" onClick={() => handlePayInstallment(plan)} className="bg-estate-blue hover:bg-estate-darkBlue">
                          <Wallet className="mr-2 h-4 w-4" /> Pay {formatMoney(installmentAmt)} Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandSavingsPromoTab;
