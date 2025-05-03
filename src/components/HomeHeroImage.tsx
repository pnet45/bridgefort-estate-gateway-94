
import React from "react";

const HomeHeroImage = () => {
  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      <div 
        className="h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(public/lovable-uploads/e54becce-307f-4015-a09d-f90aad541936.png)`,
          backgroundPosition: 'center center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
          <div className="container-custom text-white">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-3xl leading-tight animate-fade-in">
              Your Gateway to Premium Real Estate Investments
            </h1>
            <p className="text-base md:text-xl lg:text-2xl mb-8 max-w-2xl animate-fade-in" style={{
              animationDelay: '200ms'
            }}>
              Discover exceptional properties and secure high-yield investment opportunities with PWAN Bridgefort.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHeroImage;
