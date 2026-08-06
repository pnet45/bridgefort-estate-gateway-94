
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEcommerce } from '@/contexts/ecommerce';
import { useAuth } from '@/contexts/auth';
import { Customer } from '@/contexts/ecommerce/types';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import OrderSummary from './OrderSummary';
import CustomerInfoForm from './CustomerInfoForm';
import PaymentPlanSelector from './PaymentPlanSelector';
import { calculatePaymentBreakdown, PaymentPlanType } from "@/utils/paymentPlan";
import { useRecaptchaV3 } from '@/hooks/useRecaptchaV3';

interface CheckoutFormProps {
  onBack?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack }) => {
  const { cart, getTotalAmount, clearCart } = useEcommerce();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { execute: executeRecaptcha } = useRecaptchaV3();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    zipCode: ''
  });

  const [selectedPlan, setSelectedPlan] = useState<{
    months: number;
    type: PaymentPlanType;
    total: number;
    principal: number;
    interest: number;
    interestRate: number;
    monthsToPay?: number;
    monthlyPayment: number;
    payAmount: number;
  } | null>(null);

  React.useEffect(() => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed with checkout",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, navigate]);

  const validateStep1 = () => {
    return customerInfo.firstName && customerInfo.lastName && 
           customerInfo.email && customerInfo.phone && customerInfo.address;
  };

  const handlePayment = async (method: 'paystack' | 'stripe' = 'paystack') => {
    console.log(`[Checkout] handlePayment triggered. Method: ${method}`);
    if (!validateStep1()) {
      toast({
        title: "Error",
        description: "Please fill in all required information",
        variant: "destructive"
      });
      return;
    }
    if (!selectedPlan || !selectedPlan.months) {
      toast({
        title: "Error",
        description: "Please select a payment plan",
        variant: "destructive"
      });
      return;
    }

    const monthsToPay = selectedPlan.monthsToPay || 1;

    setIsProcessing(true);
    try {
      // Passive reCAPTCHA v3 — blocks submit only if token missing (mock verify).
      const captchaToken = await executeRecaptcha('checkout');
      if (!captchaToken) {
        throw new Error('Verification failed. Please refresh and try again.');
      }

      // Prices are NEVER sent from the browser. The edge function looks every
      // item up in the database, applies the plan interest and creates the
      // order + payment-plan rows with the authoritative amount.
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-checkout-order', {
        body: {
          items: cart.map(item => ({
            item_id: item.plot.id,
            property_id: item.plot.propertyId,
            property_type: item.plot.propertyType,
            plot_number: item.plot.plotNumber,
            quantity: item.quantity,
          })),
          plan_type: selectedPlan.type,
          months_to_pay: monthsToPay,
          customer: {
            email: customerInfo.email,
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            phone: customerInfo.phone,
          },
        },
      });

      if (orderError || !orderData || orderData.error) {
        throw new Error(orderData?.error || orderError?.message || 'Failed to create order');
      }

      const reference: string = orderData.reference;
      const payAmount: number = orderData.pay_amount;

      if (method === 'stripe') {
        const { data: stripeData, error: stripeError } = await supabase.functions.invoke('stripe-initialize', {
          body: {
            email: customerInfo.email,
            reference,
            description: cart[0]?.plot?.propertyName || 'PWAN Bridgefort Payment',
            metadata: {
              order_id: orderData.order_id,
              customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            },
          },
        });
        if (stripeError || !stripeData?.url) {
          throw new Error(stripeError?.message || stripeData?.error || 'Failed to initialize Stripe');
        }
        window.location.href = stripeData.url;
        return;
      }

      // Initialize Paystack payment using edge function
      const { data: paymentInitData, error: paymentInitError } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email: customerInfo.email,
          reference,
          metadata: {
            customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            phone: customerInfo.phone,
            custom_fields: [
              { display_name: "Customer Address", variable_name: "customer_address", value: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state}` },
              { display_name: "Order ID", variable_name: "order_id", value: orderData.order_id },
              { display_name: "Payment Plan", variable_name: "payment_plan", value: orderData.plan_type },
              { display_name: "Months To Pay", variable_name: "months_to_pay", value: monthsToPay }
            ]
          }
        }
      });

      console.log("[Checkout] Paystack init:", { paymentInitError, amount: payAmount });

      if (paymentInitError || !paymentInitData) throw new Error('Failed to initialize payment');
      if (typeof paymentInitData === "object" && paymentInitData.error) {
        throw new Error(paymentInitData.error);
      }
      const authUrl = paymentInitData?.data?.authorization_url || paymentInitData?.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        console.error('[Checkout] No authorization URL found in response', paymentInitData);
        throw new Error(paymentInitData.message || 'Failed to initialize payment');
      }

    } catch (error) {
      console.error('[Checkout] Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;

  // Main full-page checkout layout
  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        {/* "Back to cart" button */}
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={onBack ? onBack : () => history.back()}
          aria-label="Back to Cart"
        >
          <ArrowLeft size={20} />
          Back to Cart
        </Button>
        <h2 className="text-lg font-semibold text-estate-blue ml-3">Checkout</h2>
      </div>
      <div className="flex flex-col md:flex-row w-full h-full">
        <OrderSummary cart={cart} getTotalAmount={getTotalAmount} />
        <div className="flex-1 flex flex-col md:flex-row">
          <div className="md:w-[340px] p-4">
            <PaymentPlanSelector
              baseAmount={getTotalAmount()}
              onPlanSelect={plan => setSelectedPlan(plan)}
              selected={selectedPlan}
            />
            {selectedPlan && selectedPlan.type !== "outright" && (
              <div className="mt-4 bg-blue-50 p-3 rounded-lg text-blue-800 border border-blue-200">
                <div>
                  Monthly Payment:&nbsp;
                  <span className="font-semibold">
                    ₦{selectedPlan.monthlyPayment?.toLocaleString()}
                  </span>
                </div>
                <div>
                  Paying for:&nbsp;
                  <span>
                    {selectedPlan.monthsToPay || 1} month{selectedPlan.monthsToPay && selectedPlan.monthsToPay > 1 ? "s" : ""}
                    {" "}({selectedPlan.monthlyPayment && selectedPlan.monthsToPay ? "₦" + (selectedPlan.monthlyPayment * selectedPlan.monthsToPay).toLocaleString() : ""})
                  </span>
                </div>
                <div>
                  Over {selectedPlan.months} months (Total: ₦{selectedPlan.total.toLocaleString()})
                </div>
              </div>
            )}
          </div>
          <CustomerInfoForm
            user={user}
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
            isProcessing={isProcessing}
            onPay={handlePayment}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
