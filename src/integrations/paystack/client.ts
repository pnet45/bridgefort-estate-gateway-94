
// Paystack configuration
export const PAYSTACK_PUBLIC_KEY = 'pk_live_6d09681e7719b416bced07927ea4855f5b9f848e';

export interface PaystackPaymentData {
  email: string;
  amount: number; // Amount in kobo (multiply by 100)
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: {
    customer_name: string;
    phone?: string;
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    access_code: string;
    authorization_url: string;
    reference: string;
  };
}

// Function to initialize payment
export const initializePayment = async (paymentData: PaystackPaymentData & { user_id?: string }) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    // user_id is no longer sent - the edge function derives it from the auth token
    const { user_id, ...safePaymentData } = paymentData;

    const { data, error } = await supabase.functions.invoke('paystack-initialize', {
      body: safePaymentData
    });
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Paystack payment error:', error);
    throw new Error('Failed to initialize payment');
  }
};

// Function to verify payment
export const verifyPayment = async (reference: string, user_id?: string) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    // user_id is no longer sent - the edge function derives it from the auth token
    const { data, error } = await supabase.functions.invoke('paystack-verify', {
      body: { reference },
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw new Error('Failed to verify payment');
  }
};
