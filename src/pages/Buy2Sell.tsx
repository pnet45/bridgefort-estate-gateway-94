
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';

// Import our new component files
import Buy2SellHero from '../components/buy2sell/Buy2SellHero';
import Buy2SellIntro from '../components/buy2sell/Buy2SellIntro';
import ProcessSteps from '../components/buy2sell/ProcessSteps';
import InvestmentOptions from '../components/buy2sell/InvestmentOptions';
import ROITable from '../components/buy2sell/ROITable';
import FeaturedProperty from '../components/buy2sell/FeaturedProperty';
import FAQ from '../components/buy2sell/FAQ';
import CTA from '../components/buy2sell/CTA';

const Buy2Sell = () => {
  const isMobile = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const backgroundImage = 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <Buy2SellHero backgroundImage={backgroundImage} />

      {/* Intro Section with Animation */}
      <Buy2SellIntro isLoaded={isLoaded} />

      {/* How It Works - 3 Easy Steps */}
      <ProcessSteps isLoaded={isLoaded} />

      {/* Main Content */}
      <div className="container-custom">
        {/* Investment Options Section */}
        <InvestmentOptions />

        {/* ROI Table Section with Promo Image */}
        <ROITable isLoaded={isLoaded} />

        {/* Featured Property - Animated */}
        <FeaturedProperty isLoaded={isLoaded} />

        {/* FAQ Section - Accordion */}
        <FAQ />
      </div>

      {/* CTA Section */}
      <CTA />

      <Footer />
    </div>
  );
};

export default Buy2Sell;
