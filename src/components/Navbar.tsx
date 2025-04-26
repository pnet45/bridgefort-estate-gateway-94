import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/c38e476b-49df-4b14-a2e9-d78048192d53.png" 
              alt="PWAN Bridgefort Logo" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-estate-blue font-medium transition duration-200">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-estate-blue font-medium transition duration-200">About Us</Link>
            <Link to="/properties" className="text-gray-700 hover:text-estate-blue font-medium transition duration-200">Properties</Link>
            <Link to="/services" className="text-gray-700 hover:text-estate-blue font-medium transition duration-200">Investment Services</Link>
            <Link to="/contact" className="text-gray-700 hover:text-estate-blue font-medium transition duration-200">Contact</Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:+2348012345678" className="flex items-center text-estate-blue font-medium">
              <Phone size={18} className="mr-2" />
              <span>+234 801 234 5678</span>
            </a>
            <Link to="/contact" className="bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition duration-300">
              Send us a Message
            </Link>
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
              <Link to="/" className="text-gray-700 hover:text-estate-blue font-medium py-2" onClick={toggleMenu}>Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-estate-blue font-medium py-2" onClick={toggleMenu}>About Us</Link>
              <Link to="/properties" className="text-gray-700 hover:text-estate-blue font-medium py-2" onClick={toggleMenu}>Properties</Link>
              <Link to="/services" className="text-gray-700 hover:text-estate-blue font-medium py-2" onClick={toggleMenu}>Investment Services</Link>
              <Link to="/contact" className="text-gray-700 hover:text-estate-blue font-medium py-2" onClick={toggleMenu}>Contact</Link>
              <Link to="/contact" className="bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded text-center transition duration-300" onClick={toggleMenu}>
                Send us a Message
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
