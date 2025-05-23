
import React from 'react';

const AboutHero = () => {
  return (
    <section className="relative">
      <div className="h-[40vh] bg-cover bg-center" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)'
    }}>
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center">
          <div className="container-custom text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">About PWAN Bridgefort</h1>
            <p className="text-xl max-w-2xl">Learn about our mission, vision, and the team behind Nigeria's leading real estate investment company.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
