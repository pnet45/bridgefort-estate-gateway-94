
import React, { useEffect, useState } from "react";

const HomeHeroImage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Array of hero images for the slideshow
  const heroImages = [
    '/lovable-uploads/Homeslider2.png',
    '/lovable-uploads/Homeslider.png',
    '/lovable-uploads/PropertyHero.png',
    '/lovable-uploads/Homeslider3.png',
    '/lovable-uploads/Homeslider4.png'
  ];
  
  const heroTitle = "PWAN BRIDGEFORT ...Rebuilding the Future!";
  const heroSubtitle = "At PWAN Bridgefort, we're not just selling properties—we're building legacies.";

  // Auto-slide every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroImages.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh]">
      <div className="h-full">
        <div 
          className="h-full bg-cover bg-center transition-all duration-1000 ease-in-out" 
          style={{
            backgroundImage: `url(${heroImages[currentSlide]})`
          }}
        >
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
            <div className="container-custom text-white px-4">
              <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 max-w-3xl leading-tight animate-fade-in">
                {heroTitle}
              </h1>
              <p className="text-base md:text-lg lg:text-xl xl:text-2xl mb-6 md:mb-8 max-w-2xl animate-fade-in" style={{
                animationDelay: '200ms'
              }}>
                {heroSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-6 md:w-8 mx-1 rounded-full transition-colors duration-300 ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeHeroImage;
