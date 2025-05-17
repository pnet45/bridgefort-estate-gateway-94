
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Increased size */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/c38e476b-49df-4b14-a2e9-d78048192d53.png" 
              alt="PWAN Bridgefort Logo" 
              className="h-16 w-auto" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold transition duration-200 py-2 px-3 rounded transform hover:scale-105 ${
                isActive('/') ? 'bg-estate-blue text-white' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold transition duration-200 py-2 px-3 rounded transform hover:scale-105 ${
                isActive('/properties') ? 'bg-estate-blue text-white' : ''
              }`}
            >
              Properties
            </Link>
            <Link 
              to="/services" 
              className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold transition duration-200 py-2 px-3 rounded transform hover:scale-105 ${
                isActive('/services') ? 'bg-estate-blue text-white' : ''
              }`}
            >
              Services
            </Link>
            <Link 
              to="/buy2sell" 
              className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold transition duration-200 py-2 px-3 rounded transform hover:scale-105 ${
                isActive('/buy2sell') ? 'bg-estate-blue text-white' : ''
              }`}
            >
              Buy to Sell
            </Link>
            <Link 
              to="/training" 
              className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold transition duration-200 py-2 px-3 rounded transform hover:scale-105 ${
                isActive('/training') ? 'bg-estate-blue text-white' : ''
              }`}
            >
              Training
            </Link>
            <Link 
              to="/about" 
              className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold transition duration-200 py-2 px-3 rounded transform hover:scale-105 ${
                isActive('/about') ? 'bg-estate-blue text-white' : ''
              }`}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold transition duration-200 py-2 px-3 rounded transform hover:scale-105 ${
                isActive('/contact') ? 'bg-estate-blue text-white' : ''
              }`}
            >
              Contact
            </Link>
            <Link 
              to="/blog" 
              className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold transition duration-200 py-2 px-3 rounded transform hover:scale-105 ${
                isActive('/blog') ? 'bg-estate-blue text-white' : ''
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* CTA Button - Updated color to Red */}
          <div className="hidden md:flex items-center ml-4">
            <a href="tel:+2348030624059" className="flex items-center text-[#ea384c] font-bold whitespace-nowrap hover:text-red-600 transition duration-200">
              <Phone size={18} className="mr-2" />
              <span>+2348030624059</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-estate-blue" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold py-2 px-3 rounded ${
                  isActive('/') ? 'bg-estate-blue text-white' : ''
                }`}
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link 
                to="/properties" 
                className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold py-2 px-3 rounded ${
                  isActive('/properties') ? 'bg-estate-blue text-white' : ''
                }`}
                onClick={toggleMenu}
              >
                Properties
              </Link>
              <Link 
                to="/services" 
                className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold py-2 px-3 rounded ${
                  isActive('/services') ? 'bg-estate-blue text-white' : ''
                }`}
                onClick={toggleMenu}
              >
                Services
              </Link>
              <Link 
                to="/buy2sell" 
                className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold py-2 px-3 rounded ${
                  isActive('/buy2sell') ? 'bg-estate-blue text-white' : ''
                }`}
                onClick={toggleMenu}
              >
                Buy to Sell
              </Link>
              <Link 
                to="/training" 
                className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold py-2 px-3 rounded ${
                  isActive('/training') ? 'bg-estate-blue text-white' : ''
                }`}
                onClick={toggleMenu}
              >
                Training
              </Link>
              <Link 
                to="/about" 
                className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold py-2 px-3 rounded ${
                  isActive('/about') ? 'bg-estate-blue text-white' : ''
                }`}
                onClick={toggleMenu}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold py-2 px-3 rounded ${
                  isActive('/contact') ? 'bg-estate-blue text-white' : ''
                }`}
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <Link 
                to="/blog" 
                className={`text-estate-blue hover:bg-estate-blue hover:text-white font-bold py-2 px-3 rounded ${
                  isActive('/blog') ? 'bg-estate-blue text-white' : ''
                }`}
                onClick={toggleMenu}
              >
                Blog
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
