
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import NewsletterForm from './NewsletterForm';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 animate-fade-in">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="animate-fade-in text-left">
            <div className="mb-4">
              <span className="text-2xl font-bold text-white font-montserrat">PWAN</span>
              <span className="text-xl font-semibold text-estate-lightBlue font-montserrat ml-2">Bridgefort</span>
            </div>
            <p className="text-gray-300 mb-4">Your Gateway to Premium Real Estate Investments</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/pwanbridgefortestates" className="text-gray-300 hover:text-estate-blue transition duration-300 hover:scale-110">
                <Facebook size={20} />
              </a>
              <a href="https://x.com/pwanbridgefort.official" className="text-gray-300 hover:text-estate-blue transition duration-300 hover:scale-110">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com/pwanbridgefort.official" className="text-gray-300 hover:text-estate-blue transition duration-300 hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href="https://linkedln.com/pwanbridgefort.official" className="text-gray-300 hover:text-estate-blue transition duration-300 hover:scale-110">
                <Linkedin size={20} />
              </a>
              <a href="https://wa.me/+2348070710688" className="text-gray-300 hover:text-estate-blue transition duration-300 hover:scale-110">
                <MessageSquare size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-in text-left">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition duration-200 hover:scale-105">Home</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition duration-200 hover:scale-105">About Us</Link></li>
              <li><Link to="/properties" className="text-gray-300 hover:text-white transition duration-200 hover:scale-105">Properties</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white transition duration-200 hover:scale-105">Investment Services</Link></li>
              <li><Link to="/buy2sell" className="text-gray-300 hover:text-white transition duration-200 hover:scale-105">Buy and Resell Program</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition duration-200 hover:scale-105">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fade-in text-left">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0 text-estate-blue" />
                <span className="text-gray-300">Head Office | Plot 117 Wosilat Okoya Seriki Street, Eleganza Gardens Estate, VGC Bus Stop, Lekki-Ajah, Lagos</span>
              </li>
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0 text-estate-blue" />
                <span className="text-gray-300">Lagos | Suite 8 Gacoum Plaza Opposite K Close, 23 Road, Festac, Lagos</span>
              </li>
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0 text-estate-blue" />
                <span className="text-gray-300">Port Harcourt Office | 173 Sanni Abacha Road, 500101, Port Harcourt, Rivers State</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 flex-shrink-0 text-estate-blue" />
                <div className="flex flex-col">
                  <a href="tel:+2348030624059" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200">+234 803 062 4059</a>
                  <a href="tel:+2348070710688" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200">+234 807 071 0688</a>
                </div>
              </li>
              <li className="flex items-start">
                <Mail size={20} className="mr-2 mt-1 flex-shrink-0 text-estate-blue" />
                <div className="flex flex-col">
                  <a href="mailto:info@pwanbridgefort.ng" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200">info@pwanbridgefort.ng</a>
                  <a href="mailto:sales@pwanbridgefort.ng" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200">sales@pwanbridgefort.ng</a>
                  <a href="mailto:admin@pwanbridgefort.ng" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200">admin@pwanbridgefort.ng</a>
                  <a href="mailto:account@pwanbridgefort.ng" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200">account@pwanbridgefort.ng</a>
                  <a href="mailto:training@pwanbridgefort.ng" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200">training@pwanbridgefort.ng</a>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="animate-fade-in text-left">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Newsletter</h3>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for updates on new properties and investment opportunities.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} PWAN Bridgefort Estate and Investment Ltd. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-400 text-sm hover:text-white mr-4 hover:scale-105 transition-all duration-200">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-gray-400 text-sm hover:text-white mr-4 hover:scale-105 transition-all duration-200">Terms of Service</Link>
              <Link to="/sitemap" className="text-gray-400 text-sm hover:text-white hover:scale-105 transition-all duration-200">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
