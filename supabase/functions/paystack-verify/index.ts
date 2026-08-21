/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { queueOrderForApproval } from '../_shared/paymentApproval.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: 'Invalid authentication' }, 401);

    const authenticatedUserId = claimsData.claims.sub;
    const body = req.headers.get('content-type')?.includes('application/json') ? await req.json() : {};
    const reference = body.reference || new URL(req.url).pathname.split('/').pop();
    if (!reference) return json({ error: 'Payment reference is required' }, 400);

    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecret) throw new Error('Paystack secret key not configured');

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${paystackSecret}` },
    });
    const data = await response.json();

    if (!(data.status && data.data.status === 'success')) return json(data, response.status);

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const paidAmount = Number(data.data.amount ?? 0) / 100;
    const currency = String(data.data.currency ?? 'NGN');

    // Resolve the reference to exactly one owned financial record before
    // changing any order, membership, profile, or commission state.
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, total_amount, payment_status')
      .eq('payment_reference', reference)
      .maybeSingle();

    const { data: membershipPurchase } = await admin
      .from('mlm_membership_purchases')
      .select('id, package_code, status, user_id, amount, purchase_type')
      .eq('paystack_reference', reference)
      .maybeSingle();

    if (order && order.user_id !== authenticatedUserId) return json({ error: 'Forbidden' }, 403);
    if (membershipPurchase && membershipPurchase.user_id !== authenticatedUserId) return json({ error: 'Forbidden' }, 403);
    if (!order && !membershipPurchase) return json({ error: 'Payment reference is not associated with your account' }, 404);
    if (order && membershipPurchase) return json({ error: 'Ambiguous payment reference' }, 409);

    // Server-side amount verification. A successful Paystack callback is not
    // enough to authorize a cheaper/tampered transaction.
    let expectedAmount: number | null = null;
    if (order?.total_amount != null) expectedAmount = Number(order.total_amount);
    if (membershipPurchase) {
      const { data: pkg } = await admin
        .from('mlm_packages')
        .select('price')
        .eq('package_code', membershipPurchase.package_code)
        .maybeSingle();
      if (!pkg?.price) return json({ error: 'Membership package pricing is unavailable' }, 500);
      expectedAmount = Number(pkg.price);
    }

    const amountMismatch = expectedAmount == null || paidAmount + 1 < expectedAmount || paidAmount > expectedAmount + 1;
    if (currency !== 'NGN' || amountMismatch) {
      console.error('Payment amount mismatch', { reference, paidAmount, expectedAmount, currency });
      await admin.from('payments').update({ status: 'amount_mismatch' }).eq('paystack_reference', reference);
      return json({ status: false, message: 'Payment amount does not match the amount owed. Please contact support.' }, 400);
    }

    // -----------------------------------------------------------------------
    // 5K Daily Promo plans
    // -----------------------------------------------------------------------
    const fields: Record<string, string> = {};
    (data.data?.metadata?.custom_fields || []).forEach((f: any) => {
      if (f?.variable_name) fields[f.variable_name] = f.value;
    });

    if (String(reference).startsWith('STARTPLAN_') && fields.payment_type === 'promo_start_plan') {
      const estateId = fields.estate_id;
      const frequency = ['daily', 'weekly', 'monthly'].includes(fields.frequency) ? fields.frequency : 'daily';
      const { data: existingPlan } = await admin
        .from('payments')
        .select('id')
        .eq('user_id', authenticatedUserId)
        .eq('promo_estate_slug', estateId)
        .eq('plan_type', frequency)
        .maybeSingle();

      const { data: estateRow } = estateId
        ? await admin.from('estate').select('name, promo_price, actual_price').eq('id', estateId).maybeSingle()
        : { data: null };
      const targetPrice = Number(estateRow?.promo_price ?? estateRow?.actual_price ?? 0);

      if (!existingPlan && targetPrice > 0) {
        const { data: createdPlan } = await admin.from('payments').insert({
          user_id: authenticatedUserId,
          property_id: estateId,
          plan_type: frequency,
          months: 0,
          principal_amount: targetPrice,
          interest_percent: 0,
          interest_amount: 0,
          total_amount: targetPrice,
          amount_paid: paidAmount,
          balance: Math.max(0, targetPrice - paidAmount),
          status: 'pending',
          promo_estate_slug: estateId,
          promo_installment_amount: paidAmount,
        }).select().single();

        if (createdPlan) {
          await admin.from('payment_requests').insert({
            user_id: authenticatedUserId,
            type: '5k_daily_promo',
            amount: paidAmount,
            reference,
            related_payment_id: createdPlan.id,
            description: `5K Daily Promo — ${estateRow?.name ?? estateId} (${frequency}) — first installment`,
            status: 'pending',
          });
        }
      }
    }

    if (String(reference).startsWith('PROMO_')) {
      const planId = String(reference).split('_')[1];
      const { data: plan } = planId
        ? await admin.from('payments').select('id, user_id, total_amount, amount_paid').eq('id', planId).maybeSingle()
        : { data: null };

      if (plan && plan.user_id === authenticatedUserId) {
        const { data: alreadyCredited } = await admin
          .from('payment_transactions')
          .select('id')
          .eq('payment_id', plan.id)
          .eq('notes', `5K Daily Promo installment (${reference})`)
          .maybeSingle();

        if (!alreadyCredited) {
          const newAmountPaid = Number(plan.amount_paid ?? 0) + paidAmount;
          const newBalance = Math.max(0, Number(plan.total_amount ?? 0) - newAmountPaid);
          await admin.from('payments').update({
            amount_paid: newAmountPaid,
            balance: newBalance,
            status: newBalance <= 0 ? 'completed' : 'active',
            updated_at: new Date().toISOString(),
          }).eq('id', plan.id);

          await admin.from('payment_transactions').insert({
            payment_id: plan.id,
            user_id: plan.user_id,
            amount: paidAmount,
            channel: 'paystack',
            notes: `5K Daily Promo installment (${reference})`,
          });
        }
      }
    }

    // Estate/property checkout remains approval-gated. The database approval
    // trigger awards property commission: seller 15%, seller's first-level
    // referrer 5%, and no level 3+ commission.
    if (order) {
      await queueOrderForApproval(admin, { reference, paidAmount, channel: 'Paystack' });
    }

    // Membership payment: activation is idempotent and the database trigger
    // is responsible for the membership referral commissions. This preserves
    // the requested network-marketing income while keeping commission creation
    // in one authoritative database path.
    if (membershipPurchase && membershipPurchase.status === 'pending') {
      const { data: pkg } = await admin
        .from('mlm_packages')
        .select('package_code, package_name')
        .eq('package_code', membershipPurchase.package_code)
        .single();

      if (pkg) {
        const { data: completedPurchase, error: completeError } = await admin.from('mlm_membership_purchases')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', membershipPurchase.id)
          .eq('status', 'pending')
          .select('id')
          .maybeSingle();

        if (completeError) throw completeError;

        if (completedPurchase) {
          await admin.from('profiles').update({
            current_package: pkg.package_code,
            is_pbo: true,
            is_active: true,
            updated_at: new Date().toISOString(),
          }).eq('id', membershipPurchase.user_id);
        }
      }
    }

    return json(data, response.status);
  } catch (error) {
    console.error('paystack-verify error:', error);
    return json({ error: 'An error occurred verifying your payment' }, 400);
  }
});