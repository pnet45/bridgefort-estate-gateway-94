import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
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
    <nav className="glass-strong fixed top-0 left-0 right-0 z-50 h-[88px] lg:h-[150px] border-b border-estate-purple/10 transition-all duration-300">
      <div className="container-custom h-full min-w-0">
        <div className="flex h-full min-w-0 items-center justify-between gap-3 lg:grid lg:grid-cols-[minmax(160px,auto)_minmax(0,1fr)_minmax(190px,auto)] lg:gap-4">
          {/* Brand stays on the left; the desktop navbar remains a single row. */}
          <div className="flex min-w-0 shrink items-center">
            <LogoSlideIn />
          </div>

          {/* Keep navigation in the middle column; allow horizontal overflow rather than overlap. */}
          <div className="hidden min-w-0 items-center justify-center overflow-x-auto lg:flex">
            <div className="flex min-w-max items-center justify-center gap-x-1 xl:gap-x-2 2xl:gap-x-3">
              <AnimatedNavLinks className="!px-2 !py-2 text-sm xl:text-base whitespace-nowrap" />
            </div>
          </div>

          {/* Login/profile, theme toggle and profile completion stay grouped on the right. */}
          <div className="hidden min-w-0 grid-flow-col auto-cols-max items-center justify-end gap-2 lg:grid">
            <DarkModeToggle />
            {user && <ProfileCompletionWidget />}
            <AnimatedAuthSection
              user={user}
              profile={profile}
              userRole={userRole}
              shouldShowLogin={shouldShowLogin}
            />
          </div>

          {/* Mobile stays a single row with controls aligned right. */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <DarkModeToggle />
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="rounded-md p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-blue"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
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
