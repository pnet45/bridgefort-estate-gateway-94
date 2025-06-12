
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Plot, Customer, PaymentInfo, Order, EcommerceContextType } from './types';
import { toast } from '@/hooks/use-toast';

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

export const EcommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.plot.id === plot.id);
      
      if (existingItem) {
        // Update quantity of existing item
        return prevCart.map(item =>
          item.plot.id === plot.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevCart, { plot, quantity }];
      }
    });

    toast({
      title: "Added to Cart",
      description: `${quantity} plot(s) of ${plot.propertyName} added to cart`,
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
