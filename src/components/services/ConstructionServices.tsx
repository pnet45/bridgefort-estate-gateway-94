import React from 'react';
import { Construction } from 'lucide-react';
import ServiceCard from './ServiceCard';
const ConstructionServices = () => {
  return <ServiceCard imageSrc="/lovable-uploads/b006d931-462b-4646-97c9-0b2f3bc1d210.jpg" imageAlt="Construction and Development" icon={<Construction size={24} className="text-yellow" />} title="Construction & Development" description="Our construction and development services cover everything from initial design to project completion. We handle:" bulletPoints={["Custom home building", "Property renovations and extensions", "Commercial development projects", "Project management and supervision", "Quality assurance and compliance"]} buttonText="Learn More" className="bg-gray-50" />;
};
export default ConstructionServices;