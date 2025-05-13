
import * as React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useEffect, useState } from "react";

// Define carousel items with images and captions
const carouselItems = [
  {
    imageUrl: '/lovable-uploads/efac3aed-0d16-4fb4-87b9-20503053b989.png',
    title: "PWAN Bridgefort. ...Rebuilding the Future!",
    subtitle: "At PWAN Bridgefort, we're not just selling properties—we're building legacies."
  },
  {
    imageUrl: '/lovable-uploads/badb1224-b4a4-45c3-a6d8-65d8c475945d.png',
    title: "Your Gateway to Premium Real Estate Investments",
    subtitle: "Discover exceptional properties and secure high-yield investment opportunities with PWAN Bridgefort."
  },
  {
    imageUrl: '/lovable-uploads/878adc14-a726-4610-bcb7-4fe7a8830b85.png',
    title: "PWAN Bridgefort. ...Rebuilding the future!",
    subtitle: "At PWAN Bridgefort, we're not just selling properties—we're building legacies."
  },
  {
    imageUrl: '/lovable-uploads/88175f75-2598-4e44-8656-9fe02fd3656c.png',
    title: "Your Gateway to Premium Real Estate Investments",
    subtitle: "Discover exceptional properties and secure high-yield investment opportunities with PWAN Bridgefort."
  }
];

const HomeHeroImage = () => {
  const [api, setApi] = React.useState<{
    scrollNext: () => void;
  } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll functionality
  useEffect(() => {
    if (!api) return;
    
    const interval = setInterval(() => {
      api.scrollNext();
      setCurrentIndex(prevIndex => 
        prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="relative w-full h-[80vh] md:h-[90vh]">
      <Carousel className="w-full h-full" setApi={setApi}>
        <CarouselContent className="h-full">
          {carouselItems.map((item, index) => (
            <CarouselItem key={`hero-${index}`} className="h-full">
              <div className="relative h-full">
                <div 
                  className="h-full bg-cover bg-center" 
                  style={{
                    backgroundImage: `url(${item.imageUrl})`
                  }}
                >
                  {/* Dark overlay for better text visibility */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
                    <div className="container-custom text-white">
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl leading-tight animate-fade-in">
                        {item.title}
                      </h1>
                      <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl animate-fade-in" style={{
                        animationDelay: '200ms'
                      }}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Custom indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
        {carouselItems.map((_, index) => (
          <span 
            key={`indicator-${index}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === index ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeHeroImage;
