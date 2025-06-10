
import React, { useEffect, useState } from "react";

const HomeHeroImage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Array of hero images for the slideshow
  const heroImages = [
    '/lovable-uploads/Homeslider2.png',
    '/lovable-uploads/Homeslider.png',
    '/lovable-uploads/Homeslider3.png',
    '/lovable-uploads/Homeslider4.png'
  ];
  
  const heroTitle = "PWAN Bridgefort. ...Rebuilding the Future!";
  const heroSubtitle = "At PWAN Bridgefort, we're not just selling properties—we're building legacies.";

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative w-full h-[80vh] md:h-[90vh]">
      <div className="h-full">
        <div 
          className="h-full bg-cover bg-center transition-all duration-1000 ease-in-out" 
          style={{
            backgroundImage: `url(${heroImages[currentSlide]})`
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
      
      {/* Slide indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-8 mx-1 rounded-full transition-colors duration-300 ${
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
