import React from 'react';
import { Sprout } from 'lucide-react';
import ServiceCard from './ServiceCard';

const AgrovestServices = () => {
  return (
    <ServiceCard
      imageSrc="/lovable-uploads/agrovest-cocoa-plantation.jpg"
      imageAlt="Bridgefort Agrovest farm estate"
      icon={<Sprout size={24} className="text-white" />}
      title="Agrovest"
      description="Join established agricultural operations at Bridgefort Farm Estate. Choose the operation you want to participate in, and our management team handles cultivation, production, harvesting, processing and off-taker coordination:"
      bulletPoints={[
        'Food crops: ₦800,000 per plot',
        'Cash crops: ₦1,000,000 per plot',
        'Aquaculture: ₦1,000,000 per pond',
        'Livestock: ₦1,000,000 per pair',
        'Subscribe for one or more plots, ponds or livestock pairs',
        'Projected share of net profits: 10%–20% Year 1, 30%–40% Years 2–3, 40%–50% Years 4–5',
        '5-year term with renewal option',
        'Downloadable subscription form and online payment',
      ]}
      buttonText="Explore Agrovest"
    />
  );
};

export default AgrovestServices;
