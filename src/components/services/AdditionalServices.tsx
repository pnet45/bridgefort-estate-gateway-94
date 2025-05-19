
import React from 'react';
import { HeartHandshake, Scale, CheckCircle } from 'lucide-react';

const AdditionalServices = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Comprehensive Investment Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Beyond just property acquisition, we offer comprehensive services to maximize your real estate investment potential.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Real Estate Management */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="flex items-center mb-6">
              <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4">
                <HeartHandshake size={32} className="text-estate-blue" />
              </div>
              <h3 className="text-2xl font-bold">Real Estate Management</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              At PWAN Bridgefort, we understand that your property is more than just an asset—it's a legacy. 
              That's why we take pride in providing meticulous care, expert oversight, and value-driven 
              management for every property entrusted to us.
            </p>
            
            <p className="text-gray-700 mb-6">
              Our dedicated team of seasoned real estate professionals, estate surveyors, and valuers—supported 
              by an efficient administrative and technical staff—ensures your investments are acquired, maintained, 
              and optimized for maximum returns.
            </p>
            
            <h4 className="font-bold text-lg mb-4">Why Choose PWAN Bridgefort?</h4>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckCircle size={20} className="text-estate-blue mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Proactive Property Supervision – We don't just manage; we protect and enhance.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={20} className="text-estate-blue mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Trusted Expertise – Decades of industry experience working for you.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={20} className="text-estate-blue mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">TEAMWORK Philosophy – Together Everyone Achieves More for your real estate success.</span>
              </li>
            </ul>
            
            <p className="font-medium text-gray-800">
              Need reliable, results-driven property management? Let PWAN Bridgefort safeguard your investments today.
            </p>
          </div>
          
          {/* Property Development */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="flex items-center mb-6">
              <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4">
                <Scale size={32} className="text-estate-blue" />
              </div>
              <h3 className="text-2xl font-bold">Property Development</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              At PWAN Bridgefort, we don't just sell land—we create opportunities. Discover high-value, 
              fast-developing properties at competitive prices, backed by our commitment to quality, 
              legality, and smart growth.
            </p>
            
            <h4 className="font-bold text-lg mb-4">Our End-to-End Development Services Include:</h4>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckCircle size={20} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Strategic Land Acquisition – Prime locations with high appreciation potential.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={20} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Legal & Documentation Support – Hassle-free title perfection.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={20} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Master-Planned Estates – Thoughtful layouts for modern living.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={20} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Construction & Renovation – Transforming properties for maximum value.</span>
              </li>
            </ul>
            
            <p className="font-medium text-gray-800 mb-4">
              Whether you're an investor, homeowner, or developer, PWAN Bridgefort is your trusted partner 
              in turning visions into thriving realities.
            </p>
            
            <p className="font-bold text-estate-blue">
              Your Property's Future Starts Here—Let's Build It Together!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdditionalServices;
