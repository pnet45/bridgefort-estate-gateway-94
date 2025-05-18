import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
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
              `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              <span className="font-bold">Home</span>
            </NavLink>
            <NavLink to="/about" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              <span className="font-bold">About</span>
            </NavLink>
            <NavLink to="/blog" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              <span className="font-bold">Blog</span>
            </NavLink>
            <NavLink to="/contact" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              <span className="font-bold">Contact</span>
            </NavLink>
            <NavLink to="/properties" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              <span className="font-bold">Properties</span>
            </NavLink>
            <NavLink to="/services" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              <span className="font-bold">Services</span>
            </NavLink>
            <NavLink to="/buy2sell" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              <span className="font-bold">Buy2Sell</span>
            </NavLink>
            <NavLink to="/training" className={({isActive}) => 
              `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'}`
            }>
              <span className="font-bold">Training</span>
            </NavLink>
            
            <div className="flex items-center text-estate-blue">
              <Phone size={18} className="mr-1" />
              <span className="font-bold">+234 803 062 4059</span>
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
            <div className="flex items-center text-blue-500 mr-4">
              <Phone size={16} className="mr-1" />
              <span className="text-sm font-bold">+234 803 062 4059</span>
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
            <NavLink to="/" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              <span className="font-bold">Home</span>
            </NavLink>
            <NavLink to="/about" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              <span className="font-bold">About</span>
            </NavLink>
            <NavLink to="/blog" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              <span className="font-bold">Blog</span>
            </NavLink>
            <NavLink to="/contact" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              <span className="font-bold">Contact</span>
            </NavLink>
            <NavLink to="/properties" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              <span className="font-bold">Properties</span>
            </NavLink>
            <NavLink to="/services" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              <span className="font-bold">Services</span>
            </NavLink>
            <NavLink to="/buy2sell" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              <span className="font-bold">Buy2Sell</span>
            </NavLink>
            <NavLink to="/training" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              <span className="font-bold">Training</span>
            </NavLink>
            {shouldShowLogin && (
              user ? (
                <>
                  <NavLink to="/dashboard" className={({isActive}) => `${isActive ? 'text-estate-blue font-bold bg-blue-100 px-3 py-2 rounded-md' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
                    <span className="font-bold">Dashboard</span>
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
