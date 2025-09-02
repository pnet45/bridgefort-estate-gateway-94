
import React, { useState } from 'react';
import { useEcommerce } from '@/contexts/ecommerce';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckoutForm from './CheckoutForm';
import CartSidebarMenu from './CartSidebarMenu';
import CartDashboard from './CartDashboard';
import MainCartContent from './cart/MainCartContent';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalAmount, getTotalItems } = useEcommerce();
  const [activeTab, setActiveTab] = useState('cart');
  const [showCheckout, setShowCheckout] = useState(false);

  // For content in sidebar tabs
  const renderTabContent = () => {
    if (activeTab === "cart")
      return (
        <MainCartContent
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          getTotalAmount={getTotalAmount}
          getTotalItems={getTotalItems}
          setShowCheckout={setShowCheckout}
        />
      );
    
    // Use CartDashboard for all other tabs
    return <CartDashboard tabType={activeTab} />;
  };

  if (showCheckout) {
    return <CheckoutForm onBack={() => setShowCheckout(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        <div className="container-custom py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64">
              <CartSidebarMenu activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            {/* Main Content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
