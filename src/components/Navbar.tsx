
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NavLinks from './navbar/NavLinks';
import NavbarUserMenu from './navbar/NavbarUserMenu';
import MobileMenu from './navbar/MobileMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getInitials = () => {
    if (!profile) return 'U';
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
  };
  
  // Only show login button on blog page
  const shouldShowLogin = location.pathname.includes('/blog') && !user;
  
  return (
    <nav className="fixed w-full z-50 bg-white shadow-md py-2 animate-fade-in">
      <div className="container-custom mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/c38e476b-49df-4b14-a2e9-d78048192d53.png" 
                alt="PWAN Bridgefort" 
                className="h-12 md:h-16 hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            <NavLinks />

            <div className="hidden md:flex items-center ml-4">
              <a href="tel:+2348030624059" className="flex items-center text-red font-bold whitespace-nowrap hover:text-red transition duration-200 hover:scale-105">
                <Phone size={18} className="mr-2 text-blue-500"/>
                <span>+2348030624059</span>
              </a>
            </div>
            
            {user ? (
              <NavbarUserMenu profile={profile} userRole={userRole} />
            ) : shouldShowLogin && (
              <Button onClick={() => navigate('/auth')} variant="default" className="bg-estate-blue hover:bg-estate-darkBlue hover:scale-105 transition-all duration-300">
                Sign In
              </Button>
            )}
          </div>
          
          <div className="lg:hidden flex items-center">
            <div className="flex items-center text-blue-500 mr-4">
              <Phone size={16} className="mr-1" />
              <span className="text-sm font-bold">+234 803 062 4059</span>
            </div>
            
            {user && (
              <Button variant="ghost" className="mr-2 hover:scale-105 transition-transform duration-300" onClick={() => navigate('/dashboard')}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-estate-blue text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            )}
            <button onClick={toggleMenu} className="text-gray-800 focus:outline-none hover:scale-110 transition-transform duration-300">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isOpen} 
        toggleMenu={toggleMenu} 
        shouldShowLogin={shouldShowLogin} 
      />
    </nav>
  );
};

export default Navbar;
