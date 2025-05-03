
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertySearch from '../components/PropertySearch';
import MissionStatement from '../components/MissionStatement';
import FeaturedProperties from '../components/home/FeaturedProperties';
import InvestmentServices from '../components/home/InvestmentServices';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import Partners from '../components/home/Partners';
import CTASection from '../components/home/CTASection';
import HomeHeroImage from '../components/HomeHeroImage';

const Home = () => {
  return <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Image Carousel */}
      <HomeHeroImage />
      
      {/* Mission Statement */}
      <MissionStatement />
      
      {/* Featured Properties */}
      <FeaturedProperties />
      
      {/* Investment Services */}
      <InvestmentServices />
      
      {/* Why Choose Us */}
      <WhyChooseUs />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Partners */}
      <Partners />
      
      {/* CTA */}
      <CTASection />
      
      <Footer />
    </div>;
};
export default Home;
