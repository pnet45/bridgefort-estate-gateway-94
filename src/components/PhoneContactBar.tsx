
import React from 'react';
import { Phone } from 'lucide-react';

const PhoneContactBar = () => (
  <div className="fixed w-full top-[80px] z-40 pointer-events-none" style={{ minHeight: '48px' }}>
    <div className="container-custom flex justify-end items-center py-2 pointer-events-auto">
      <a
        href="tel:+2348030624059"
        className="bg-estate-blue text-white px-4 py-2 rounded-lg shadow-lg font-medium hover:text-gray-200 transition-colors flex items-center gap-2"
        style={{ minWidth: 56, maxWidth: 230 }}
        aria-label="Call PWAN Bridgefort"
      >
        <Phone size={22} className="text-white" />
        <span className="hidden sm:inline">+234 803 062 4059</span>
      </a>
    </div>
  </div>
);

export default PhoneContactBar;
