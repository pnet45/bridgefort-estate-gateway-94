
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MobileMenu from './navbar/MobileMenu';
import NavLinks from './navbar/NavLinks';
import NavbarUserMenu from './navbar/NavbarUserMenu';
import NavbarLoginIcon from './navbar/NavbarLoginIcon';
import LogoSlideIn from './navbar/LogoSlideIn';
import CartIcon from './ecommerce/CartIcon';

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
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo with slide-in animation */}
          <LogoSlideIn />
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavLinks className="hover:text-estate-blue transition" />
          </div>
          
          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <CartIcon />
                <NavbarUserMenu profile={profile} userRole={userRole} />
              </>
            ) : shouldShowLogin ? (
              <>
                <NavbarLoginIcon />
                <Button onClick={() => navigate('/auth')} className="bg-estate-blue hover:bg-estate-darkBlue">
                  Sign In
                </Button>
              </>
            ) : null}
          </div>
          
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
  );
};

export default Navbar;
