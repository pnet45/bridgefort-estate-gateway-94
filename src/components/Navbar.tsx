
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import MobileMenu from './navbar/MobileMenu';
import NavbarUserMenu from './navbar/NavbarUserMenu';
import NavbarLoginIcon from './navbar/NavbarLoginIcon';
import LogoSlideIn from './navbar/LogoSlideIn';
import CartIcon from './ecommerce/CartIcon';
import AnimatedNavLinks from './navbar/AnimatedNavLinks';
import AnimatedAuthSection from './navbar/AnimatedAuthSection';

const Navbar = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Control when to show login button (not on auth page)
  const shouldShowLogin = !window.location.pathname.includes('/auth');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            {/* Logo with slide-in animation */}
            <LogoSlideIn />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <AnimatedNavLinks className="hover:text-estate-blue transition" />
            </div>
            
            {/* Desktop Auth Section */}
            <AnimatedAuthSection 
              user={user}
              profile={profile}
              userRole={userRole}
              shouldShowLogin={shouldShowLogin}
            />
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMenuOpen} 
          toggleMenu={toggleMenu}
          shouldShowLogin={shouldShowLogin}
        />
      </nav>
      
<div className="mt-auto md:block bg-estate-blue text-white px-4 py-2 rounded-lg shadow-lg"> {/* Remove animate-slide-in-right if it only makes sense for fixed pos */}
        <a href="tel:+2348030624059" className="text-sm font-medium hover:text-gray-200 transition-colors flex items-center gap-2">
          {/* Assuming Phone is an icon component */}
          <Phone size={18} /> 
          +234 803 062 4059
        </a>
      </div>


      {/* Sticky Phone Number - Desktop *
      <div className="fixed top-20 right-4 z-40 bg-estate-blue text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in-right hidden md:block">
        <a href="tel:+2348030624059" className="text-sm font-medium hover:text-gray-200 transition-colors flex items-center gap-2">
          <Phone size={18} />
          +234 803 062 4059
        </a>
      </div>*/}

      {/* Sticky Phone Number - Mobile (Phone icon only) */}
      <div className="fixed top-20 right-4 z-40 bg-estate-blue text-white p-3 rounded-full shadow-lg animate-slide-in-right md:hidden">
        <a href="tel:+2348030624059" className="hover:text-gray-200 transition-colors">
          <Phone size={20} />
        </a>
      </div>
    </>
  );
};

export default Navbar;
