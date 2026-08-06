
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request received');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('Auth check failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const authenticatedUserId = userData.user.id;

    const { email, amount: clientAmount, metadata, reference } = await req.json();
    const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    let amount = Number(clientAmount);

    // Authoritative pricing. A client-supplied amount is only ever a fallback
    // for flows that have no server-side record yet, and it is rejected
    // outright whenever a matching order exists for the reference.
    const { data: order } = reference
      ? await adminClient
          .from('orders')
          .select('id, user_id, total_amount, payment_status')
          .eq('payment_reference', reference)
          .maybeSingle()
      : { data: null };

    if (order) {
      if (order.user_id !== authenticatedUserId) {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
      if (order.payment_status === 'paid') {
        return new Response(
          JSON.stringify({ error: 'This order has already been paid' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      amount = Number(order.total_amount);
    }

    // For membership purchases the authoritative price lives server-side —
    // never trust the amount computed by the client.
    if (metadata?.purchase_type === 'membership' && metadata?.package_code) {
      const { data: pkg } = await adminClient
        .from('mlm_packages')
        .select('price')
        .eq('package_code', metadata.package_code)
        .maybeSingle();
      if (!pkg?.price) {
        return new Response(
          JSON.stringify({ error: 'Unknown membership package' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      amount = Number(pkg.price);
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }


    console.log('Incoming request:', { email, amount, metadata, reference, user_id: authenticatedUserId });

    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY is NOT set in environment variables!');
      return new Response(
        JSON.stringify({ error: 'Paystack secret key not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const callbackUrl = `${req.headers.get('origin') || 'http://localhost:3000'}/payment-success`;

    console.log('Sending request to Paystack:', {
      email, amount: amount * 100, reference, metadata, callback_url: callbackUrl
    });

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        currency: 'NGN',
        reference,
        metadata,
        callback_url: callbackUrl,
      }),
    });

    console.log('Paystack API status:', response.status);
    const paystackData = await response.json();
    console.log('Paystack API response data:', paystackData);

    // Note: we deliberately do NOT insert a `payments` row here. That table
    // requires property_id, plan_type, months, principal_amount, and
    // several other NOT NULL columns that this generic initialize endpoint
    // has no way to know — a prior version tried to insert here anyway and
    // always failed on those constraints (silently, since the result was
    // never checked). The correct place to create that row is after
    // Paystack confirms the payment succeeded — see PaymentSuccess.tsx,
    // which has the full context needed to populate every required field.
    if (paystackData.status && paystackData.data?.reference) {
      const supabaseAdmin = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const isMembership = metadata?.purchase_type === 'membership';
      if (isMembership) {
        const purchaseInsertResult = await supabaseAdmin.from('mlm_membership_purchases').insert([{
          user_id: authenticatedUserId,
          package_code: metadata?.package_code,
          amount: amount,
          status: 'pending',
          paystack_reference: paystackData.data.reference,
          purchase_type: 'membership',
        }]);
        if (purchaseInsertResult.error) {
          console.error('Failed to insert MLM membership purchase:', purchaseInsertResult.error);
        } else {
          console.log('Inserted MLM membership purchase:', purchaseInsertResult);
        }
      }
    }

    return new Response(
      JSON.stringify(paystackData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      },
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your payment request' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
