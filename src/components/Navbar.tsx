
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
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-estate-blue font-montserrat">PWAN</span>
            <span className="text-xl font-semibold text-gray-800 font-montserrat">Bridgefort</span>
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
            <Link to="/contact" className="btn-cta">Get Consultation</Link>
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
              <Link to="/contact" className="btn-cta inline-block text-center" onClick={toggleMenu}>Get Consultation</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
