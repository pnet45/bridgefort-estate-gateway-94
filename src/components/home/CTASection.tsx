import React from 'react';
import { Link } from 'react-router-dom';
const CTASection = () => {
  return <section className="py-16 text-white text-center bg-blue-900">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Real Estate Investment Journey?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">Contact our team of experts today for a free consultation and property portfolio review.</p>
        <Link to="/contact" className="btn-cta text-lg px-8 py-3">Get Free Consultation</Link>
      </div>
    </section>;
};
export default CTASection;