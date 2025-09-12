import React from 'react';
const TeamPhoto = () => {
  return <section className="section-padding bg-gray-50 my-0">
      <div className="container-custom">
        <div className="text-center mb-10 my-0">
          <h2 className="text-3xl font-bold mb-4">Our Team</h2>
          <p className="text-gray-600 max-w-3xl mx-auto my-[15px]">
            The PWAN Bridgefort team brings together expertise across real estate development, finance, marketing, and customer service.
          </p>
        </div>
        
        <div className="rounded-lg overflow-hidden shadow-xl">
          <img 
            src="/lovable-uploads/Homeslider.png" 
            alt="PWAN Bridgefort Team" 
            className="w-full h-auto object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/lovable-uploads/PropertyHero.png';
            }}
          />
        </div>
      </div>
    </section>;
};
export default TeamPhoto;