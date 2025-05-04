
import React from 'react';
import { Link } from 'react-router-dom';

const TrainingCTA = () => {
  return (
    <section className="py-16 bg-estate-blue text-white text-center">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-4">Ready to Enhance Your Real Estate Skills?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Join our upcoming training sessions and masterclasses to boost your real estate knowledge and sales performance.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="btn-cta bg-white text-estate-blue hover:bg-gray-100 text-lg px-8 py-3">Register for Training</Link>
          <a href="tel:+2348030624059" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-medium text-lg px-8 py-3 rounded transition duration-300">Call Us</a>
        </div>
      </div>
    </section>
  );
};

export default TrainingCTA;
