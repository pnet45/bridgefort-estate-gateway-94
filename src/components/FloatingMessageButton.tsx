
import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type Position = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

const FloatingMessageButton = () => {
  const [position, setPosition] = useState<Position>('bottom-right');
  
  useEffect(() => {
    // Function to change position randomly
    const changePosition = () => {
      const positions: Position[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
      const randomIndex = Math.floor(Math.random() * positions.length);
      setPosition(positions[randomIndex]);
    };
    
    // Initial position change after 10 seconds
    const initialTimer = setTimeout(() => {
      changePosition();
    }, 10000);
    
    // Change position every 10 seconds
    const intervalTimer = setInterval(() => {
      changePosition();
    }, 10000);
    
    // Clean up timers
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);
  
  // Define position classes
  const positionClasses = {
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };
  
  return (
    <Link 
      to="/contact" 
      className={`absolute z-40 bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full shadow-lg transition duration-300 flex items-center hover:animate-bounce-zoom hover:scale-105 ${positionClasses[position]}`}
      aria-label="Send Message"
    >
      <MessageCircle size={18} className="mr-2" />
      <span className="hidden sm:inline">Send Message</span>
    </Link>
  );
};

export default FloatingMessageButton;
