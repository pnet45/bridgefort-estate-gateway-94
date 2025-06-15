import React, { useState, useEffect } from 'react';
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
import { calculatePaymentPlan, PaymentPlanType } from "@/utils/paymentPlan";

interface CheckoutFormProps {
  onBack?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack }) => {
  const { cart, getTotalAmount, clearCart } = useEcommerce();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
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

  // Check if user has completed profile
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error checking profile completion:', error);
          setProfileCompleted(false);
        } else {
          setProfileCompleted(data?.profile_completed || false);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setProfileCompleted(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [user]);

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

  const handlePaystackPayment = async () => {
    console.log("[Checkout] handlePaystackPayment triggered.");
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
    const payAmount = selectedPlan.type === "outright"
      ? selectedPlan.total
      : selectedPlan.monthlyPayment * monthsToPay;

    setIsProcessing(true);
    try {
      const reference = `PWAN_${Date.now()}_${user?.id}`;
      console.log("[Checkout] Reference:", reference);
      console.log("[Checkout] Selected Plan:", selectedPlan);
      console.log("[Checkout] Cart Items:", cart);

      // Insert payment plan agreement (if not already exists? For now, always create for this cart)
      const { data: paymentAgreement, error: paymentAgreementError } = await supabase
        .from('payments')
        .insert({
          user_id: user?.id,
          property_id: cart[0]?.plot?.id,
          plan_type: selectedPlan.type,
          months: selectedPlan.months,
          principal_amount: selectedPlan.principal,
          interest_percent: selectedPlan.interestRate * 100,
          interest_amount: selectedPlan.interest,
          total_amount: selectedPlan.total,
          amount_paid: 0,
          balance: selectedPlan.total,
          status: 'pending'
        })
        .select()
        .single();

      console.log("[Checkout] Payment Agreement Result:", { paymentAgreement, paymentAgreementError });

      if (paymentAgreementError) throw new Error("Failed to create payment plan");

      // Insert order (unchanged)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          customer_email: customerInfo.email,
          customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          total_amount: selectedPlan.total,
          payment_reference: reference,
          payment_status: 'pending',
          items: cart.map(item => ({
            plot_id: item.plot.id,
            plot_number: item.plot.plotNumber,
            property_name: item.plot.propertyName,
            quantity: item.quantity,
            price: item.plot.pricePerPlot
          }))
        })
        .select()
        .single();

      console.log("[Checkout] Order Creation Result:", { orderData, orderError });

      if (orderError) {
        throw new Error('Failed to create order');
      }

      // Initialize Paystack payment using edge function
      console.log("[Checkout] Calling paystack-initialize...");
      const { data: paymentInitData, error: paymentInitError } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email: customerInfo.email,
          amount: payAmount, // <<== user can select to pay for N months!
          reference,
          user_id: user?.id,
          metadata: {
            customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            phone: customerInfo.phone,
            custom_fields: [
              {
                display_name: "Customer Address",
                variable_name: "customer_address",
                value: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state}`
              },
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: orderData.id
              },
              {
                display_name: "Payment Plan",
                variable_name: "payment_plan",
                value: selectedPlan.type
              },
              {
                display_name: "Months To Pay",
                variable_name: "months_to_pay",
                value: monthsToPay
              }
            ]
          }
        }
      });

      console.log("[Checkout] Paystack-initialize Edge invoke result:", { paymentInitData, paymentInitError });

      if (paymentInitError || !paymentInitData) throw new Error('Failed to initialize payment');
      if (typeof paymentInitData === "object" && paymentInitData.error) {
        throw new Error(paymentInitData.error);
      }
      if (paymentInitData.status && paymentInitData.data && paymentInitData.data.authorization_url) {
        console.log("[Checkout] Redirecting to Paystack (status/data/authorization_url)...");
        window.location.href = paymentInitData.data.authorization_url;
      } else if (paymentInitData.data && paymentInitData.data.authorization_url) {
        console.log("[Checkout] Redirecting to Paystack (data/authorization_url)...");
        window.location.href = paymentInitData.data.authorization_url;
      } else if (paymentInitData.authorization_url) {
        console.log("[Checkout] Redirecting to Paystack (authorization_url)...");
        window.location.href = paymentInitData.authorization_url;
      } else {
        console.error('[Checkout] No authorization URL found in response', paymentInitData);
        throw new Error(paymentInitData.message || 'Failed to initialize payment');
      }

      // The rest: Post-payment, handle hooks/webhooks or success redirect with reference.
      // Ideally, in PaymentSuccess page, update `payments` entry: add amount_paid, subtract balance,
      // and insert `payment_transactions` entry.

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

  // Show loading state while checking profile
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-estate-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Checking profile status...</p>
        </div>
      </div>
    );
  }

  // Show profile completion requirement if not completed
  if (profileCompleted === false) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center gap-3 p-4 border-b bg-white">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onBack ? onBack : () => history.back()}
            aria-label="Back to Cart"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </Button>
          <h2 className="text-lg font-semibold text-estate-blue ml-3">Profile Required</h2>
        </div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Profile Completion Required</h3>
              <p className="text-gray-600 mb-6">
                To proceed with your purchase, you must first complete your profile and KYC information. 
                This is required for all property transactions.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white"
                >
                  Complete Profile Now
                </Button>
                <Button
                  variant="outline"
                  onClick={onBack ? onBack : () => navigate('/properties')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main full-page checkout layout (only shows if profile is completed)
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
            onPay={handlePaystackPayment}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
