import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MobileMenu from './navbar/MobileMenu';
import NavbarUserMenu from './navbar/NavbarUserMenu';
import NavbarLoginIcon from './navbar/NavbarLoginIcon';
import LogoSlideIn from './navbar/LogoSlideIn';
import CartIcon from './ecommerce/CartIcon';
import AnimatedNavLinks from './navbar/AnimatedNavLinks';
import AnimatedAuthSection from './navbar/AnimatedAuthSection';
import ProfileCompletionWidget from './navbar/ProfileCompletionWidget';

const Navbar = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Control when to show login button (not on auth page)
  const shouldShowLogin = !window.location.pathname.includes('/auth');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <nav className={`fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-300 backdrop-blur-lg ${scrolled ? 'bg-white/90 shadow-md' : 'bg-white/40'}`} style={{ minHeight: 80 }}>
        <div className="container-custom flex flex-col flex-1" style={{ minHeight: 80 }}>
          <div className="flex justify-between items-center py-3 flex-shrink-0 relative">
            {/* Mobile: Empty spacer for left side to balance the menu icon */}
            <div className="lg:hidden w-8" />
            
            {/* Logo - centered on mobile, left on desktop */}
            <div className="lg:absolute lg:relative lg:left-0 flex-1 lg:flex-none flex justify-center lg:justify-start">
              <LogoSlideIn />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <AnimatedNavLinks className="hover:text-estate-blue transition" />
            </div>
            
            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {user && <ProfileCompletionWidget />}
              <AnimatedAuthSection 
                user={user}
                profile={profile}
                userRole={userRole}
                shouldShowLogin={shouldShowLogin}
              />
            </div>
            
            {/* Mobile Menu Button - aligned right */}
            <button
              className="lg:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {/* Flex grow pushes .phone-contact to bottom */}
        </div>

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMenuOpen} 
          toggleMenu={toggleMenu}
          shouldShowLogin={shouldShowLogin}
        />
      </nav>
    </>
  );
};

export default Navbar;
