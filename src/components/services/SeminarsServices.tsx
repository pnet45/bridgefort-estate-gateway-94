import React from 'react';
import { GraduationCap } from 'lucide-react';
import ServiceCard from './ServiceCard';
const SeminarsServices = () => {
  return <ServiceCard imageSrc="/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg" imageAlt="Real Estate Seminars" icon={<GraduationCap size={24} className="text-white" />} title="Seminars & Training" description="Gain valuable insights through our educational programs designed for both beginners and experienced investors:" bulletPoints={["Real estate investment fundamentals", "Property flipping workshops", "Rental property management", "Real estate market analysis", "Wealth building strategies"]} buttonText="Upcoming Events" />;
};
export default SeminarsServices;