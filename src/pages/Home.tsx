
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

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Property Search */}
      <section className="relative bg-gray-100 py-16">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Your Gateway to Premium Real Estate Investments
            </h1>
            <p className="text-base md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
              Discover exceptional properties and secure high-yield investment opportunities with PWAN Bridgefort.
            </p>
          </div>
          <PropertySearch />
        </div>
      </section>
      
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
    </div>
  );
};

export default Home;
