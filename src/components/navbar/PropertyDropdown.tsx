import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface PropertyDropdownProps {
  className?: string;
  onClick?: () => void;
}

const propertyLinks = [
  { to: '/properties/estates', label: 'Estate Lands' },
  { to: '/5k-daily-promo', label: '5K Daily Promo' },
  { to: '/homes-sales', label: 'Homes Sales' },
  { to: '/properties/apartments', label: 'Apartments for Rent' },
];

const PropertyDropdown = ({ className = '', onClick }: PropertyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
    onClick?.();
  };

  return (
    <div ref={dropdownRef} className="relative z-[70]">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`nav-link relative z-[71] flex items-center gap-1 rounded-md px-3 py-2 font-semibold text-foreground transition-colors duration-200 hover:bg-estate-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-blue ${className}`}
      >
        <span>Properties</span>
        <ChevronDown size={16} aria-hidden="true" className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div role="menu" aria-label="Property categories" className="absolute left-0 top-full z-[80] mt-2 min-w-52 overflow-hidden rounded-xl border border-border bg-white py-1 text-gray-800 shadow-xl dark:bg-slate-950 dark:text-slate-100">
          {propertyLinks.map((link) => (
            <NavLink key={link.to} to={link.to} role="menuitem" onClick={handleLinkClick} className={({ isActive }) => `block whitespace-nowrap border-b border-gray-100 px-4 py-3 text-sm font-medium transition-colors last:border-b-0 dark:border-white/10 ${isActive ? 'bg-estate-blue/10 text-estate-blue dark:bg-estate-blue/20' : 'text-inherit hover:bg-estate-blue/10 hover:text-estate-blue'}`}>
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyDropdown;