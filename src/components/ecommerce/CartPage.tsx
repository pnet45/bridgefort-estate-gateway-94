
import React, { useState } from 'react';
import { useEcommerce } from '@/contexts/ecommerce';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckoutForm from './CheckoutForm';
import CartSidebarMenu from './CartSidebarMenu';
import CartPlaceholderContent from './CartPlaceholderContent';
import MainCartContent from './cart/MainCartContent';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalAmount, getTotalItems } = useEcommerce();
  const [activeTab, setActiveTab] = useState('cart');
  const [showCheckout, setShowCheckout] = useState(false);

  // For placeholder content in sidebar tabs
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
    if (activeTab === "dashboard") return <CartPlaceholderContent title="Dashboard" />;
    if (activeTab === "properties") return <CartPlaceholderContent title="My Properties" />;
    if (activeTab === "documents") return <CartPlaceholderContent title="My Documents" />;
    if (activeTab === "inspections") return <CartPlaceholderContent title="Property Inspections" />;
    if (activeTab === "payments") return <CartPlaceholderContent title="My Payments" />;
    if (activeTab === "installments") return <CartPlaceholderContent title="My Installments" />;
    return null;
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
