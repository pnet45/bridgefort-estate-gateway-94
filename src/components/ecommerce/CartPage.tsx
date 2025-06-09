
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Home, 
  FileText, 
  Eye, 
  CreditCard, 
  Calendar,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { useEcommerce } from '@/contexts/ecommerce';
import CheckoutForm from './CheckoutForm';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalAmount, getTotalItems } = useEcommerce();
  const [activeTab, setActiveTab] = useState('cart');
  const [showCheckout, setShowCheckout] = useState(false);

  const menuItems = [
    { id: 'cart', label: 'Shopping Cart', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'My Properties', icon: Home },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'inspections', label: 'Property Inspections', icon: Eye },
    { id: 'payments', label: 'My Payments', icon: CreditCard },
    { id: 'installments', label: 'My Installments', icon: Calendar },
  ];

  const handleQuantityUpdate = (plotId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(plotId);
    } else {
      updateQuantity(plotId, newQuantity);
    }
  };

  const renderCartContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-estate-blue">Shopping Cart</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {getTotalItems()} items
        </Badge>
      </div>

      {cart.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Add some properties to get started</p>
            <Button onClick={() => window.history.back()}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.plot.id} className="overflow-hidden">
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

          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Subtotal ({getTotalItems()} items):</span>
                  <span className="font-semibold">₦{getTotalAmount().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Processing Fee:</span>
                  <span>₦{(getTotalAmount() * 0.02).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
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
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderPlaceholderContent = (title: string) => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-estate-blue">{title}</h1>
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-gray-600">This feature is under development</p>
        </CardContent>
      </Card>
    </div>
  );

  if (showCheckout) {
    return <CheckoutForm onBack={() => setShowCheckout(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg text-estate-blue">Account Menu</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                          activeTab === item.id ? 'bg-estate-blue text-white hover:bg-estate-darkBlue' : 'text-gray-700'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'cart' && renderCartContent()}
            {activeTab === 'dashboard' && renderPlaceholderContent('Dashboard')}
            {activeTab === 'properties' && renderPlaceholderContent('My Properties')}
            {activeTab === 'documents' && renderPlaceholderContent('My Documents')}
            {activeTab === 'inspections' && renderPlaceholderContent('Property Inspections')}
            {activeTab === 'payments' && renderPlaceholderContent('My Payments')}
            {activeTab === 'installments' && renderPlaceholderContent('My Installments')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
