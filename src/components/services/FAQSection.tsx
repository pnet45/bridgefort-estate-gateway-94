
import React from 'react';

const FAQSection = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about real estate investments with PWAN Bridgefort.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">What is the minimum investment amount?</h3>
            <p className="text-gray-600">Our investment packages start from ₦500,000, depending on the property type and location. We also offer flexible payment plans to make investing more accessible.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">How secure are real estate investments in Nigeria?</h3>
            <p className="text-gray-600">Real estate remains one of the most secure investment options in Nigeria. At PWAN Bridgefort, we ensure all properties have verified titles and necessary documentation to protect your investment.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">What returns can I expect from my investment?</h3>
            <p className="text-gray-600">While returns vary based on property type and location, our residential properties typically yield 8-12% annual rental returns, with capital appreciation of 15-30% annually in prime locations.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Can I invest if I'm based outside Nigeria?</h3>
            <p className="text-gray-600">Yes, we have many international investors. We provide virtual consultations, digital documentation, and property management services specifically designed for overseas investors.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">How do you handle property management?</h3>
            <p className="text-gray-600">Our property management services include tenant procurement, rent collection, property maintenance, and regular performance reports. We handle everything so you can enjoy passive income without hassle.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
