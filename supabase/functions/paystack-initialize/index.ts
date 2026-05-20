
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
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;

    const { email, amount, metadata, reference } = await req.json();
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

    // Insert a payment record using the authenticated user_id
    if (paystackData.status && paystackData.data?.reference) {
      const supabaseAdmin = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const paymentInsertResult = await supabaseAdmin.from('payments').insert([{
        order_id: metadata?.custom_fields?.find((cf: any) => cf.variable_name === 'order_id')?.value,
        paystack_reference: paystackData.data.reference,
        status: 'pending',
        amount: amount,
        user_id: authenticatedUserId, // Use authenticated user, not client-supplied
      }]);
      console.log('Inserted payment to supabase:', paymentInsertResult);

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
        console.log('Inserted MLM membership purchase:', purchaseInsertResult);
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
