
import React from 'react';
import { Link } from 'react-router-dom';

const BuyAndResellFeature = () => {
  return (
    <section className="relative py-16 bg-cover bg-center bg-no-repeat" 
             style={{ backgroundImage: 'url(/lovable-uploads/BuytoSell.jpg)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative z-10 container-custom">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Your Path to Guaranteed Real Estate Returns
          </h2>
          <h3 className="text-3xl md:text-4xl font-semibold mb-8 text-white">
            Introducing Buy and ReSell
          </h3>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            A revolutionary investment model where you purchase land today and we guarantee 
            to buy it back at a predetermined higher price within 24 months. Secure, 
            predictable returns with zero market risk.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/buy2sell" 
              className="bg-estate-red hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
            >
              Learn More About Buy and Resell
            </Link>
            <Link 
              to="/contact" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-bold py-4 px-8 rounded-lg text-lg transition duration-300"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyAndResellFeature;
