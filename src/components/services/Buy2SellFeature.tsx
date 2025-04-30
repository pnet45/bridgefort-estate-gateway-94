
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Buy2SellFeature = () => {
  return (
    <div className="mb-12 bg-gradient-to-r from-estate-blue to-estate-darkBlue rounded-lg shadow-xl overflow-hidden">
      <div className="p-8 text-white">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-2/3 mb-6 lg:mb-0">
            <h2 className="text-3xl font-bold mb-4">Your Path to Guaranteed Real Estate Returns</h2>
            <h3 className="text-xl mb-4">Introducing Buy To Sell</h3>
            <p className="mb-6">
              Buy2Sell simplifies real estate investment. Imagine earning substantial passive income without the usual risks. 
              With Buy2Sell, you can purchase property in our carefully chosen estates, and we guarantee to facilitate a resale 
              of your property within 12 months, aiming for profits as high as 30%. Enjoy the peace of mind that comes with 
              knowing your income potential is locked in from day one.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/buy2sell" 
                className="bg-white text-estate-blue hover:bg-gray-100 px-6 py-2 rounded inline-flex items-center font-medium transition-colors"
              >
                Explore More <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link 
                to="/contact" 
                className="bg-estate-red text-white hover:bg-red-700 px-6 py-2 rounded inline-flex items-center font-medium transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="lg:w-1/3 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Buy2Sell Investment" 
              className="rounded-lg shadow-lg max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buy2SellFeature;
