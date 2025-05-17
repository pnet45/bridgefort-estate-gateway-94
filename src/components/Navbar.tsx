
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronDown, User, LogOut, Phone } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (!profile) return 'U';
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
  };

  const getUserName = () => {
    if (!profile) return 'User';
    return `${profile.first_name} ${profile.last_name}`;
  };
  
  // Check if we should show login button (only on blog page)
  const shouldShowLogin = location.pathname.includes('/blog');
  
  return (
    <nav className="fixed w-full z-50 bg-white shadow-md py-2">
      <div className="container-custom mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/c38e476b-49df-4b14-a2e9-d78048192d53.png" 
                alt="PWAN Bridgefort" 
                className="h-12 md:h-16"
              />
            </Link>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            <NavLink to="/" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              Home
            </NavLink>
            <NavLink to="/about" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              About
            </NavLink>
            <NavLink to="/blog" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              Blog
            </NavLink>
            <NavLink to="/contact" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              Contact
            </NavLink>
            <NavLink to="/properties" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              Properties
            </NavLink>
            <NavLink to="/services" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              Services
            </NavLink>
            <NavLink to="/buy2sell" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              Buy2Sell
            </NavLink>
            <NavLink to="/training" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              Training
            </NavLink>
            
            <div className="flex items-center text-estate-blue">
              <Phone size={18} className="mr-1" />
              <span className="font-bold">+234 703 123 4567</span>
            </div>
            
            {shouldShowLogin && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-estate-blue text-white">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{getUserName()}</span>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      {getUserName()}
                      {userRole && <p className="text-xs text-gray-500 capitalize">{userRole}</p>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User size={16} className="mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate('/auth')} variant="default" className="bg-estate-blue hover:bg-estate-darkBlue">
                  Sign In
                </Button>
              )
            )}
          </div>
          
          <div className="lg:hidden flex items-center">
            <div className="flex items-center text-estate-blue mr-4">
              <Phone size={16} className="mr-1" />
              <span className="text-sm font-bold">+234 703 123 4567</span>
            </div>
            
            {shouldShowLogin && user && (
              <Button variant="ghost" className="mr-2" onClick={() => navigate('/dashboard')}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-estate-blue text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            )}
            <button onClick={toggleMenu} className="text-gray-800 focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="lg:hidden bg-white shadow-lg py-4 px-4 absolute w-full">
          <div className="flex flex-col space-y-3">
            <NavLink to="/" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Home
            </NavLink>
            <NavLink to="/about" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              About
            </NavLink>
            <NavLink to="/blog" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Blog
            </NavLink>
            <NavLink to="/contact" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Contact
            </NavLink>
            <NavLink to="/properties" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Properties
            </NavLink>
            <NavLink to="/services" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Services
            </NavLink>
            <NavLink to="/buy2sell" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Buy2Sell
            </NavLink>
            <NavLink to="/training" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Training
            </NavLink>
            {shouldShowLogin && (
              user ? (
                <>
                  <NavLink to="/dashboard" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
                    Dashboard
                  </NavLink>
                  <Button variant="ghost" className="justify-start px-2" onClick={() => { handleSignOut(); toggleMenu(); }}>
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button onClick={() => { navigate('/auth'); toggleMenu(); }} className="bg-estate-blue hover:bg-estate-darkBlue w-full">
                  Sign In
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
