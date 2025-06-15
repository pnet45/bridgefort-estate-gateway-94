import React from 'react';
import { Scale } from 'lucide-react';
import InfoBox from './InfoBox';
const PropertyDevelopment = () => {
  return <InfoBox icon={<Scale size={32} className="text-white" />} title="Property Development" description={["At PWAN Bridgefort, we don't just sell land—we create opportunities. Discover high-value, fast-developing properties at competitive prices, backed by our commitment to quality, legality, and smart growth."]} checkPoints={["Strategic Land Acquisition – Prime locations with high appreciation potential.", "Legal & Documentation Support – Hassle-free title perfection.", "Master-Planned Estates – Thoughtful layouts for modern living.", "Construction & Renovation – Transforming properties for maximum value."]} footer="Whether you're an investor, homeowner, or developer, PWAN Bridgefort is your trusted partner in turning visions into thriving realities." accentColorClass="text-green-600" extraContent={<p className="font-bold text-estate-blue">
          Your Property's Future Starts Here—Let's Build It Together!
        </p>} />;
};
export default PropertyDevelopment;