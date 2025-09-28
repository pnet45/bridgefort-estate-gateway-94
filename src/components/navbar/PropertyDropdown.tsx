import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface PropertyDropdownProps {
  className?: string;
  onClick?: () => void;
}

const PropertyDropdown = ({ className = '', onClick }: PropertyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const propertyLinks = [
    { to: '/properties/estates', label: 'Estate Lands' },
    { to: '/homes-sales', label: 'Homes Sales' },
    { to: '/properties/apartments', label: 'Apartments for Rent' }
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    onClick?.();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={dropdownRef}
      className="relative group"
    >
      <button
        onClick={toggleDropdown}
        className={`nav-link font-bold animate-fade-in text-estate-blue hover:text-white hover:bg-estate-blue hover:rounded-md hover:px-3 hover:py-2 transition-all duration-300 flex items-center gap-1 ${className}`}
        style={{
          animationDelay: '450ms',
          opacity: 0,
          animation: 'slideDown 0.6s ease-out 450ms forwards'
        }}
      >
        <span className="font-bold">Properties</span>
        <ChevronDown size={16} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {propertyLinks.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-estate-blue bg-blue-50 border-l-4 border-estate-blue'
                    : 'text-gray-700 hover:text-estate-blue hover:bg-gray-50'
                } ${index === 0 ? 'rounded-t-md' : ''} ${index === propertyLinks.length - 1 ? 'rounded-b-md' : 'border-b border-gray-100'}`
              }
              onClick={handleLinkClick}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyDropdown;