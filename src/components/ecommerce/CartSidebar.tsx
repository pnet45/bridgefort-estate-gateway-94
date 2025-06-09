
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useEcommerce } from '@/contexts/ecommerce';

const CartSidebar = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    getTotalAmount, 
    getTotalItems 
  } = useEcommerce();

  const handleQuantityUpdate = (plotId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(plotId);
    } else {
      updateQuantity(plotId, newQuantity);
    }
  };

  const handleViewFullCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart ({getTotalItems()})</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCartOpen(false)}
            >
              <X size={20} />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {cart.map((item) => (
                  <div key={item.plot.id} className="border rounded-lg p-4">
                    <div className="flex gap-3">
                      <div 
                        className="w-16 h-16 bg-cover bg-center rounded-md flex-shrink-0"
                        style={{ backgroundImage: `url(${item.plot.imageUrl})` }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.plot.propertyName}</h4>
                        <p className="text-xs text-gray-600 truncate">{item.plot.location}</p>
                        <p className="text-sm font-bold text-estate-red">
                          ₦{item.plot.pricePerPlot.toLocaleString()}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleQuantityUpdate(item.plot.id, item.quantity - 1)}
                            >
                              <Minus size={12} />
                            </Button>
                            <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleQuantityUpdate(item.plot.id, item.quantity + 1)}
                            >
                              <Plus size={12} />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => removeFromCart(item.plot.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-estate-red">₦{getTotalAmount().toLocaleString()}</span>
                </div>
                
                <Button 
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white"
                  onClick={handleViewFullCart}
                >
                  View Full Cart & Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
