
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useEcommerce } from '@/contexts/ecommerce';

const SavedCartItems = () => {
  const { cart, removeFromCart, setIsCartOpen } = useEcommerce();

  if (cart.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart size={20} />
            Saved Cart Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No items in your cart</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart size={20} />
          Saved Cart Items ({cart.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.plot.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 bg-cover bg-center rounded"
                  style={{ backgroundImage: `url(${item.plot.imageUrl})` }}
                />
                <div>
                  <p className="font-medium text-sm">{item.plot.propertyName}</p>
                  <p className="text-xs text-gray-600">{item.plot.location}</p>
                  <p className="text-xs">Quantity: {item.quantity}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <p className="font-bold text-estate-red text-sm">
                  ₦{(item.plot.pricePerPlot * item.quantity).toLocaleString()}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.plot.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            className="w-full mt-4"
            onClick={() => setIsCartOpen(true)}
          >
            Continue to Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedCartItems;
