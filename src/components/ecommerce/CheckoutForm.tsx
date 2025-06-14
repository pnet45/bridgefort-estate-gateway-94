
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

    setIsProcessing(true);
    try {
      const totalAmount = getTotalAmount();
      const reference = `PWAN_${Date.now()}_${user?.id}`;
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
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('paystack-initialize', {
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

      if (paymentError) throw new Error('Failed to initialize payment');

      if (paymentData.status) {
        window.location.href = paymentData.data.authorization_url;
      } else {
        throw new Error(paymentData.message || 'Failed to initialize payment');
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
