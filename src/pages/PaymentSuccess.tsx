
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEcommerce } from '@/contexts/ecommerce';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { clearCart } = useEcommerce();

  useEffect(() => {
    const reference = searchParams.get('reference');
    const stripeSessionId = searchParams.get('stripe_session_id');

    if (stripeSessionId) {
      verifyStripe(stripeSessionId);
    } else if (reference) {
      verifyPayment(reference);
    } else {
      setVerificationStatus('failed');
    }
  }, [searchParams]);

  const verifyStripe = async (session_id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-verify', {
        body: { session_id },
      });
      if (error) throw new Error(error.message);
      if (data?.status) {
        setVerificationStatus('success');
        setPaymentDetails({ reference: session_id, amount: data?.session?.amount_total, currency: (data?.session?.currency || 'usd').toUpperCase(), provider: 'Stripe' });
        clearCart();
      } else {
        setVerificationStatus('failed');
      }
    } catch (e) {
      console.error('Stripe verify error:', e);
      setVerificationStatus('failed');
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-verify', {
        body: { reference }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.status && data.data.status === 'success') {
        setVerificationStatus('success');
        setPaymentDetails(data.data);
        clearCart(); // Clear cart on successful payment

        // 5K Daily Promo installments are tagged as PROMO_<paymentsRowId>_<ts>
        // in the reference, so we can credit the right savings plan here.
        if (reference.startsWith('PROMO_')) {
          await creditPromoInstallment(reference, data.data.amount / 100);
        }

        // Starting a brand-new 5K Daily Promo plan: the plan row and its
        // admin-approval payment request are only created here, after the
        // first payment is confirmed successful — never before.
        if (reference.startsWith('STARTPLAN_')) {
          await createPlanFromPayment(reference, data.data);
        }
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('failed');
    }
  };

  const createPlanFromPayment = async (reference: string, paystackData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fields: Record<string, string> = {};
      (paystackData?.metadata?.custom_fields || []).forEach((f: any) => {
        fields[f.variable_name] = f.value;
      });

      if (fields.payment_type !== 'promo_start_plan') return;

      const estateSlug = fields.estate_slug;
      const frequency = fields.frequency;
      const tierPrice = Number(fields.tier_price || 0);
      const installmentAmount = Number(fields.installment_amount || 5000);
      const amountPaid = paystackData.amount / 100;

      const { data: createdPlan, error: planError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          property_id: `5k-daily-${estateSlug}`,
          plan_type: frequency,
          months: 0,
          principal_amount: tierPrice,
          interest_percent: 0,
          interest_amount: 0,
          total_amount: tierPrice,
          amount_paid: amountPaid,
          balance: Math.max(0, tierPrice - amountPaid),
          status: 'pending', // stays pending until an admin approves it
          promo_estate_slug: estateSlug,
          promo_installment_amount: installmentAmount,
        })
        .select()
        .single();

      if (planError) throw planError;

      await supabase.from('payment_requests').insert({
        user_id: user.id,
        type: '5k_daily_promo',
        amount: amountPaid,
        reference,
        related_payment_id: createdPlan.id,
        description: `5K Daily Promo — ${estateSlug} (${frequency}) — first installment`,
        status: 'pending',
      });
    } catch (err) {
      console.error('Error creating plan from payment:', err);
    }
  };

  const creditPromoInstallment = async (reference: string, amountPaid: number) => {
    try {
      const parts = reference.split('_');
      const planId = parts[1];
      if (!planId) return;

      const { data: plan, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', planId)
        .single();
      if (fetchError || !plan) return;

      const newAmountPaid = (plan.amount_paid || 0) + amountPaid;
      const newBalance = Math.max(0, plan.total_amount - newAmountPaid);

      await supabase
        .from('payments')
        .update({
          amount_paid: newAmountPaid,
          balance: newBalance,
          status: newBalance <= 0 ? 'completed' : 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);

      await supabase.from('payment_transactions').insert({
        payment_id: planId,
        user_id: plan.user_id,
        amount: amountPaid,
        channel: 'paystack',
        notes: '5K Daily Promo installment',
      });
    } catch (e) {
      console.error('Error crediting promo installment:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 lg:pt-20 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              {verificationStatus === 'loading' && (
                <>
                  <Loader2 className="h-16 w-16 animate-spin mx-auto text-estate-blue mb-4" />
                  <CardTitle>Verifying Payment...</CardTitle>
                </>
              )}
              
              {verificationStatus === 'success' && (
                <>
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <CardTitle className="text-green-700">Payment Successful!</CardTitle>
                </>
              )}
              
              {verificationStatus === 'failed' && (
                <>
                  <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                  <CardTitle className="text-red-700">Payment Failed</CardTitle>
                </>
              )}
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              {verificationStatus === 'success' && paymentDetails && (
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Transaction Reference: <span className="font-mono">{paymentDetails.reference}</span>
                  </p>
                  <p className="text-gray-600">
                    Amount: <span className="font-bold">₦{(paymentDetails.amount / 100).toLocaleString()}</span>
                  </p>
                  <p className="text-sm text-green-600">
                    Thank you for your purchase! We'll send you a confirmation email shortly.
                  </p>
                </div>
              )}
              
              {verificationStatus === 'failed' && (
                <p className="text-gray-600">
                  We couldn't verify your payment. Please contact our support team if you believe this is an error.
                </p>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/properties')}
                  className="flex-1 bg-estate-blue hover:bg-estate-darkBlue"
                >
                  Browse Properties
                </Button>
                
                {verificationStatus === 'success' && (
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="flex-1"
                  >
                    View Orders
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
