import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MobileMenu from './navbar/MobileMenu';
import LogoSlideIn from './navbar/LogoSlideIn';
import AnimatedNavLinks from './navbar/AnimatedNavLinks';
import AnimatedAuthSection from './navbar/AnimatedAuthSection';
import ProfileCompletionWidget from './navbar/ProfileCompletionWidget';
import DarkModeToggle from './navbar/DarkModeToggle';
import { onProfileUpdated } from '@/lib/profileEvents';

const Navbar = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const authPaths = ['/auth', '/bridgefort-realtors-login'];
  const shouldShowLogin = !authPaths.some((path) => window.location.pathname.includes(path));

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  useEffect(() => onProfileUpdated(() => {
    if (user) fetchProfile();
  }), [user]);

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

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <nav className="glass-strong fixed top-0 left-0 right-0 z-50 flex flex-col h-[88px] lg:h-[104px] border-b border-estate-purple/10 transition-all duration-300">
      <div className="container-custom flex flex-col flex-1 min-h-0">
        {/* First row: brand/title sits above the desktop navigation. */}
        <div className="flex items-center justify-between relative h-full lg:h-[60px] shrink-0 py-2">
          <div className="flex items-center min-w-0">
            <LogoSlideIn />
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <DarkModeToggle />
            {user && <ProfileCompletionWidget />}
            <AnimatedAuthSection
              user={user}
              profile={profile}
              userRole={userRole}
              shouldShowLogin={shouldShowLogin}
            />
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <DarkModeToggle />
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="text-foreground rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-blue"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Desktop navigation begins beneath the Bridgefort Homes title. */}
        <div className="hidden lg:flex flex-1 min-h-[44px] items-center justify-center border-t border-estate-purple/10">
          <div className="flex w-full items-center justify-center gap-x-0.5 xl:gap-x-1 2xl:gap-x-2">
            <AnimatedNavLinks className="!px-2 !py-1.5 text-xs xl:text-sm" />
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        shouldShowLogin={shouldShowLogin}
      />
    </nav>
  );
};

export default Navbar;
