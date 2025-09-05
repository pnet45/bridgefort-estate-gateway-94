
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
  LogOut,
  LogIn,
  Landmark,
  GraduationCap
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
    { name: 'Estate Lands', icon: <Building size={20} />, path: '/properties/estates' },
    { name: 'Homes Sales', icon: <Home size={20} />, path: '/homes-sales' },
    { name: 'Apartments for Rent', icon: <Building size={20} />, path: '/properties/apartments' },
    { name: 'Services', icon: <Briefcase size={20} />, path: '/services' },
    { name: 'Training', icon: <GraduationCap size={20} />, path: '/training' },
    { name: 'Buy and Resell', icon: <Landmark size={20} />, path: '/buy2sell' },
    { name: 'Blog', icon: <BookOpen size={20} />, path: '/blog' },
    { name: 'Contact', icon: <Phone size={20} />, path: '/contact' },
  ];
  
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white shadow-lg z-50 py-4 overflow-hidden animate-fade-in lg:hidden">
      <div className="mb-4 px-4">
        <CartIcon />
      </div>
      
      <nav className="flex flex-col">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center px-4 py-3 hover:bg-gray-100"
            onClick={toggleMenu}
          >
            <span className="mr-3 text-gray-500">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}

        <div className="border-t mt-2 pt-2 px-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center py-3 hover:text-estate-blue"
                onClick={toggleMenu}
              >
                <User size={20} className="mr-3 text-gray-500" />
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
              className="w-full bg-estate-blue hover:bg-estate-darkBlue"
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
