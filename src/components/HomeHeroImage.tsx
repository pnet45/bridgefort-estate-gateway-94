
import React from "react";

const HomeHeroImage = () => {
  // Using a new image for the hero section
  const heroImage = '/lovable-uploads/Homeslider2.png';
  const heroTitle = "PWAN Bridgefort. ...Rebuilding the Future!";
  const heroSubtitle = "At PWAN Bridgefort, we're not just selling properties—we're building legacies.";

  return (
    <section className="relative w-full h-[80vh] md:h-[90vh]">
      <div className="h-full">
        <div 
          className="h-full bg-cover bg-center" 
          style={{
            backgroundImage: `url(${heroImage})`
          }}
        >
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl leading-tight animate-fade-in">
                {heroTitle}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl animate-fade-in" style={{
                animationDelay: '200ms'
              }}>
                {heroSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroImage;
