import React from 'react';
import { HeartHandshake } from 'lucide-react';
import InfoBox from './InfoBox';
const RealEstateManagement = () => {
  return <InfoBox icon={<HeartHandshake size={32} className="text-white" />} title="Real Estate Management" description={["At Bridgefort Homes Development Ltd, we understand that your property is more than just an asset—it's a legacy. That's why we take pride in providing meticulous care, expert oversight, and value-driven management for every property entrusted to us.", "Our dedicated team of seasoned real estate professionals, estate surveyors, and valuers—supported by an efficient administrative and technical staff—ensures your investments are acquired, maintained, and optimized for maximum returns."]} checkPoints={["Proactive Property Supervision – We don't just manage; we protect and enhance.", "Trusted Expertise – Decades of industry experience working for you.", "TEAMWORK Philosophy – Together Everyone Achieves More for your real estate success."]} footer="Need reliable, results-driven property management? Let Bridgefort Homes Development Ltd safeguard your investments today." />;
};
export default RealEstateManagement;