
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const InvestmentGuide = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Investment Guide</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Follow our step-by-step process to start your real estate investment journey with Bridgefort Homes Development Ltd.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md relative">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-blue text-white flex items-center justify-center font-bold text-lg">1</div>
            <h3 className="text-xl font-semibold mb-3 mt-4">Consultation</h3>
            <p className="text-gray-600 mb-4">Schedule a free consultation with our investment advisors to discuss your goals and financial capacity.</p>
            <Link to="/contact" className="text-estate-blue font-medium hover:text-estate-darkBlue inline-flex items-center">
              Book Consultation <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md relative">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-blue text-white flex items-center justify-center font-bold text-lg">2</div>
            <h3 className="text-xl font-semibold mb-3 mt-4">Property Selection</h3>
            <p className="text-gray-600 mb-4">Based on your needs, we'll recommend suitable properties and arrange viewings or detailed virtual tours.</p>
            <Link to="/properties" className="text-estate-blue font-medium hover:text-estate-darkBlue inline-flex items-center">
              Browse Properties <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md relative">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-blue text-white flex items-center justify-center font-bold text-lg">3</div>
            <h3 className="text-xl font-semibold mb-3 mt-4">Documentation</h3>
            <p className="text-gray-600 mb-4">Our legal team will handle all necessary documentation, ensuring clean titles and proper registration.</p>
            <Link to="/contact" className="text-estate-blue font-medium hover:text-estate-darkBlue inline-flex items-center">
              Learn More <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md relative">
            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-estate-blue text-white flex items-center justify-center font-bold text-lg">4</div>
            <h3 className="text-xl font-semibold mb-3 mt-4">Investment Management</h3>
            <p className="text-gray-600 mb-4">Ongoing support to manage your property, including rentals, maintenance, and performance tracking.</p>
            <Link to="/contact" className="text-estate-blue font-medium hover:text-estate-darkBlue inline-flex items-center">
              Management Details <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentGuide;
