
import * as React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "./ui/aspect-ratio";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Define image urls
const carouselImages = [
  'public/lovable-uploads/42de3711-6788-43ea-9ce8-d618293b14e5.png',
  'public/lovable-uploads/84195595-cefb-44c6-90c9-1d17b754d992.png',
  'public/lovable-uploads/dfe26401-712e-4dfd-b08f-69abac4fec61.png'
];

// Define captions for carousel items
const carouselCaptions = [{
  title: "Your Gateway to Premium Real Estate Investments",
  subtitle: "Discover exceptional properties and secure high-yield investment opportunities with PWAN Bridgefort."
}, {
  title: "Premium Real Estate Development",
  subtitle: "Building quality homes and investment opportunities across Nigeria."
}, {
  title: "Modern Living Spaces",
  subtitle: "Contemporary designs with comfort and elegance in mind."
}];

const HomeCarousel = () => {
  const [api, setApi] = React.useState<{
    scrollNext: () => void;
  } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();

  // Auto-scroll functionality
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
      setCurrentIndex(prevIndex => prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [api]);

  return (
    <Carousel className="w-full h-[70vh]" setApi={setApi}>
      <CarouselContent className="h-full">
        {/* Images with captions */}
        {carouselImages.map((imageUrl, index) => (
          <CarouselItem key={`image-${index}`} className="h-full">
            <div className="relative h-full">
              <div 
                className="h-full bg-cover bg-center" 
                style={{
                  backgroundImage: `url(${imageUrl})`
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
                  <div className="container-custom text-white">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-3xl leading-tight animate-fade-in">
                      {carouselCaptions[index]?.title}
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl mb-8 max-w-2xl animate-fade-in" style={{
                      animationDelay: '200ms'
                    }}>
                      {carouselCaptions[index]?.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {!isMobile && (
        <>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </>
      )}
    </Carousel>
  );
};

export default HomeCarousel;
