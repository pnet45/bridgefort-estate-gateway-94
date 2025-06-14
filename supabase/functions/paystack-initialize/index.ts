
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, amount, metadata, reference, user_id } = await req.json();

    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key not configured');
    }

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
        callback_url: `${req.headers.get('origin')}/payment-success`,
      }),
    });

    const paystackData = await response.json();

    // Insert a payment record into payments table (new schema)
    if (paystackData.status && paystackData.data?.reference) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Insert payment with user_id
      await supabase.from('payments').insert([{
        order_id: metadata?.custom_fields?.find(cf => cf.variable_name === 'order_id')?.value,
        paystack_reference: paystackData.data.reference,
        status: 'pending',
        amount: amount,
        user_id: user_id,
      }]);
    }

    return new Response(
      JSON.stringify(paystackData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      },
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
