import React, { useEffect, useState } from 'react';

const BlogHeader = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Array of hero images for the slideshow
  const heroImages = [
    '/lovable-uploads/Bridgefort County - Ikota .jpg',
    '/lovable-uploads/ba3b8490-e83f-477b-b729-b617da515b2c.png',
    '/lovable-uploads/f27b5aee-88b8-457a-ba3a-45bff68f8d85.png',
    '/lovable-uploads/d6f71783-c6ac-4ff8-885e-f4290eba3780.png',
    '/lovable-uploads/Precious Gardens Estate.jpg',
    '/lovable-uploads/Precious.png'
  ];
  
  // Auto-slide every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroImages.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative">
      <div className="h-[40vh] bg-cover bg-center transition-all duration-1000 ease-in-out" style={{
        backgroundImage: `url(${heroImages[currentSlide]})`
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50 flex items-center">
          <div className="container-custom text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">PWAN Bridgefort Blog</h1>
            <p className="text-xl max-w-2xl">
              Stay updated with the latest trends, events, and opportunities in Nigerian real estate.
            </p>
          </div>
        </div>
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-8 mx-1 rounded-full ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default BlogHeader;
