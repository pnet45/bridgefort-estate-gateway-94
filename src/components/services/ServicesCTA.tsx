
import React from 'react';
import { Link } from 'react-router-dom';

const ServicesCTA = () => {
  return (
    <section className="py-16 bg-estate-blue text-white text-center">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Investment Journey?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Contact our team of experts today for a free consultation and property portfolio review.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="btn-cta bg-white text-estate-blue hover:bg-gray-100 text-lg px-8 py-3">Schedule Consultation</Link>
          <Link to="/properties" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-medium text-lg px-8 py-3 rounded transition duration-300">Browse Properties</Link>
          <Link to="/training" className="bg-estate-red border-2 border-estate-red text-white hover:bg-red-700 hover:border-red-700 font-medium text-lg px-8 py-3 rounded transition duration-300">Training Programs</Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesCTA;
