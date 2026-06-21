
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
  GraduationCap,
  Users,
  Plane
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
    { name: 'Travels', icon: <Plane size={20} />, path: '/travels' },
    { name: 'Blog', icon: <BookOpen size={20} />, path: '/blog' },
    { name: 'MLM', icon: <Users size={20} />, path: '/mlm' },
    { name: 'Bridgefort Realtors', icon: <Users size={20} />, path: '/bridgefort-realtors-login' },
    { name: 'Contact', icon: <Phone size={20} />, path: '/contact' },
  ];
  
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl z-50 py-4 overflow-hidden animate-fade-in lg:hidden border-t border-gray-100 max-h-[85vh] overflow-y-auto">
      <div className="mb-4 px-4">
        <CartIcon />
      </div>
      
      <nav className="flex flex-col">
        {menuItems.map((item, idx) => (
          <Link
            key={item.name}
            to={item.path}
            className="group flex items-center px-4 py-3 hover:bg-estate-blue/10 hover:pl-6 transition-all duration-300 border-l-2 border-transparent hover:border-estate-blue"
            onClick={toggleMenu}
            style={{
              opacity: 0,
              animation: `slideInRight 0.35s ease-out ${idx * 40}ms forwards`,
            }}
          >
            <span className="mr-3 text-gray-500 group-hover:text-estate-blue group-hover:scale-110 transition-all duration-300">{item.icon}</span>
            <span className="font-medium group-hover:text-estate-blue transition-colors">{item.name}</span>
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
