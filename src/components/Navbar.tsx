import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
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

interface NavProps {
  isDark?: boolean;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
  
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container-custom mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/pbo.png" 
                alt="PWAN Bridgefort" 
                className={`h-12 md:h-16 transition-all duration-300 ${scrolled ? 'h-10 md:h-14' : 'h-12 md:h-16'}`}
              />
            </Link>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'text-estate-blue font-semibold' : 'hover:text-estate-blue'}`}>
              Home
            </NavLink>
            <NavLink to="/about" className={({isActive}) => `nav-link ${isActive ? 'text-estate-blue font-semibold' : 'hover:text-estate-blue'}`}>
              About
            </NavLink>
            <NavLink to="/properties" className={({isActive}) => `nav-link ${isActive ? 'text-estate-blue font-semibold' : 'hover:text-estate-blue'}`}>
              Properties
            </NavLink>
            <NavLink to="/services" className={({isActive}) => `nav-link ${isActive ? 'text-estate-blue font-semibold' : 'hover:text-estate-blue'}`}>
              Services
            </NavLink>
            <NavLink to="/buy2sell" className={({isActive}) => `nav-link ${isActive ? 'text-estate-blue font-semibold' : 'hover:text-estate-blue'}`}>
              Buy2Sell
            </NavLink>
            <NavLink to="/training" className={({isActive}) => `nav-link ${isActive ? 'text-estate-blue font-semibold' : 'hover:text-estate-blue'}`}>
              Training
            </NavLink>
            <NavLink to="/blog" className={({isActive}) => `nav-link ${isActive ? 'text-estate-blue font-semibold' : 'hover:text-estate-blue'}`}>
              Blog
            </NavLink>
            <NavLink to="/contact" className={({isActive}) => `nav-link ${isActive ? 'text-estate-blue font-semibold' : 'hover:text-estate-blue'}`}>
              Contact
            </NavLink>
            
            {user ? (
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
            )}
          </div>
          
          <div className="lg:hidden flex items-center">
            {user && (
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
            <NavLink to="/" className={({isActive}) => `${isActive ? 'text-estate-blue font-semibold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Home
            </NavLink>
            <NavLink to="/about" className={({isActive}) => `${isActive ? 'text-estate-blue font-semibold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              About
            </NavLink>
            <NavLink to="/properties" className={({isActive}) => `${isActive ? 'text-estate-blue font-semibold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Properties
            </NavLink>
            <NavLink to="/services" className={({isActive}) => `${isActive ? 'text-estate-blue font-semibold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Services
            </NavLink>
            <NavLink to="/buy2sell" className={({isActive}) => `${isActive ? 'text-estate-blue font-semibold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Buy2Sell
            </NavLink>
            <NavLink to="/training" className={({isActive}) => `${isActive ? 'text-estate-blue font-semibold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Training
            </NavLink>
            <NavLink to="/blog" className={({isActive}) => `${isActive ? 'text-estate-blue font-semibold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Blog
            </NavLink>
            <NavLink to="/contact" className={({isActive}) => `${isActive ? 'text-estate-blue font-semibold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
              Contact
            </NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard" className={({isActive}) => `${isActive ? 'text-estate-blue font-semibold' : 'text-gray-800'} py-2`} onClick={toggleMenu}>
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
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
