import * as React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "./ui/aspect-ratio";
import { useEffect, useState } from "react";

// Define image urls
const carouselImages = [''];

// Define captions for carousel items
const carouselCaptions = [{
  title: "Your Gateway to Premium Real Estate Investments",
  subtitle: "Discover exceptional properties and secure high-yield investment opportunities with PWAN Bridgefort."
}, {
  title: "Premium Real Estate Development",
  subtitle: "Building quality homes and investment opportunities across Nigeria."
}, {
  title: "PWAN BRIDGEFORT",
  subtitle: "Rebuilding the future..."
}, {
  title: "Modern Living Spaces",
  subtitle: "Contemporary designs with comfort and elegance in mind."
}, {
  title: "Sustainable Development",
  subtitle: "Creating eco-friendly communities that last generations."
}, {
  title: "Investment Excellence",
  subtitle: "Delivering consistent returns on real estate investments."
}];
const HomeCarousel = () => {
  const [api, setApi] = React.useState<{
    scrollNext: () => void;
  } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll functionality
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
      setCurrentIndex(prevIndex => prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [api]);
  return <Carousel className="w-full h-[70vh]" setApi={setApi}>
      <CarouselContent className="h-full">
        {/* Images with captions */}
        {carouselImages.map((imageUrl, index) => <CarouselItem key={`image-${index}`} className="h-full">
            <div className="relative h-full">
              <div className="h-full bg-cover bg-center" style={{
            backgroundImage: `url(${imageUrl})`
          }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
                  <div className="container-custom text-white">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight animate-fade-in">
                      {carouselCaptions[index]?.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in" style={{
                  animationDelay: '200ms'
                }}>
                      {carouselCaptions[index]?.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>)}

        {/* Video */}
        <CarouselItem className="h-full">
          <div className="relative h-full">
            <AspectRatio ratio={16 / 9} className="h-full">
              <video className="w-full h-full object-cover" src="" autoPlay muted loop />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center py-[2px]">
                <div className="container-custom text-white">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight animate-fade-in">
                    Premium Real Estate Development
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in" style={{
                  animationDelay: '200ms'
                }}>
                    Building quality homes and investment opportunities across Nigeria.
                  </p>
                </div>
              </div>
            </AspectRatio>
          </div>
        </CarouselItem>
      </CarouselContent>

      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>;
};
export default HomeCarousel;