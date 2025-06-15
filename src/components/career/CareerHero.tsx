import React from 'react';
import { Link } from 'react-router-dom';
const CareerHero = () => {
  return <section className="relative">
      <div className="h-[50vh] bg-cover bg-center" style={{
      backgroundImage: 'url(/lovable-uploads/b006d931-462b-4646-97c9-0b2f3bc1d210.jpg)'
    }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
          <div className="container-custom text-white">
            <div className="max-w-3xl rounded-none mx-0 px-0 py-px my-px">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white animate-slide-in-left">
                Build Your Career With Us
              </h1>
              <p className="text-xl mb-8 animate-fade-in py-[16px] my-[45px]">
                Join Nigeria's leading real estate company and be part of a team that's 
                transforming the property investment landscape across the country.
              </p>
              <div className="flex flex-wrap gap-4 animate-scale-in">
                <Link to="#positions" className="btn-primary bg-estate-blue hover:bg-estate-darkBlue">
                  View Open Positions
                </Link>
                <Link to="/contact" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-estate-blue font-medium py-2 px-6 rounded transition duration-300">
                  Contact HR
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default CareerHero;