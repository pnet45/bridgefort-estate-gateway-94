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
import { Sprout, Calendar, Clock, Plus, Wallet, Loader2 } from 'lucide-react';
import {
  getFiveKEstate, frequencyMeta, suggestedInstallment,
  estimatePayoffPeriods, PromoFrequency,
} from '@/data/fiveKDailyPromo';
import { initializePayment } from '@/integrations/paystack/client';
import { useEcommerce } from '@/contexts/ecommerce';

interface PromoEstateOption {
  id: string;
  name: string;
  location: string | null;
  promo_price: number;
  size: number | null;
  size_unit: string | null;
  total_plots: number | null;
  sold_plots: number | null;
}

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

  const [estateOptions, setEstateOptions] = useState<PromoEstateOption[]>([]);
  const [estatesLoading, setEstatesLoading] = useState(true);
  const [selectedEstateId, setSelectedEstateId] = useState<string>('');
  const [frequency, setFrequency] = useState<PromoFrequency>('daily');
  const [creating, setCreating] = useState(false);

  const estate = estateOptions.find((e) => e.id === selectedEstateId);
  const installment = suggestedInstallment(frequency);

  // Estates enrolled in the 5K Daily Promo are real rows in the `estate`
  // table (the same one that powers the main property listings), flagged by
  // having a promo_price set. This replaces the previous hardcoded catalog
  // in src/data/fiveKDailyPromo.ts, which had no connection to real
  // inventory at all — selecting an estate here now means an actual estate.id.
  const fetchPromoEstates = async () => {
    setEstatesLoading(true);
    const { data, error } = await supabase
      .from('estate')
      .select('id, name, location, promo_price, size, size_unit, total_plots, sold_plots, is_sold_out')
      .not('promo_price', 'is', null)
      .order('name');

    if (error) {
      console.error('Failed to load promo estates:', error);
      toast({
        title: 'Could not load promo estates',
        description: 'Please refresh the page. If this keeps happening, contact support.',
        variant: 'destructive',
      });
      setEstateOptions([]);
    } else {
      const available = ((data || []) as any[]).filter((e) => !e.is_sold_out);
      setEstateOptions(available);
      if (available.length > 0) setSelectedEstateId((prev) => prev || available[0].id);
    }
    setEstatesLoading(false);
  };

  useEffect(() => {
    fetchPromoEstates();
  }, []);

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
    if (!user || !user.email) {
      toast({ title: 'Login required', description: 'Please log in to start a savings plan.', variant: 'destructive' });
      return;
    }
    if (!estate) {
      toast({ title: 'Choose an estate', description: 'Please select an estate to start your plan.', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      // The plan itself, and the admin-approval payment request, are only
      // created after a REAL payment succeeds — handled in PaymentSuccess.tsx,
      // which recognises the STARTPLAN_ reference prefix and reads the
      // structured details back out of Paystack's metadata.
      const reference = `STARTPLAN_${Date.now()}_${user.id.slice(0, 8)}`;
      const paymentData = await initializePayment({
        email: user.email,
        amount: installment,
        reference,
        callback_url: `${window.location.origin}/payment-success`,
        metadata: {
          customer_name: user.email,
          custom_fields: [
            { display_name: 'Payment Type', variable_name: 'payment_type', value: 'promo_start_plan' },
            { display_name: 'Estate ID', variable_name: 'estate_id', value: estate.id },
            { display_name: 'Estate Name', variable_name: 'estate_name', value: estate.name },
            { display_name: 'Frequency', variable_name: 'frequency', value: frequency },
            { display_name: 'Target Amount', variable_name: 'tier_price', value: String(estate.promo_price) },
            { display_name: 'Installment Amount', variable_name: 'installment_amount', value: String(installment) },
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
      toast({ title: 'Could not start plan', description: e?.message || 'Please try again.', variant: 'destructive' });
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
          {estatesLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading available estates…
            </div>
          ) : estateOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No estates are currently enrolled in the 5K Daily Promo. Check back soon.
            </p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block">Estate</Label>
                  <Select value={selectedEstateId} onValueChange={setSelectedEstateId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {estateOptions.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}{e.location ? ` — ${e.location}` : ''}
                          {e.size ? ` (${e.size}${e.size_unit || 'sqm'})` : ''} — {formatMoney(e.promo_price)}
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

              {estate && (
                <div className="bg-estate-blue/5 border border-estate-blue/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Suggested {frequencyMeta[frequency].label.toLowerCase()} payment</p>
                    <p className="text-2xl font-bold text-estate-blue">{formatMoney(installment)}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ {estimatePayoffPeriods(estate.promo_price, frequency, installment).installments} payments to reach {formatMoney(estate.promo_price)}
                  </div>
                  <Button onClick={handleCreatePlan} disabled={creating} className="bg-estate-blue hover:bg-estate-darkBlue">
                    <Plus className="mr-2 h-4 w-4" /> {creating ? 'Starting...' : 'Start This Plan'}
                  </Button>
                </div>
              )}
            </>
          )}
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
              // New plans store a real estate.id (UUID) in promo_estate_slug;
              // plans created before this fix stored a hardcoded slug from
              // the old static catalog. Support both so existing plans don't
              // suddenly lose their display info.
              const liveEstate = estateOptions.find((e) => e.id === plan.promo_estate_slug);
              const legacyEstate = liveEstate ? null : getFiveKEstate(plan.promo_estate_slug || '');
              const planEstate = liveEstate
                ? { name: liveEstate.name, location: liveEstate.location }
                : legacyEstate
                  ? { name: legacyEstate.name, location: legacyEstate.location }
                  : null;
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
                      <div className="flex items-center gap-2">
                        <Badge className={isComplete ? 'bg-green-100 text-green-800' : 'bg-estate-blue/10 text-estate-blue'}>
                          {isComplete ? 'Completed' : `${meta.label} Plan`}
                        </Badge>
                        {plan.status === 'pending' && (
                          <Badge className="bg-amber-100 text-amber-800">Pending Admin Approval</Badge>
                        )}
                        {plan.status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                        )}
                        {plan.status === 'active' && (
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{formatMoney(plan.amount_paid)} paid of {formatMoney(plan.total_amount)}</span>
                        <span>{progressPct.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>

                    {!isComplete && plan.status === 'pending' && (
                      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                        Your first payment was received and is awaiting admin approval before further installments can be made.
                      </p>
                    )}

                    {!isComplete && plan.status !== 'pending' && (
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
