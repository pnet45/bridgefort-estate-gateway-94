import React, { useState } from 'react';
import { User, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Customer } from '@/contexts/ecommerce/types';

export type PaymentMethod = 'paystack' | 'stripe';

interface CustomerInfoFormProps {
  user: any;
  customerInfo: Customer;
  setCustomerInfo: React.Dispatch<React.SetStateAction<Customer>>;
  isProcessing: boolean;
  onPay: (method: PaymentMethod) => void;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  user,
  customerInfo,
  setCustomerInfo,
  isProcessing,
  onPay,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('paystack');

  const handleCustomerInfoChange = (field: keyof Customer, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    return customerInfo.firstName && customerInfo.lastName && 
           customerInfo.email && customerInfo.phone && customerInfo.address;
  };

  if (!user) return null;
  return (
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
          <div className="space-y-3">
            <h4 className="font-semibold text-estate-blue flex items-center gap-2">
              <CreditCard size={16} /> Choose Payment Method
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('paystack')}
                className={`p-3 rounded-lg border-2 text-left transition ${method === 'paystack' ? 'border-estate-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="font-semibold text-estate-blue">Paystack</div>
                <div className="text-xs text-gray-600">Pay in ₦ (Naira) — cards, transfer, USSD</div>
              </button>
              <button
                type="button"
                onClick={() => setMethod('stripe')}
                className={`p-3 rounded-lg border-2 text-left transition ${method === 'stripe' ? 'border-estate-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="font-semibold text-estate-blue">Stripe</div>
                <div className="text-xs text-gray-600">Pay in $ (USD) — converted at live FX rate</div>
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {method === 'stripe'
                ? 'Amount will be converted from Naira to USD using the current exchange rate at checkout.'
                : 'You will be redirected to Paystack to complete your payment securely.'}
            </p>
          </div>
          <Button
            onClick={() => onPay(method)}
            disabled={!validateStep1() || isProcessing}
            className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white py-3 animate-fade-in"
            type="button"
          >
            {isProcessing ? 'Processing...' : method === 'stripe' ? 'Pay with Stripe (USD)' : 'Pay with Paystack (₦)'}
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};
export default CustomerInfoForm;
