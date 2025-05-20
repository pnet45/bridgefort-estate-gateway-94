
import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavLinksProps {
  className?: string;
  onClick?: () => void;
}

const NavLinks = ({ className = '', onClick }: NavLinksProps) => {
  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/properties', label: 'Properties' },
    { to: '/services', label: 'Services' },
    { to: '/buy2sell', label: 'Buy2Sell' },
    { to: '/training', label: 'Training' },
    { to: '/career', label: 'Careers' },
    { to: '/contact', label: 'Contact' },
    { to: '/blog', label: 'Blog' }
  ];

  return (
    <>
      {links.map((link) => (
        <NavLink 
          key={link.to} 
          to={link.to} 
          className={({isActive}) => 
            `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300'} ${className}`
          }
          onClick={onClick}
        >
          <span className="font-bold">{link.label}</span>
        </NavLink>
      ))}
    </>
  );
};

export default NavLinks;
