
import React from 'react';
import { Link } from 'react-router-dom';

const OurEstates = () => {
  return (
    <section className="section-padding bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-estate-blue">Our Estates: A World of Opportunity</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Whether you're looking for a place to call home or an investment opportunity, our estates offer something for everyone:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="h-64 mb-4 overflow-hidden rounded-md">
              <img src="/lovable-uploads/dfe26401-712e-4dfd-b08f-69abac4fec61.png" alt="Residential Estate" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-estate-blue">Residential Estates</h3>
            <p className="text-gray-700">
              Located in serene, family-friendly environments designed for modern living.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="h-64 mb-4 overflow-hidden rounded-md">
              <img src="/lovable-uploads/ba3b8490-e83f-477b-b729-b617da515b2c.png" alt="Commercial Estate" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-estate-blue">Commercial Estates</h3>
            <p className="text-gray-700">
              Prime plots perfect for businesses, warehouses, or rental properties.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="h-64 mb-4 overflow-hidden rounded-md">
              <img src="/lovable-uploads/731e5107-538f-41a5-9af8-5b864bd49831.png" alt="Land Banking" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-estate-blue">Land Banking Options</h3>
            <p className="text-gray-700">
              For savvy investors looking to capitalize on land appreciation over time.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-10 bg-estate-blue bg-opacity-10 p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-4 text-estate-blue">Join the PWAN Bridgefort Family Today</h3>
          <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
            At PWAN Bridgefort, we're more than a real estate company; we're a bridge to your dreams. Let's help you turn your aspirations into reality, one property at a time.
          </p>
          <p className="text-lg font-medium text-estate-red mb-6">Invest now, because tomorrow begins today.</p>
          
          <Link to="/contact" className="btn-cta py-3 px-8 text-lg">
            Contact Us Today
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OurEstates;
