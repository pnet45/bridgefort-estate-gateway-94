
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home,
  Building,
  User,
  Info,
  Phone,
  BookOpen,
  Briefcase,
  Image as ImageIcon,
  LogOut,
  LogIn,
  Landmark,
  GraduationCap,
  Users,
  Plane,
  Sprout,
  PiggyBank
} from 'lucide-react';
import CartIcon from '../ecommerce/CartIcon';

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  shouldShowLogin: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, toggleMenu, shouldShowLogin }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    toggleMenu();
    navigate('/');
  };
  
  const menuItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/' },
    { name: 'About Us', icon: <Info size={20} />, path: '/about' },
    { name: 'Gallery', icon: <ImageIcon size={20} />, path: '/gallery' },
    { name: 'Estate Lands', icon: <Building size={20} />, path: '/properties/estates' },
    //{ name: 'Homes Sales', icon: <Home size={20} />, path: '/homes-sales' },
    //{ name: 'Apartments for Rent', icon: <Building size={20} />, path: '/properties/apartments' },
    { name: 'Services', icon: <Briefcase size={20} />, path: '/services' },
    { name: 'Training', icon: <GraduationCap size={20} />, path: '/training' },
    { name: 'Agrovest', icon: <Sprout size={20} />, path: '/agrovest' },
    { name: '5K Daily Promo', icon: <PiggyBank size={20} />, path: '/5k-daily-promo' },
    { name: 'Travels', icon: <Plane size={20} />, path: '/travels' },
    { name: 'Blog', icon: <BookOpen size={20} />, path: '/blog' },
    { name: 'BHRealtors', icon: <Users size={20} />, path: '/bh-realtors' },
    { name: 'Contact', icon: <Phone size={20} />, path: '/contact' },
  ];
  
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-background/98 text-foreground shadow-2xl z-50 py-3 overflow-x-hidden animate-fade-in lg:hidden border-t border-border max-h-[calc(100dvh-88px)] overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mb-4 px-4">
        <CartIcon />
      </div>
      
      <nav className="flex flex-col">
        {menuItems.map((item, idx) => (
          <Link
            key={item.name}
            to={item.path}
            className="group flex min-h-12 items-center px-4 py-3 hover:bg-estate-gold/10 active:bg-estate-gold/15 transition-colors duration-200 border-l-2 border-transparent hover:border-estate-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-estate-gold"
            onClick={toggleMenu}
            style={{
              opacity: 0,
              animation: `slideInRight 0.35s ease-out ${idx * 40}ms forwards`,
            }}
          >
            <span className="mr-3 text-muted-foreground group-hover:text-estate-gold-readable transition-colors duration-200">{item.icon}</span>
            <span className="font-medium group-hover:text-estate-gold-readable transition-colors">{item.name}</span>
          </Link>
        ))}

        <div className="border-t dark:border-white/10 mt-2 pt-2 px-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex min-h-12 items-center rounded-lg px-2 py-3 hover:bg-estate-gold/10 hover:text-estate-gold-readable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-gold"
                onClick={toggleMenu}
              >
                <User size={20} className="mr-3 text-muted-foreground" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Button
                variant="destructive"
                className="w-full mt-2"
                onClick={handleSignOut}
              >
                <LogOut size={20} className="mr-2" />
                Sign Out
              </Button>
            </>
          ) : shouldShowLogin ? (
            <Button
              className="w-full min-h-12"
              onClick={() => {
                toggleMenu();
                navigate('/auth');
              }}
            >
              <LogIn size={20} className="mr-2" />
              Sign In
            </Button>
          ) : null}
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
