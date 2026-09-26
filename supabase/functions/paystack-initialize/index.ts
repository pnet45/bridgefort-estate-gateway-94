import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, corsJson } from "../_shared/cors.ts";

serve(async (req) => {
  const cors = corsHeaders(req, "POST, OPTIONS");
  const json = (body: unknown, status = 200) => corsJson(req, body, status, "POST, OPTIONS");
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: 'Invalid authentication' }, 401);
    const authenticatedUserId = userData.user.id;
    const body = await req.json();
    const { email, metadata = {}, reference: suppliedReference, order_id, amount: requestedAmount, payment_type } = body;
    const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    let amount: number;
    let reference = suppliedReference || '';
    let order: any = null;

    if (metadata?.purchase_type === 'membership' && metadata?.package_code) {
      const { data: pkg } = await adminClient.from('mlm_packages').select('price').eq('package_code', metadata.package_code).maybeSingle();
      if (!pkg?.price) return json({ error: 'Unknown membership package' }, 400);
      amount = Number(pkg.price);
      if (!reference) reference = `MEM_${authenticatedUserId.slice(0, 8)}_${Date.now()}`;
    } else {
      if (order_id) {
        const { data, error } = await adminClient
          .from('orders')
          .select('id, user_id, total_amount, amount_paid, balance, payment_status, payment_reference')
          .eq('id', order_id)
          .maybeSingle();
        if (error || !data) return json({ error: 'Order not found' }, 404);
        order = data;
      } else if (reference) {
        const { data, error } = await adminClient
          .from('orders')
          .select('id, user_id, total_amount, amount_paid, balance, payment_status, payment_reference')
          .eq('payment_reference', reference)
          .maybeSingle();
        if (error || !data) return json({ error: 'Order not found' }, 404);
        order = data;
      } else {
        return json({ error: 'Order reference or order_id is required' }, 400);
      }

      if (order.user_id !== authenticatedUserId) return json({ error: 'Forbidden' }, 403);
      if (['paid', 'completed'].includes(String(order.payment_status))) return json({ error: 'This order has already been paid' }, 400);

      const outstanding = Math.max(0, Number(order.total_amount || 0) - Number(order.amount_paid || 0));
      if (!Number.isFinite(outstanding) || outstanding <= 0) return json({ error: 'There is no outstanding balance on this order' }, 400);

      const isFlexibleInstallment = payment_type === 'installment' || metadata?.payment_type === 'installment';
      if (isFlexibleInstallment) {
        const candidate = Number(requestedAmount ?? metadata?.amount ?? 0);
        if (!Number.isFinite(candidate) || candidate <= 0) return json({ error: 'Enter a valid installment amount' }, 400);
        if (candidate > outstanding) return json({ error: 'Payment cannot exceed the outstanding order balance' }, 400);
        amount = candidate;
        reference = `ESTATEINST_${order.id.slice(0, 8)}_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
      } else {
        amount = Number(order.total_amount);
        if (!Number.isFinite(amount) || amount <= 0) return json({ error: 'Invalid order amount' }, 400);
        if (!reference) reference = order.payment_reference || `ESTATE_${order.id.slice(0, 8)}_${Date.now()}`;
      }
    }

    if (!email || !Number.isFinite(amount) || amount <= 0) return json({ error: 'Invalid amount or email' }, 400);
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) return json({ error: 'Paystack secret key not configured' }, 500);

    // Never derive a payment callback from an arbitrary request Origin. Use an
    // explicitly configured application URL so an attacker cannot turn the
    // payment provider callback into an open redirect.
    const appUrl = (Deno.env.get('APP_URL') || 'https://www.bridgeforthomes.com').replace(/\/$/, '');
    const callbackUrl = `${appUrl}/payment-success`;
    const finalMetadata = {
      ...metadata,
      order_id: order?.id ?? metadata?.order_id ?? null,
      payment_type: payment_type || metadata?.payment_type || 'property',
      order_total: order?.total_amount ?? null,
      amount_paid_now: amount,
      currency: 'NGN',
    };
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount: Math.round(amount * 100), currency: 'NGN', reference, metadata: finalMetadata, callback_url: callbackUrl }),
    });
    const paystackData = await response.json();
    if (paystackData.status && paystackData.data?.reference && metadata?.purchase_type === 'membership') {
      const { error } = await adminClient.from('mlm_membership_purchases').upsert({ user_id: authenticatedUserId, package_code: metadata.package_code, amount, status: 'pending', paystack_reference: paystackData.data.reference, purchase_type: 'membership' }, { onConflict: 'paystack_reference' });
      if (error) console.error('Failed to record membership purchase:', error);
    }
    return new Response(JSON.stringify(paystackData), { headers: { ...cors, 'Content-Type': 'application/json' }, status: response.status });
  } catch (error) {
    console.error('paystack-initialize error:', error);
    return json({ error: 'An error occurred processing your payment request' }, 500);
  }
});
