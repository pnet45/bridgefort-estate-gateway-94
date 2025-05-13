
import React from 'react';
import { Link } from 'react-router-dom';

const CTA: React.FC = () => {
  return (
    <section className="py-16 bg-estate-blue text-white text-center">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-4">Ready to Invest with Buy to Sell?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Start your journey to guaranteed real estate returns today. Our team is ready to assist you.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="bg-white text-estate-blue hover:bg-gray-100 font-medium text-lg px-8 py-3 rounded transition duration-300">
            Contact Our Team
          </Link>
          <Link to="/services" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-medium text-lg px-8 py-3 rounded transition duration-300">
            View All Investment Services
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
