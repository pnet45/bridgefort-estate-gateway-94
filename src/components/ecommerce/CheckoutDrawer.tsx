
import React from 'react';

interface CheckoutDrawerProps {
  onBack: () => void;
  children: React.ReactNode;
}

const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({ onBack, children }) => (
  <div className="fixed inset-0 z-50 flex">
    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onBack} />
    <div className="ml-auto w-full max-w-2xl bg-white h-full shadow-xl overflow-hidden animate-slide-in-right">
      {children}
    </div>
  </div>
);

export default CheckoutDrawer;
