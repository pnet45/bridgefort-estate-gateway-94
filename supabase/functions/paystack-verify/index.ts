/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { queueOrderForApproval } from '../_shared/paymentApproval.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: 'Invalid authentication' }, 401);

    const authenticatedUserId = claimsData.claims.sub;
    const body = req.headers.get('content-type')?.includes('application/json') ? await req.json() : {};
    const reference = body.reference || new URL(req.url).pathname.split('/').pop();
    if (!reference) return json({ error: 'Payment reference is required' }, 400);

    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecret) throw new Error('Paystack secret key not configured');
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { method: 'GET', headers: { Authorization: `Bearer ${paystackSecret}` } });
    const data = await response.json();
    if (!(data.status && data.data.status === 'success')) return json(data, response.status);

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const paidAmount = Number(data.data.amount ?? 0) / 100;
    const currency = String(data.data.currency ?? 'NGN');
    if (currency !== 'NGN' || !Number.isFinite(paidAmount) || paidAmount <= 0) return json({ status: false, message: 'Invalid payment currency or amount.' }, 400);

    const fields: Record<string, string> = {};
    (data.data?.metadata?.custom_fields || []).forEach((f: any) => {
      if (f?.variable_name) fields[f.variable_name] = f.value;
    });
    const metadata = data.data?.metadata || {};
    const isStartPlan = String(reference).startsWith('STARTPLAN_') && fields.payment_type === 'promo_start_plan';
    const isPromoInstallment = String(reference).startsWith('PROMO_');
    const metadataOrderId = metadata?.order_id ? String(metadata.order_id) : null;

    // Resolve an estate order either by its original reference or by the
    // immutable order_id carried in Paystack metadata for flexible installment
    // transactions, whose gateway reference is intentionally unique per payment.
    let orderQuery = admin.from('orders').select('id, user_id, total_amount, amount_paid, balance, payment_status, items, payment_reference').limit(1);
    let order: any = null;
    if (metadataOrderId) {
      const { data: byId } = await orderQuery.eq('id', metadataOrderId).maybeSingle();
      order = byId;
    }
    if (!order) {
      const { data: byReference } = await admin.from('orders').select('id, user_id, total_amount, amount_paid, balance, payment_status, items, payment_reference').eq('payment_reference', reference).maybeSingle();
      order = byReference;
    }

    const { data: membershipPurchase } = await admin.from('mlm_membership_purchases').select('id, package_code, status, user_id, amount, purchase_type').eq('paystack_reference', reference).maybeSingle();

    if (order && order.user_id !== authenticatedUserId) return json({ error: 'Forbidden' }, 403);
    if (membershipPurchase && membershipPurchase.user_id !== authenticatedUserId) return json({ error: 'Forbidden' }, 403);
    if (order && membershipPurchase) return json({ error: 'Ambiguous payment reference' }, 409);
    if (!order && !membershipPurchase && !isStartPlan && !isPromoInstallment) return json({ error: 'Payment reference is not associated with your account' }, 404);

    // Estate orders allow a flexible partial payment. A normal property
    // checkout must equal the full order amount; an installment checkout may
    // be any positive amount up to the outstanding order balance.
    if (order || membershipPurchase) {
      let expectedAmount: number | null = null;
      if (order) {
        const outstanding = Math.max(0, Number(order.total_amount || 0) - Number(order.amount_paid || 0));
        const isInstallment = String(metadata?.payment_type || '').toLowerCase() === 'installment' || String(reference).startsWith('ESTATEINST_');
        expectedAmount = isInstallment ? outstanding : Number(order.total_amount);
        if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) return json({ error: 'No outstanding balance on this order' }, 400);
        if (paidAmount > expectedAmount + 1) return json({ status: false, message: 'Payment amount exceeds the outstanding order balance.' }, 400);
        if (!isInstallment && paidAmount + 1 < expectedAmount) return json({ status: false, message: 'Payment amount does not match the order amount.' }, 400);
      }
      if (membershipPurchase) {
        const { data: pkg } = await admin.from('mlm_packages').select('price').eq('package_code', membershipPurchase.package_code).maybeSingle();
        if (!pkg?.price) return json({ error: 'Membership package pricing is unavailable' }, 500);
        expectedAmount = Number(pkg.price);
        if (paidAmount + 1 < expectedAmount || paidAmount > expectedAmount + 1) return json({ status: false, message: 'Payment amount does not match the membership amount.' }, 400);
      }
    }

    if (isStartPlan) {
      const estateId = fields.estate_id;
      const frequency = ['daily', 'weekly', 'monthly'].includes(fields.frequency) ? fields.frequency : 'daily';
      if (!estateId) return json({ error: 'Promo estate is required' }, 400);
      const { data: existingPlan } = await admin.from('payments').select('id').eq('user_id', authenticatedUserId).eq('promo_estate_slug', estateId).eq('plan_type', frequency).maybeSingle();
      const { data: estateRow } = await admin.from('estate').select('name, promo_price, actual_price').eq('id', estateId).maybeSingle();
      const targetPrice = Number(estateRow?.promo_price ?? estateRow?.actual_price ?? 0);
      if (!targetPrice) return json({ error: 'Promo estate could not be found' }, 404);
      if (!existingPlan) {
        const { data: createdPlan, error: createError } = await admin.from('payments').insert({ user_id: authenticatedUserId, property_id: estateId, plan_type: frequency, months: 0, principal_amount: targetPrice, interest_percent: 0, interest_amount: 0, total_amount: targetPrice, amount_paid: paidAmount, balance: Math.max(0, targetPrice - paidAmount), status: 'pending', promo_estate_slug: estateId, promo_installment_amount: paidAmount }).select().single();
        if (createError) throw createError;
        if (createdPlan) await admin.from('payment_requests').insert({ user_id: authenticatedUserId, type: '5k_daily_promo', amount: paidAmount, reference, related_payment_id: createdPlan.id, description: `5K Daily Promo — ${estateRow?.name ?? estateId} (${frequency}) — first installment`, status: 'pending' });
      }
    }

    if (isPromoInstallment) {
      const planId = String(reference).split('_')[1];
      const { data: plan } = planId ? await admin.from('payments').select('id, user_id, total_amount, amount_paid').eq('id', planId).maybeSingle() : { data: null };
      if (!plan || plan.user_id !== authenticatedUserId) return json({ error: 'Promo payment is not associated with your account' }, 403);
      const { data: alreadyCredited } = await admin.from('payment_transactions').select('id').eq('payment_id', plan.id).eq('notes', `5K Daily Promo installment (${reference})`).maybeSingle();
      if (!alreadyCredited) {
        const newAmountPaid = Number(plan.amount_paid ?? 0) + paidAmount;
        const newBalance = Math.max(0, Number(plan.total_amount ?? 0) - newAmountPaid);
        await admin.from('payments').update({ amount_paid: newAmountPaid, balance: newBalance, status: newBalance <= 0 ? 'completed' : 'active', updated_at: new Date().toISOString() }).eq('id', plan.id);
        await admin.from('payment_transactions').insert({ payment_id: plan.id, user_id: plan.user_id, amount: paidAmount, channel: 'paystack', notes: `5K Daily Promo installment (${reference})` });
      }
    }

    if (order) await queueOrderForApproval(admin, { reference, orderId: order.id, paidAmount, channel: 'Paystack' });

    if (membershipPurchase && membershipPurchase.status === 'pending') {
      const { data: pkg } = await admin.from('mlm_packages').select('package_code, package_name').eq('package_code', membershipPurchase.package_code).single();
      if (pkg) {
        const { data: completedPurchase, error: completeError } = await admin.from('mlm_membership_purchases').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', membershipPurchase.id).eq('status', 'pending').select('id').maybeSingle();
        if (completeError) throw completeError;
        if (completedPurchase) await admin.from('profiles').update({ current_package: pkg.package_code, is_pbo: true, is_active: true, updated_at: new Date().toISOString() }).eq('id', membershipPurchase.user_id);
      }
    }

    return json(data, response.status);
  } catch (error) {
    console.error('paystack-verify error:', error);
    return json({ error: 'An error occurred verifying your payment' }, 400);
  }
});