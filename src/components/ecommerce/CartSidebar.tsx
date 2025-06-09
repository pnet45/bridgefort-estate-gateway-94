
import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEcommerce } from '@/contexts/ecommerce';
import CheckoutForm from './CheckoutForm';

const CartSidebar: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    getTotalAmount,
    clearCart 
  } = useEcommerce();

  const [showCheckout, setShowCheckout] = React.useState(false);

  if (!isCartOpen) return null;

  if (showCheckout) {
    return <CheckoutForm onBack={() => setShowCheckout(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />
      
      <div className="ml-auto w-full max-w-md bg-white h-full shadow-xl animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsCartOpen(false)}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.plot.id} className="border rounded-lg p-4 animate-fade-in">
                  <div className="flex gap-3">
                    <img 
                      src={item.plot.imageUrl} 
                      alt={item.plot.propertyName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.plot.propertyName}</h3>
                      <p className="text-xs text-gray-500">{item.plot.location}</p>
                      <p className="text-sm font-bold text-estate-blue">
                        ₦{item.plot.pricePerPlot.toLocaleString()} per plot
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.plot.id, item.quantity - 1)}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.plot.id, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.plot.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  <div className="mt-2 text-right">
                    <p className="font-bold">
                      ₦{(item.plot.pricePerPlot * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg text-estate-blue">
                ₦{getTotalAmount().toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
