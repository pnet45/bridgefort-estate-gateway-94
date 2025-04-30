
import React from 'react';

const ServicesHero = () => {
  return (
    <section className="relative">
      <div className="h-[40vh] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
          <div className="container-custom text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Investment Services</h1>
            <p className="text-xl max-w-2xl">Discover our range of real estate investment opportunities designed to maximize your returns.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesHero;
