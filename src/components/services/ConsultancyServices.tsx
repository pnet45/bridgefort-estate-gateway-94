import React from 'react';
import { BarChart } from 'lucide-react';
import ServiceCard from './ServiceCard';
const ConsultancyServices = () => {
  return <ServiceCard imageSrc="/lovable-uploads/5a69cf4b-e9ca-477d-bf00-2ac6fa768177.jpg" imageAlt="Real Estate Consultancy" icon={<BarChart size={24} className="text-white " />} title="Consultancy" description="Our expert consultants provide tailored advice to optimize your investment strategy:" bulletPoints={["Investment portfolio analysis", "Market trend research", "Property valuation", "ROI optimization strategies", "Risk assessment and mitigation"]} buttonText="Learn More" />;
};
export default ConsultancyServices;