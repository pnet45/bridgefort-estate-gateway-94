
import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, Building, Wallet, ArrowRight, Construction, LandPlot, GraduationCap, BarChart } from 'lucide-react';

const InvestmentServices = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">We offer a range of services designed to maximize your real estate acquisition returns.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
            <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Construction size={28} className="text-estate-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Construction & Development</h3>
            <p className="text-gray-600 mb-4">Expert building services from architectural design to full property development with quality craftsmanship.</p>
            <Link to="/services" className="text-estate-blue font-medium hover:text-estate-darkBlue">Learn More</Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
            <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <LandPlot size={28} className="text-estate-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Land Surveys</h3>
            <p className="text-gray-600 mb-4">Comprehensive land surveying services including boundary mapping, topographic surveys, and title verification.</p>
            <Link to="/services" className="text-estate-blue font-medium hover:text-estate-darkBlue">Learn More</Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center">
            <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BarChart size={28} className="text-estate-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Consultancy</h3>
            <p className="text-gray-600 mb-4">Expert real estate advisory services tailored to help you make informed investment decisions and maximize returns.</p>
            <Link to="/services" className="text-estate-blue font-medium hover:text-estate-darkBlue">Learn More</Link>
          </div>
        </div>
        
        <div className="mt-12 p-6 md:p-8 bg-gray-50 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            <div className="w-full md:w-1/2">
              <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <GraduationCap size={28} className="text-estate-blue" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Seminars & Training</h3>
              <p className="text-gray-600 mb-6">
                Gain valuable insights into real estate investment strategies through our comprehensive educational programs.
                Our expert-led seminars and training sessions cover everything from market analysis to wealth creation through
                property investment.
              </p>
              <Link to="/services" className="btn-primary inline-block">
                Upcoming Events
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1431576901776-e539bd916ba2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" 
                alt="Real Estate Seminar" 
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
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
