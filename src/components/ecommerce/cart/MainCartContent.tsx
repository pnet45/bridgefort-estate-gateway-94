
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MainCartContentProps {
  cart: any[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, n: number) => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  setShowCheckout: (show: boolean) => void;
}

const MainCartContent: React.FC<MainCartContentProps> = ({
  cart,
  removeFromCart,
  updateQuantity,
  getTotalAmount,
  getTotalItems,
  setShowCheckout
}) => {
  const navigate = useNavigate();

  const handleQuantityUpdate = (plotId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(plotId);
    } else {
      updateQuantity(plotId, newQuantity);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Continue Shopping
        </Button>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {getTotalItems()} items
        </Badge>
      </div>
      {cart.length === 0 ? (
        <Card className="text-center py-12 bg-white">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Add some properties to get started</p>
            <Button onClick={() => navigate('/properties')}>
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <Card key={item.plot.id} className="overflow-hidden border-gray-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-32 h-32 bg-cover bg-center rounded-lg" 
                              style={{ backgroundImage: `url(${item.plot.imageUrl})` }} />
                            <div className="flex-1 space-y-2">
                              <h3 className="text-xl font-semibold text-estate-blue">
                                {item.plot.propertyName}
                              </h3>
                              <p className="text-gray-600">{item.plot.location}</p>
                              <p className="text-sm text-gray-500">
                                Plot #{item.plot.plotNumber} • {item.plot.size}sqm • {item.plot.propertyType}
                              </p>
                              <p className="text-lg font-bold text-estate-red">
                                ₦{item.plot.pricePerPlot.toLocaleString()} per plot
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.plot.id, item.quantity - 1)}
                                >
                                  <Minus size={16} />
                                </Button>
                                <span className="px-3 py-1 bg-gray-100 rounded font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityUpdate(item.plot.id, item.quantity + 1)}
                                >
                                  <Plus size={16} />
                                </Button>
                              </div>
                              <p className="font-bold text-lg">
                                ₦{(item.plot.pricePerPlot * item.quantity).toLocaleString()}
                              </p>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeFromCart(item.plot.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getTotalItems()} items):</span>
                    <span className="font-semibold">₦{getTotalAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing Fee (2%):</span>
                    <span>₦{(getTotalAmount() * 0.02).toLocaleString()}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-estate-red">
                    ₦{(getTotalAmount() * 1.02).toLocaleString()}
                  </span>
                </div>
                <Button 
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white py-3 text-lg"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainCartContent;
