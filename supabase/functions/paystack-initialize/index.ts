
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
    const { email, amount, metadata, reference, user_id } = await req.json();
    console.log('Incoming request:', { email, amount, metadata, reference, user_id });

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
    console.log('PAYSTACK_SECRET_KEY is present');

    const callbackUrl = `${req.headers.get('origin') || 'http://localhost:3000'}/payment-success`;

    // Show config to see what is sent to Paystack
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

    // Insert a payment record into payments table (new schema)
    if (paystackData.status && paystackData.data?.reference) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Insert payment with user_id
      const paymentInsertResult = await supabase.from('payments').insert([{
        order_id: metadata?.custom_fields?.find((cf: any) => cf.variable_name === 'order_id')?.value,
        paystack_reference: paystackData.data.reference,
        status: 'pending',
        amount: amount,
        user_id: user_id,
      }]);
      console.log('Inserted payment to supabase:', paymentInsertResult);
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
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
