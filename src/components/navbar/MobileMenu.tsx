
import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavLinks from './NavLinks';

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  shouldShowLogin: boolean;
}

const MobileMenu = ({ isOpen, toggleMenu, shouldShowLogin }: MobileMenuProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toggleMenu();
  };

  if (!isOpen) return null;
  
  return (
    <div className="lg:hidden bg-white shadow-lg py-4 px-4 absolute w-full">
      <div className="flex flex-col space-y-3">
        <NavLinks 
          className="py-2"
          onClick={toggleMenu}
        />
        
        {user ? (
          <>
            <NavLink to="/dashboard" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              <span className="font-bold">Dashboard</span>
            </NavLink>
            <Button variant="ghost" className="justify-start px-2" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </>
        ) : shouldShowLogin && (
          <Button onClick={() => { navigate('/auth'); toggleMenu(); }} className="bg-estate-blue hover:bg-estate-darkBlue w-full">
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
