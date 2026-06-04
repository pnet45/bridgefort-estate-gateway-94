
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
    <Link to="/" className="flex items-center group">
      <img
        src="/lovable-uploads/BridgefortHomesLogo.png"
        alt="Bridgefort Homes Development Ltd Logo"
        className={`h-16 lg:h-20 w-auto object-contain transition-all duration-700 ease-out group-hover:scale-105 dark:brightness-110 ${
          isVisible
            ? 'transform translate-x-0 opacity-100'
            : 'transform -translate-x-full opacity-0'
        }`}
      />
    </Link>
  );
};

export default LogoSlideIn;
