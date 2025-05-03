
import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, Building, Wallet, ArrowRight } from 'lucide-react';

const InvestmentServices = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">We offer a range of services designed to maximize your real estate acquisition returns.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
            <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <HomeIcon size={28} className="text-estate-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Luxury Homes</h3>
            <p className="text-gray-600 mb-4">Premium residential properties in sought-after locations with exceptional amenities and potential for appreciation.</p>
            <Link to="/services" className="text-estate-blue font-medium hover:text-estate-darkBlue">Learn More</Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
            <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Building size={28} className="text-estate-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Commercial Plots</h3>
            <p className="text-gray-600 mb-4">Strategic commercial properties and land in high-growth areas ideal for development or long-term investment.</p>
            <Link to="/services" className="text-estate-blue font-medium hover:text-estate-darkBlue">Learn More</Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
            <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Wallet size={28} className="text-estate-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Buy2Sell Program</h3>
            <p className="text-gray-600 mb-4">Our guaranteed investment program where we resell your property within 12 months with up to 30% profit.</p>
            <Link to="/buy2sell" className="text-estate-blue font-medium hover:text-estate-darkBlue flex items-center justify-center">
              Explore More <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <Link to="/services" className="btn-cta">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InvestmentServices;
