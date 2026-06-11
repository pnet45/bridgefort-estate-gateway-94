
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEcommerce } from '@/contexts/ecommerce';

const CartIcon: React.FC = () => {
  const { getTotalItems, setIsCartOpen } = useEcommerce();
  const itemCount = getTotalItems();

  return (
    <Button
      variant="outline"
      size="sm"
      className="relative hover:scale-105 transition-transform duration-300 hover:animate-bounce-zoom"
      onClick={() => setIsCartOpen(true)}
    >
      <ShoppingCart size={20} />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-estate-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
    </Button>
  );
};

export default CartIcon;
