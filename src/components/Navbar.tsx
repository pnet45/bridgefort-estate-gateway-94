
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
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
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-gray-700 hover:text-estate-blue font-medium transition duration-200 py-2 px-3 rounded ${
                isActive('/') ? 'bg-gray-100 text-estate-blue' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className={`text-gray-700 hover:text-estate-blue font-medium transition duration-200 py-2 px-3 rounded ${
                isActive('/properties') ? 'bg-gray-100 text-estate-blue' : ''
              }`}
            >
              Properties
            </Link>
            <Link 
              to="/services" 
              className={`text-gray-700 hover:text-estate-blue font-medium transition duration-200 py-2 px-3 rounded ${
                isActive('/services') ? 'bg-gray-100 text-estate-blue' : ''
              }`}
            >
              Services
            </Link>
            <Link 
              to="/buy2sell" 
              className={`text-gray-700 hover:text-estate-blue font-medium transition duration-200 py-2 px-3 rounded ${
                isActive('/buy2sell') ? 'bg-gray-100 text-estate-blue' : ''
              }`}
            >
              Buy to Sell
            </Link>
            <Link 
              to="/training" 
              className={`text-gray-700 hover:text-estate-blue font-medium transition duration-200 py-2 px-3 rounded ${
                isActive('/training') ? 'bg-gray-100 text-estate-blue' : ''
              }`}
            >
              Training
            </Link>
            <Link 
              to="/about" 
              className={`text-gray-700 hover:text-estate-blue font-medium transition duration-200 py-2 px-3 rounded ${
                isActive('/about') ? 'bg-gray-100 text-estate-blue' : ''
              }`}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={`text-gray-700 hover:text-estate-blue font-medium transition duration-200 py-2 px-3 rounded ${
                isActive('/contact') ? 'bg-gray-100 text-estate-blue' : ''
              }`}
            >
              Contact
            </Link>
            <Link 
              to="/blog" 
              className={`text-gray-700 hover:text-estate-blue font-medium transition duration-200 py-2 px-3 rounded ${
                isActive('/blog') ? 'bg-gray-100 text-estate-blue' : ''
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* CTA Button - Modified phone display */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:+2348030624059" className="flex items-center text-estate-blue font-medium whitespace-nowrap">
              <Phone size={18} className="mr-2" />
              <span>+2348030624059</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`text-gray-700 hover:text-estate-blue font-medium py-2 px-3 rounded ${
                  isActive('/') ? 'bg-gray-100 text-estate-blue' : ''
                }`}
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link 
                to="/properties" 
                className={`text-gray-700 hover:text-estate-blue font-medium py-2 px-3 rounded ${
                  isActive('/properties') ? 'bg-gray-100 text-estate-blue' : ''
                }`}
                onClick={toggleMenu}
              >
                Properties
              </Link>
              <Link 
                to="/services" 
                className={`text-gray-700 hover:text-estate-blue font-medium py-2 px-3 rounded ${
                  isActive('/services') ? 'bg-gray-100 text-estate-blue' : ''
                }`}
                onClick={toggleMenu}
              >
                Services
              </Link>
              <Link 
                to="/buy2sell" 
                className={`text-gray-700 hover:text-estate-blue font-medium py-2 px-3 rounded ${
                  isActive('/buy2sell') ? 'bg-gray-100 text-estate-blue' : ''
                }`}
                onClick={toggleMenu}
              >
                Buy to Sell
              </Link>
              <Link 
                to="/training" 
                className={`text-gray-700 hover:text-estate-blue font-medium py-2 px-3 rounded ${
                  isActive('/training') ? 'bg-gray-100 text-estate-blue' : ''
                }`}
                onClick={toggleMenu}
              >
                Training
              </Link>
              <Link 
                to="/about" 
                className={`text-gray-700 hover:text-estate-blue font-medium py-2 px-3 rounded ${
                  isActive('/about') ? 'bg-gray-100 text-estate-blue' : ''
                }`}
                onClick={toggleMenu}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className={`text-gray-700 hover:text-estate-blue font-medium py-2 px-3 rounded ${
                  isActive('/contact') ? 'bg-gray-100 text-estate-blue' : ''
                }`}
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <Link 
                to="/blog" 
                className={`text-gray-700 hover:text-estate-blue font-medium py-2 px-3 rounded ${
                  isActive('/blog') ? 'bg-gray-100 text-estate-blue' : ''
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
