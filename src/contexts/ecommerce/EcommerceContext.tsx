import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CartItem, Plot, Customer, PaymentInfo, Order, EcommerceContextType } from './types';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

export const EcommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Preserve a BMC referral code across navigation so Homes and Agrovest
  // property cards can attach it to checkout even after the query string changes.
  useEffect(() => {
    const code = new URLSearchParams(location.search).get('bmc_ref')?.trim().toUpperCase();
    if (code) {
      try { window.sessionStorage.setItem('bridgefort:bmc-referral-code', code); } catch { /* session storage may be unavailable */ }
    }
  }, [location.search]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pwan_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('pwan_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (plot: Plot, quantity: number = 1) => {
    let inheritedBmcCode = '';
    try { inheritedBmcCode = window.sessionStorage.getItem('bridgefort:bmc-referral-code') || ''; } catch { /* optional attribution enhancement */ }
    const attributedPlot = plot.bmcReferralCode ? plot : (inheritedBmcCode ? { ...plot, bmcReferralCode: inheritedBmcCode } : plot);
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.plot.id === attributedPlot.id);
      
      if (existingItem) {
        // Update quantity of existing item
        return prevCart.map(item =>
          item.plot.id === attributedPlot.id
            ? { ...item, plot: { ...item.plot, bmcReferralCode: attributedPlot.bmcReferralCode || item.plot.bmcReferralCode }, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevCart, { plot: attributedPlot, quantity }];
      }
    });

    toast({
      title: "Added to Cart",
      description: `${quantity} ${plot.unit || (plot.propertyName.toLowerCase().includes('aquaculture') ? 'pond' : plot.propertyName.toLowerCase().includes('livestock') ? 'pair' : 'plot')}${quantity === 1 ? '' : 's'} of ${plot.propertyName} added to cart`,
    });

    // Automatically open cart when adding items
    setIsCartOpen(true);
  };

  const removeFromCart = (plotId: string) => {
    setCart(prevCart => prevCart.filter(item => item.plot.id !== plotId));
    
    toast({
      title: "Removed from Cart",
      description: "Plot removed from cart",
    });
  };

  const updateQuantity = (plotId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(plotId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.plot.id === plotId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('pwan_cart');
    toast({
      title: "Cart Cleared",
      description: "All items removed from cart",
    });
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.plot.pricePerPlot * item.quantity), 0);
  };

  const checkout = async (customerInfo: Customer, paymentInfo: PaymentInfo): Promise<Order> => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Documentation payment records are now created server-side by the
    // create-checkout-order edge function (service role) with verified
    // pricing — clients can no longer insert them directly.

    const order: Order = {
      id: `ORDER-${Date.now()}`,
      customerId: customerInfo.email,
      items: [...cart],
      totalAmount: getTotalAmount(),
      status: 'completed',
      customerInfo,
      paymentInfo: {
        cardNumber: paymentInfo.cardNumber.slice(-4),
        cardName: paymentInfo.cardName
      },
      createdAt: new Date()
    };

    // Clear cart after successful checkout
    clearCart();
    setIsCartOpen(false);

    toast({
      title: "Order Successful!",
      description: `Order ${order.id} has been placed successfully`,
    });

    return order;
  };

  return (
    <EcommerceContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalAmount,
        isCartOpen,
        setIsCartOpen,
        checkout
      }}
    >
      {children}
    </EcommerceContext.Provider>
  );
};

export const useEcommerce = () => {
  const context = useContext(EcommerceContext);
  if (!context) {
    throw new Error('useEcommerce must be used within an EcommerceProvider');
  }
  return context;
};
