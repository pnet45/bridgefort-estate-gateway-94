
import React from 'react';
import { Link } from 'react-router-dom';
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
import { PropertyProvider } from '../contexts/PropertyContext';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="h-[70vh] bg-cover bg-center" style={{ backgroundImage: 'url(/lovable-uploads/Homeslider.png)' }}>
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight animate-fade-in">
                Your Gateway to Premium Real Estate Investments
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
                Discover exceptional properties and secure high-yield investment opportunities with PWAN Bridgefort.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Link to="/properties" className="btn-cta text-lg px-8 py-3">
                  Explore Properties
                </Link>
                <Link to="/services" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-medium text-lg px-8 py-3 rounded transition duration-300">
                  Investment Services
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Property Search */}
        <PropertyProvider>
          <div className="container-custom">
            <PropertySearch />
          </div>
        </PropertyProvider>
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
