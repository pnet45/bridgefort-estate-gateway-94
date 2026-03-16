
import React from 'react';
import { NavLink } from 'react-router-dom';
import PropertyDropdown from './PropertyDropdown';

interface AnimatedNavLinksProps {
  className?: string;
  onClick?: () => void;
}

const AnimatedNavLinks = ({ className = '', onClick }: AnimatedNavLinksProps) => {
  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/services', label: 'Services' },
    { to: '/training', label: 'Training' },
    { to: '/listings', label: 'Listings' },
    { to: '/buy2sell', label: 'Buy & Resell' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <>
      {links.slice(0, 2).map((link, index) => (
        <NavLink 
          key={link.to} 
          to={link.to} 
          className={({isActive}) => 
            `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300'} ${className}`
          }
          style={{
            opacity: 0,
            animation: `slideDown 0.5s ease-out ${index * 100}ms forwards`
          }}
          onClick={onClick}
        >
          <span className="font-bold">{link.label}</span>
        </NavLink>
      ))}
      
      {/* Properties Dropdown */}
      <PropertyDropdown className={className} onClick={onClick} />
      
      {links.slice(2).map((link, index) => (
        <NavLink 
          key={link.to} 
          to={link.to} 
          className={({isActive}) => 
            `nav-link font-bold ${isActive ? 'text-estate-blue bg-blue-100 px-3 py-2 rounded-md' : 'text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300'} ${className}`
          }
          style={{
            opacity: 0,
            animation: `slideInRight 0.5s ease-out ${(index + 3) * 100}ms forwards`
          }}
          onClick={onClick}
        >
          <span className="font-bold">{link.label}</span>
        </NavLink>
      ))}
    </>
  );
};

export default AnimatedNavLinks;
