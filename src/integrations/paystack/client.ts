
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
  const response = await fetch('/api/paystack/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Failed to initialize payment');
  }

  return response.json();
};

// Function to verify payment
export const verifyPayment = async (reference: string) => {
  const response = await fetch(`/api/paystack/verify/${reference}`);
  
  if (!response.ok) {
    throw new Error('Failed to verify payment');
  }

  return response.json();
};
