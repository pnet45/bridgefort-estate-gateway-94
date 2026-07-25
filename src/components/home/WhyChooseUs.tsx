import React from 'react';
import { Award, Shield, Wallet, Clock } from 'lucide-react';

const reasons = [
  {
    icon: Award,
    title: 'Expertise',
    body: 'With our years of experience and knowledge in the Nigerian real estate market.'
  },
  {
    icon: Shield,
    title: 'Security',
    body: 'All properties have verified titles, surveys and necessary documentation.'
  },
  {
    icon: Wallet,
    title: 'High Returns',
    body: 'Our properties consistently deliver above-market returns for investors.'
  },
  {
    icon: Clock,
    title: 'Support',
    body: 'Dedicated customer service and after-sales support for all clients.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-br from-estate-darkBlue via-estate-blue to-estate-purpleLight">
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white font-display">
            Why Choose Bridgefort Homes Development Ltd
          </h2>
          <p className="max-w-2xl mx-auto text-white/80">
            We are committed to providing exceptional service and investment opportunities.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map(({ icon: Icon, title, body }, index) => (
            <div
              key={title}
              className="glass-card rounded-2xl p-6 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-white/15 border border-white/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Icon size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
              <p className="text-white/80">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
