
import React, { useEffect, useState } from 'react';

const BlogHeader = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Array of hero images for the slideshow
  const heroImages = [
    '/lovable-uploads/984f2569-d567-46c5-a58e-7de931171e95.jpg',
    '/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png',
    '/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png',
    '/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png'
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
