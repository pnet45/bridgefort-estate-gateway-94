import { supabase } from '@/integrations/supabase/client';

// Paystack configuration
export const PAYSTACK_PUBLIC_KEY = 'pk_live_6d09681e7719b416bced07927ea4855f5b9f848e';

export interface PaystackPaymentData {
  email: string;
  amount: number; // Amount in NGN; Paystack initialization multiplies by 100 internally
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
    // Reuses the app's single, already-configured Supabase client (see
    // src/integrations/supabase/client.ts) instead of creating a second one
    // from import.meta.env.VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY — those
    // names didn't even match this project's .env (which uses
    // VITE_SUPABASE_PUBLISHABLE_KEY), and .env values aren't guaranteed to
    // exist in production unless separately configured on the hosting
    // platform. This is what caused "SupabaseURL is required".

    // user_id is no longer sent - the edge function derives it from the auth token
    const { user_id, ...safePaymentData } = paymentData;

    const { data, error } = await supabase.functions.invoke('paystack-initialize', {
      body: safePaymentData
    });

    if (error) {
      // supabase-js only gives us a generic "non-2xx status code" message on
      // `error` for edge function failures — the actual reason (e.g. "Paystack
      // secret key not configured", or a Paystack API rejection) is in the
      // response body, which `error.context` holds. Without this, every
      // failure surfaced identically as "Failed to initialize payment" no
      // matter the real cause.
      let detail: string | undefined;
      try {
        const body = await error.context?.json?.();
        detail = body?.error || body?.message;
      } catch {
        // response body wasn't JSON or already consumed — fall back below
      }
      throw new Error(detail || error.message || 'Failed to initialize payment');
    }

    if (data && (data as any).error) {
      // The edge function can also return 200-with-an-error-shaped-body in
      // some paths (e.g. Paystack itself rejecting the request) — surface that too.
      throw new Error((data as any).error);
    }

    return data;
  } catch (error: any) {
    console.error('Paystack payment error:', error);
    throw new Error(error?.message || 'Failed to initialize payment');
  }
};

// Function to verify payment
export const verifyPayment = async (reference: string, user_id?: string) => {
  try {
    // Same fix as above — reuse the app's existing client.
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