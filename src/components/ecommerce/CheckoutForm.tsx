
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEcommerce } from '@/contexts/ecommerce';
import { Customer, PaymentInfo } from '@/contexts/ecommerce/types';
import { toast } from '@/hooks/use-toast';

interface CheckoutFormProps {
  onBack: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack }) => {
  const { cart, getTotalAmount, checkout } = useEcommerce();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    zipCode: ''
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const handleCustomerInfoChange = (field: keyof Customer, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentInfoChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    return customerInfo.firstName && customerInfo.lastName && 
           customerInfo.email && customerInfo.phone && customerInfo.address;
  };

  const validateStep2 = () => {
    return paymentInfo.cardNumber && paymentInfo.expiryDate && 
           paymentInfo.cvv && paymentInfo.cardName;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      toast({
        title: "Error",
        description: "Please fill in all payment information",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await checkout(customerInfo, paymentInfo);
      toast({
        title: "Success!",
        description: "Your order has been placed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

          {/* Step Indicator */}
          <div className="flex mb-6">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-estate-blue' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 1 ? 'bg-estate-blue text-white' : 'bg-gray-200'}`}>
                <User size={16} />
              </div>
              <span className="text-xs">Personal Info</span>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-estate-blue' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 2 ? 'bg-estate-blue text-white' : 'bg-gray-200'}`}>
                <CreditCard size={16} />
              </div>
              <span className="text-xs">Payment</span>
            </div>
          </div>

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold flex items-center gap-2">
                <User size={18} />
                Personal Information
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

              <Button
                onClick={() => setStep(2)}
                disabled={!validateStep1()}
                className="w-full bg-estate-blue hover:bg-estate-darkBlue"
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {/* Step 2: Payment Information */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard size={18} />
                Payment Information
              </h3>

              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  value={paymentInfo.cardName}
                  onChange={(e) => handlePaymentInfoChange('cardName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => handlePaymentInfoChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => handlePaymentInfoChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentInfo.cvv}
                    onChange={(e) => handlePaymentInfoChange('cvv', e.target.value)}
                    placeholder="123"
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="w-full"
                >
                  Back to Personal Info
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep2() || isProcessing}
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                >
                  {isProcessing ? 'Processing...' : `Pay ₦${getTotalAmount().toLocaleString()}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
