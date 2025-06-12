
// Paystack configuration
export const PAYSTACK_PUBLIC_KEY = 'pk_test_ad163ed4f2eba23711f502a7411e8b2ab891ae86';

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
export const initializePayment = async (paymentData: PaystackPaymentData): Promise<PaystackResponse> => {
  try {
    const { data, error } = await window.supabase.functions.invoke('paystack-initialize', {
      body: paymentData
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Paystack payment error:', error);
    throw new Error('Failed to initialize payment');
  }
};

// Function to verify payment
export const verifyPayment = async (reference: string) => {
  try {
    const { data, error } = await window.supabase.functions.invoke('paystack-verify', {
      body: { reference }
    });
    
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw new Error('Failed to verify payment');
  }
};
