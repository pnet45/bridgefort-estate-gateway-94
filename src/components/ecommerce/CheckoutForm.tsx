
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEcommerce } from '@/contexts/ecommerce';
import { useAuth } from '@/contexts/auth';
import { Customer } from '@/contexts/ecommerce/types';
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

      // Initialize Paystack payment using the edge function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('paystack-initialize', {
        body: {
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
        }
      });

      if (paymentError) {
        throw new Error('Failed to initialize payment');
      }

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
      
      <div className="ml-auto w-full max-w-2xl bg-white h-full shadow-xl overflow-hidden animate-slide-in-right">
        <div className="flex items-center gap-3 p-4 border-b bg-white">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-lg font-semibold text-estate-blue">Checkout</h2>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Sidebar - Order Summary */}
          <div className="w-1/3 bg-gray-50 border-r p-4">
            <h3 className="font-semibold mb-4 text-estate-blue">Order Summary</h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.plot.id} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-estate-blue truncate">{item.plot.propertyName}</div>
                    <div className="text-xs text-gray-600">Quantity: {item.quantity}</div>
                    <div className="text-sm font-semibold">₦{(item.plot.pricePerPlot * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mt-4 bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between font-bold text-lg text-estate-blue">
                  <span>Total:</span>
                  <span>₦{getTotalAmount().toLocaleString()}</span>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Content - Customer Information Form */}
          <div className="flex-1 p-6">
            <ScrollArea className="h-full">
              <div className="space-y-6 animate-fade-in">
                <h3 className="font-semibold flex items-center gap-2 text-estate-blue">
                  <User size={18} />
                  Customer Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-estate-blue">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerInfo.firstName}
                      onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                      placeholder="First Name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-estate-blue">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                      placeholder="Last Name"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-estate-blue">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-estate-blue">Phone *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-estate-blue">Address *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                    placeholder="123 Main Street"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-estate-blue">City</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                      placeholder="Lagos"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-estate-blue">State</Label>
                    <Input
                      id="state"
                      value={customerInfo.state}
                      onChange={(e) => handleCustomerInfoChange('state', e.target.value)}
                      placeholder="Lagos"
                      className="mt-1"
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
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white py-3"
                >
                  {isProcessing ? 'Processing...' : `Pay ₦${getTotalAmount().toLocaleString()} with Paystack`}
                </Button>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
