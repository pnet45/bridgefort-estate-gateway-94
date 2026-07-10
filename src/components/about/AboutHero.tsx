import React from 'react';
const AboutHero = () => {
  return <section className="relative pt-16 lg:pt-20">
      <div style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)'
    }} className="h-[40vh] bg-cover bg-center bg-indigo-950">
        <div className="absolute inset-0 hero-overlay flex items-center my-0">
          <div className="container-custom text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 my-[6px] text-gradient">About Bridgefort Homes Development Ltd</h2>
            <p className="text-xl max-w-2xl my-0 hero-text">Learn about our mission, vision, and the team behind Nigeria's leading real estate investment company.</p>
          </div>
        </div>
      </div>
    </section>;
};
export default AboutHero;