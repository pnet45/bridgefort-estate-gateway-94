
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import ServicesHero from '../components/services/ServicesHero';
import InvestmentPackages from '../components/services/InvestmentPackages';
import ROICalculator from '../components/services/ROICalculator';
import InvestmentGuide from '../components/services/InvestmentGuide';
import FAQSection from '../components/services/FAQSection';
import ServicesCTA from '../components/services/ServicesCTA';
import AdditionalServices from '../components/services/AdditionalServices';
import BuyAndResellFeature from '../components/services/Buy2SellFeature';
import TravelsFeature from '../components/services/TravelsFeature';
import CMSSection from '../components/cms/CMSSection';

const Services = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <ServicesHero />

      {/* Investment Packages */}
      <InvestmentPackages />

      {/* Additional Services */}
      <AdditionalServices />

      <CMSSection page="services" title="More Services & Articles" />

      {/* Bridgefort Travels Feature */}
      <TravelsFeature />

      {/* Buy and Resell Feature */}
      <div className="container-custom section-padding">
        <BuyAndResellFeature />
      </div>

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Investment Guide */}
      <InvestmentGuide />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <ServicesCTA />

      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default Services;
