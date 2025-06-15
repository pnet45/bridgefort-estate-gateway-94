import React from 'react';
import { LandPlot } from 'lucide-react';
import ServiceCard from './ServiceCard';
const LandSurveyServices = () => {
  return <ServiceCard imageSrc="https://5.imimg.com/data5/SELLER/Default/2022/11/EZ/TO/DO/105576955/land-survey-consultancy-service-500x500.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" imageAlt="Land Surveys" icon={<LandPlot size={24} className="text-white " />} title="Land Surveys" description="Our professional surveying services ensure accurate land assessment and documentation:" bulletPoints={["Boundary surveys and demarcation", "Topographic surveys", "Title verification", "Land use and zoning analysis", "Due diligence investigations"]} buttonText="Learn More" />;
};
export default LandSurveyServices;