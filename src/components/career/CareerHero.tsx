
import React from 'react';

const CareerHero = () => {
  return (
    <section className="relative bg-estate-darkBlue py-24 md:py-32">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <img 
          src="/lovable-uploads/c46fb41f-b745-4000-839c-c31bc4f12653.png" 
          alt="Career at PWAN Bridgefort" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Build Your Career With Us
          </h1>
          <p className="text-xl text-gray-100 mb-8">
            Join our dynamic team and help shape the future of real estate in Nigeria. 
            Discover exciting opportunities to grow, innovate, and make a difference.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="#open-positions" 
              className="btn-primary inline-flex items-center px-6"
            >
              View Open Positions
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a 
              href="#application-form" 
              className="btn-secondary"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerHero;
