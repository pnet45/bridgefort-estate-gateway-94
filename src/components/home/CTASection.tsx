import React from 'react';
import { Link } from 'react-router-dom';
const CTASection = () => {
  return <section className="py-16 text-white text-center bg-gradient-to-br from-estate-darkBlue via-estate-blue to-estate-red">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Ready to Start Your Real Estate Investment Journey?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">Contact our team of experts today for a free consultation and property portfolio review.</p>
        <Link to="/contact" className="inline-flex items-center justify-center gap-2 bg-white text-estate-blue hover:bg-estate-red hover:text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:-translate-y-0.5">Get Free Consultation</Link>
      </div>
    </section>;
};
export default CTASection;