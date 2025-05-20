
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingMessageButton = () => {
  return (
    <Link 
      to="/contact" 
      className="fixed bottom-6 right-6 z-40 bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full shadow-lg transition duration-300 flex items-center"
      aria-label="Send Message"
    >
      <MessageCircle size={18} className="mr-2" />
      <span className="hidden sm:inline">Send Message</span>
    </Link>
  );
};

export default FloatingMessageButton;
