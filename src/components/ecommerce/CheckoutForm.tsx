import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEcommerce } from '@/contexts/ecommerce';
import { useAuth } from '@/contexts/auth';
import { Customer } from '@/contexts/ecommerce/types';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import CheckoutDrawer from './CheckoutDrawer';
import OrderSummary from './OrderSummary';
import CustomerInfoForm from './CustomerInfoForm';
import PaymentPlanSelector from './PaymentPlanSelector';
import { calculatePaymentPlan, PaymentPlanType } from "@/utils/paymentPlan";

interface CheckoutFormProps {
  onBack: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack }) => {
  const { cart, getTotalAmount, clearCart } = useEcommerce();
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [selectedPlan, setSelectedPlan] = useState<{ months: number; type: PaymentPlanType; total: number; principal: number; interest: number; interestRate: number } | null>(null);

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
    if (!validateStep1()) {
      toast({
        title: "Error",
        description: "Please fill in all required information",
        variant: "destructive"
      });
      return;
    }
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Please select a payment plan",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const totalAmount = selectedPlan.total;
      const reference = `PWAN_${Date.now()}_${user?.id}`;
      // Insert into payments table (creates a payment plan agreement)
      const { data: paymentAgreement, error: paymentAgreementError } = await supabase
        .from('payments')
        .insert({
          user_id: user?.id,
          property_id: cart[0]?.plot?.id, // Assuming only one property at a time
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

      if (paymentAgreementError) throw new Error("Failed to create payment plan");

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          customer_email: customerInfo.email,
          customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          total_amount: totalAmount,
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

      if (orderError) {
        throw new Error('Failed to create order');
      }

      // Initialize Paystack payment using the edge function
      const { data: paymentInitData, error: paymentInitError } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email: customerInfo.email,
          amount: totalAmount,
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
              }
            ]
          }
        }
      });

      console.log("Paystack response:", paymentInitData, paymentInitError);

      if (paymentInitError || !paymentInitData) throw new Error('Failed to initialize payment');
      if (typeof paymentInitData === "object" && paymentInitData.error) {
        throw new Error(paymentInitData.error);
      }
      if (paymentInitData.status && paymentInitData.data && paymentInitData.data.authorization_url) {
        window.location.href = paymentInitData.data.authorization_url;
      } else if (paymentInitData.data && paymentInitData.data.authorization_url) {
        window.location.href = paymentInitData.data.authorization_url;
      } else if (paymentInitData.authorization_url) {
        window.location.href = paymentInitData.authorization_url;
      } else {
        throw new Error(paymentInitData.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
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

  return (
    <CheckoutDrawer onBack={onBack}>
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-lg font-semibold text-estate-blue">Checkout</h2>
      </div>
      <div className="flex h-[calc(100vh-80px)]">
        <OrderSummary cart={cart} getTotalAmount={getTotalAmount} />
        <PaymentPlanSelector
          baseAmount={getTotalAmount()}
          onPlanSelect={plan => setSelectedPlan(plan)}
          selected={selectedPlan}
        />
        <CustomerInfoForm
          user={user}
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          isProcessing={isProcessing}
          onPay={() => handlePaystackPayment()}
        />
      </div>
    </CheckoutDrawer>
  );
};

export default CheckoutForm;
