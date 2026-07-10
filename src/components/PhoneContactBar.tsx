import React from 'react';
import { Phone } from 'lucide-react';
const PhoneContactBar = () => <div className="fixed w-full top-[80px] z-40 pointer-events-none" style={{
  minHeight: '48px'
}}>
    <div className="container-custom flex justify-end items-center py-2 pointer-events-auto">
      <a href="tel:+2348030624059" style={{
      minWidth: 56,
      maxWidth: 230
    }} aria-label="Call Bridgefort Homes Development Ltd" className="bg-estate-blue text-white px-4 rounded-lg shadow-lg font-medium hover:text-gray-200 transition-colors flex items-center gap-2 py-[15px]">
        <Phone size={22} className="text-red" />
        <span className="hidden sm:inline">+234 803 062 4059</span>
      </a>
    </div>
  </div>;
export default PhoneContactBar;