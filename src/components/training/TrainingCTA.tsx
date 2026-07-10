
import React from 'react';
import { Link } from 'react-router-dom';
import NewsletterForm from '../NewsletterForm';

const TrainingCTA = () => {
  return (
    <section className="py-16 bg-estate-blue text-white">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Ready to Enhance Your Real Estate Skills?</h2>
            <p className="text-xl mb-8">Join our upcoming training sessions and masterclasses to boost your real estate knowledge and sales performance.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="btn-cta bg-white text-estate-blue hover:bg-gray-100 text-lg px-8 py-3">Register for Training</Link>
              <a href="tel:+2348030624059" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-medium text-lg px-8 py-3 rounded transition duration-300">Call Us</a>
            </div>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Subscribe to Training Updates</h3>
            <p className="mb-4">Get notified about upcoming training events and exclusive content.</p>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingCTA;
