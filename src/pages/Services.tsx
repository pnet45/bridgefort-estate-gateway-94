
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServicesHero from '../components/services/ServicesHero';
import InvestmentPackages from '../components/services/InvestmentPackages';
import ROICalculator from '../components/services/ROICalculator';
import InvestmentGuide from '../components/services/InvestmentGuide';
import FAQSection from '../components/services/FAQSection';
import ServicesCTA from '../components/services/ServicesCTA';

const Services = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <ServicesHero />

      {/* Investment Packages */}
      <InvestmentPackages />

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Investment Guide */}
      <InvestmentGuide />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <ServicesCTA />

      <Footer />
    </div>
  );
};

export default Services;
