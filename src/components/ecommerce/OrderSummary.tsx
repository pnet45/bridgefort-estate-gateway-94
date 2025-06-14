
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrderSummaryProps {
  cart: { plot: any; quantity: number }[];
  getTotalAmount: () => number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart, getTotalAmount }) => (
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
);

export default OrderSummary;
