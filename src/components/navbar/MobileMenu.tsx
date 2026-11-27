
import React, { useState } from 'react';
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
  PiggyBank,
  ChevronDown
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
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    toggleMenu();
    navigate('/');
  };
  
  const menuItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/' },
    { name: 'About Us', icon: <Info size={20} />, path: '/about' },
    { name: 'Gallery', icon: <ImageIcon size={20} />, path: '/gallery' },
    //{ name: 'Apartments for Rent', icon: <Building size={20} />, path: '/properties/apartments' },
    { name: 'Services', icon: <Briefcase size={20} />, path: '/services' },
    { name: 'Training', icon: <GraduationCap size={20} />, path: '/training' },
    { name: 'BMC Network', icon: <Users size={20} />, path: '/bmc' },
    { name: 'Agrovest', icon: <Sprout size={20} />, path: '/agrovest' },
    { name: '5K Daily Promo', icon: <PiggyBank size={20} />, path: '/5k-daily-promo' },
    { name: 'Travels', icon: <Plane size={20} />, path: '/travels' },
    { name: 'Blog', icon: <BookOpen size={20} />, path: '/blog' },
    { name: 'Contact', icon: <Phone size={20} />, path: '/contact' },
  ];
  
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-[hsl(240_13%_5%)] backdrop-blur-xl dark:backdrop-blur-none shadow-2xl z-50 py-4 overflow-hidden animate-fade-in lg:hidden border-t border-gray-100 dark:border-white/10 max-h-[85vh] overflow-y-auto">
      <div className="mb-4 px-4">
        <CartIcon />
      </div>
      
      <nav className="flex flex-col">
        {menuItems.map((item, idx) => (
          <React.Fragment key={item.name}>
          <Link
            to={item.path}
            className="group flex items-center px-4 py-3 hover:bg-estate-blue/10 hover:pl-6 transition-all duration-300 border-l-2 border-transparent hover:border-estate-blue dark:text-gray-300"
            onClick={toggleMenu}
            style={{
              opacity: 0,
              animation: `slideInRight 0.35s ease-out ${idx * 40}ms forwards`,
            }}
          >
            <span className="mr-3 text-gray-500 dark:text-gray-400 group-hover:text-estate-blue transition-all duration-300">{item.icon}</span>
            <span className="font-medium group-hover:text-estate-blue transition-colors">{item.name}</span>
          </Link>
          {item.name === 'About Us' && (
            <div className="border-l-2 border-transparent">
              <button
                type="button"
                aria-expanded={propertiesOpen}
                aria-controls="mobile-property-links"
                onClick={() => setPropertiesOpen((open) => !open)}
                className="group flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-estate-blue/10 dark:text-gray-300"
              >
                <span className="flex items-center">
                  <Building size={20} className="mr-3 text-gray-500 transition-colors group-hover:text-estate-blue dark:text-gray-400" />
                  <span className="font-medium group-hover:text-estate-blue">Properties</span>
                </span>
                <ChevronDown size={18} className={`transition-transform duration-200 ${propertiesOpen ? 'rotate-180' : ''}`} />
              </button>
              {propertiesOpen && (
                <div id="mobile-property-links" className="bg-estate-blue/5 py-1 dark:bg-white/5">
                  {[
                    { name: 'Estate Lands', path: '/properties/estates' },
                    { name: '5K Daily Promo', path: '/5k-daily-promo' },
                    { name: 'Homes Sales', path: '/homes-sales' },
                    { name: 'Apartments for Rent', path: '/properties/apartments' },
                  ].map((propertyItem) => (
                    <Link
                      key={propertyItem.path}
                      to={propertyItem.path}
                      onClick={toggleMenu}
                      className="block py-3 pl-14 pr-4 text-sm font-medium text-foreground transition-colors hover:bg-estate-blue/10 hover:text-estate-blue"
                    >
                      {propertyItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          </React.Fragment>
        ))}

        <div className="border-t dark:border-white/10 mt-2 pt-2 px-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center py-3 hover:text-estate-blue dark:text-gray-300"
                onClick={toggleMenu}
              >
                <User size={20} className="mr-3 text-gray-500 dark:text-gray-400" />
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
