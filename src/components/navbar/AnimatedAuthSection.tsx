
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import NavbarUserMenu from './NavbarUserMenu';
// import NavbarLoginIcon from './NavbarLoginIcon'; // Removed
import CartIcon from '../ecommerce/CartIcon';

interface AnimatedAuthSectionProps {
  user: any;
  profile: any;
  userRole: string;
  shouldShowLogin: boolean;
}

const AnimatedAuthSection = ({ user, profile, userRole, shouldShowLogin }: AnimatedAuthSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="hidden lg:flex items-center space-x-4">
      <div 
        className="animate-fade-in"
        style={{
          animationDelay: '1.5s',
          opacity: 0,
          animation: 'slideInRight 0.6s ease-out 1.5s forwards'
        }}
      >
        <CartIcon />
      </div>
      {user ? (
        <div 
          className="animate-fade-in"
          style={{
            animationDelay: '1.7s',
            opacity: 0,
            animation: 'slideInRight 0.6s ease-out 1.7s forwards'
          }}
        >
          <NavbarUserMenu profile={profile} userRole={userRole} />
        </div>
      ) : shouldShowLogin ? (
        <>
          {/* Removed inline NavbarLoginIcon and will use FloatingLoginButton globally */}
          <div 
            className="animate-fade-in"
            style={{
              animationDelay: '1.8s',
              opacity: 0,
              animation: 'slideInRight 0.6s ease-out 1.8s forwards'
            }}
          >
            <Button onClick={() => navigate('/auth')} className="gradient-brand hover:opacity-90 text-white transition-opacity">
              Sign In
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AnimatedAuthSection;

