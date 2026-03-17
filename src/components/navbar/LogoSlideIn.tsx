
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const LogoSlideIn = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Link to="/" className="flex items-center">
      <img
        src="/lovable-uploads/PWANBridgefortLogo.png"
        alt="PWAN Bridgefort Logo"
        className={`h-17 w-21 transition-all duration-1000 ease-out ${
          isVisible 
            ? 'transform translate-x-0 opacity-100' 
            : 'transform -translate-x-full opacity-0'
        }`}
      />
    </Link>
  );
};

export default LogoSlideIn;
