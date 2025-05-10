
import React from 'react';

const TeamPhoto = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Our Team</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            The PWAN Bridgefort team brings together expertise across real estate development, finance, marketing, and customer service.
          </p>
        </div>
        
        <div className="rounded-lg overflow-hidden shadow-xl">
          <img 
            src="/lovable-uploads/Homeslider.png" 
            alt="PWAN Bridgefort Team" 
            className="w-full h-auto" 
          />
        </div>
      </div>
    </section>
  );
};

export default TeamPhoto;
