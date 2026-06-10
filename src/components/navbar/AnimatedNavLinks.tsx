
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
    { to: '/career', label: 'Career' },
    { to: '/contact', label: 'Contact' }
  ];

  const baseLink = (isActive: boolean) =>
    `nav-link font-semibold tracking-tight transition-all duration-300 rounded-md px-3 py-2 ${
      isActive
        ? 'text-white bg-estate-blue shadow-sm'
        : 'text-foreground hover:text-white hover:bg-estate-blue hover:scale-105 hover:-translate-y-0.5'
    }`;

  return (
    <>
      {links.slice(0, 2).map((link, index) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `${baseLink(isActive)} ${className}`}
          style={{
            opacity: 0,
            animation: `slideDown 0.5s ease-out ${index * 100}ms forwards`
          }}
          onClick={onClick}
        >
          <span>{link.label}</span>
        </NavLink>
      ))}

      {/* Properties Dropdown */}
      <PropertyDropdown className={className} onClick={onClick} />

      {links.slice(2).map((link, index) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `${baseLink(isActive)} ${className}`}
          style={{
            opacity: 0,
            animation: `slideInRight 0.5s ease-out ${(index + 3) * 100}ms forwards`
          }}
          onClick={onClick}
        >
          <span>{link.label}</span>
        </NavLink>
      ))}
    </>
  );
};

export default AnimatedNavLinks;
