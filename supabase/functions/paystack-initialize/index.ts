import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: 'Invalid authentication' }, 401);
    const authenticatedUserId = userData.user.id;
    const { email, metadata, reference } = await req.json();
    const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    let amount: number;
    let order: any = null;

    if (metadata?.purchase_type === 'membership' && metadata?.package_code) {
      const { data: pkg } = await adminClient.from('mlm_packages').select('price').eq('package_code', metadata.package_code).maybeSingle();
      if (!pkg?.price) return json({ error: 'Unknown membership package' }, 400);
      amount = Number(pkg.price);
    } else {
      if (!reference) return json({ error: 'Order reference is required' }, 400);
      const { data, error } = await adminClient.from('orders').select('id, user_id, total_amount, payment_status').eq('payment_reference', reference).maybeSingle();
      if (error || !data) return json({ error: 'Order not found' }, 404);
      order = data;
      if (order.user_id !== authenticatedUserId) return json({ error: 'Forbidden' }, 403);
      if (order.payment_status === 'paid') return json({ error: 'This order has already been paid' }, 400);
      amount = Number(order.total_amount);
    }

    if (!email || !Number.isFinite(amount) || amount <= 0) return json({ error: 'Invalid amount or email' }, 400);
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) return json({ error: 'Paystack secret key not configured' }, 500);
    const callbackUrl = `${req.headers.get('origin') || 'http://localhost:3000'}/payment-success`;
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount: amount * 100, currency: 'NGN', reference, metadata, callback_url: callbackUrl }),
    });
    const paystackData = await response.json();
    if (paystackData.status && paystackData.data?.reference && metadata?.purchase_type === 'membership') {
      const { error } = await adminClient.from('mlm_membership_purchases').upsert({ user_id: authenticatedUserId, package_code: metadata.package_code, amount, status: 'pending', paystack_reference: paystackData.data.reference, purchase_type: 'membership' }, { onConflict: 'paystack_reference' });
      if (error) console.error('Failed to record membership purchase:', error);
    }
    return new Response(JSON.stringify(paystackData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status });
  } catch (error) {
    console.error('paystack-initialize error:', error);
    return json({ error: 'An error occurred processing your payment request' }, 500);
  }
});