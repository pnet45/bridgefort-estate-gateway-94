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
      description="Invest in professionally managed farmland at our Ogun State agricultural estate — you invest, we farm, you earn:"
      bulletPoints={[
        'Farm plots from ₦800,000 (actual value ₦1,000,000)',
        'Choice of Cash Crops, Food Crops or Livestock Farming',
        'Quarterly profit shares from Year 2, up to 40% – 50%',
        '5-year term with renewal option',
        'Downloadable subscription form and online payment',
      ]}
      buttonText="Explore Agrovest"
    />
  );
};

export default AgrovestServices;
