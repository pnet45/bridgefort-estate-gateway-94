import React from 'react';
import { Award, Shield, Wallet, Clock } from 'lucide-react';

const WhyChooseUs = () => {
  return (
    <section className="section-padding bg-estate-blue text-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose PWAN Bridgefort</h2>
          <p className="max-w-2xl mx-auto opacity-90 text-white">We are committed to providing exceptional service and investment opportunities.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center animate-fade-in">
            <div className="bg-white bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Award size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Expertise</h3>
            <p className="opacity-90 text-white">With our years of experience and knowledge in the Nigerian real estate market.</p>
          </div>
          <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="bg-white bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Security</h3>
            <p className="opacity-90 text-white">All properties have verified titles, Surveys and necessary documentation.</p>
          </div>
          <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="bg-white bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Wallet size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">High Returns</h3>
            <p className="opacity-90 text-white">Our properties consistently deliver above-market returns for investors.</p>
          </div>
          <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="bg-white bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Support</h3>
            <p className="opacity-90 text-white">Dedicated customer service and after-sales support for all clients.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default WhyChooseUs;
