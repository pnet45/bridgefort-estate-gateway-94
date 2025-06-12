
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEcommerce } from '@/contexts/ecommerce';
import { useAuth } from '@/contexts/auth';
import { Customer, PaymentInfo } from '@/contexts/ecommerce/types';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutFormProps {
  onBack: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack }) => {
  const { cart, getTotalAmount, clearCart } = useEcommerce();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  
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

  // Redirect to auth if not logged in
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

  const handleCustomerInfoChange = (field: keyof Customer, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

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

      // Create order in database first
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

      // Initialize Paystack payment
      const response = await fetch('https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/paystack-initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerInfo.email,
          amount: totalAmount,
          reference,
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
        }),
      });

      const paymentData = await response.json();

      if (paymentData.status) {
        // Redirect to Paystack payment page
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

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onBack} />
      
      <div className="ml-auto w-full max-w-lg bg-white h-full shadow-xl overflow-y-auto animate-slide-in-right">
        <div className="flex items-center gap-3 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-lg font-semibold">Checkout</h2>
        </div>

        <div className="p-4">
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.plot.id} className="flex justify-between text-sm">
                  <span>{item.plot.propertyName} x {item.quantity}</span>
                  <span>₦{(item.plot.pricePerPlot * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 font-bold">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>₦{getTotalAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-semibold flex items-center gap-2">
              <User size={18} />
              Customer Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={customerInfo.firstName}
                  onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={customerInfo.lastName}
                  onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                placeholder="john@example.com"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={customerInfo.address}
                onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={customerInfo.city}
                  onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                  placeholder="Lagos"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={customerInfo.state}
                  onChange={(e) => handleCustomerInfoChange('state', e.target.value)}
                  placeholder="Lagos"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Payment via Paystack</h4>
              <p className="text-sm text-blue-700">
                You will be redirected to Paystack to complete your payment securely. 
                We accept all major cards and bank transfers.
              </p>
            </div>

            <Button
              onClick={handlePaystackPayment}
              disabled={!validateStep1() || isProcessing}
              className="w-full bg-estate-blue hover:bg-estate-darkBlue"
            >
              {isProcessing ? 'Processing...' : `Pay ₦${getTotalAmount().toLocaleString()} with Paystack`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
