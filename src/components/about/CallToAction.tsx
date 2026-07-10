
import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-16 bg-estate-blue text-white text-center">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Investment Journey?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Partner with Bridgefort Homes Development Ltd for secure, high-yield real estate investments.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="btn-cta bg-white text-estate-blue hover:bg-gray-100 text-lg px-8 py-3">Contact Us Today</Link>
          <Link to="/training" className="bg-estate-red text-white hover:bg-red-700 text-lg px-8 py-3 rounded transition duration-300">Explore Training</Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
