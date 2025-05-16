
import React from 'react';
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Buy2SellIntroProps {
  isLoaded: boolean;
}

const Buy2SellIntro: React.FC<Buy2SellIntroProps> = ({ isLoaded }) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className={`${isLoaded ? 'animate-fade-in' : 'opacity-0'} transition-all duration-500 space-y-4`}>
            <h2 className="text-3xl font-bold mb-4 text-estate-blue">What is Buy to Sell?</h2>
            <p className="text-lg">
              Buy to Sell is a fast and reliable source of income while trading with PWAN Group. Real Estate serves more than residential purposes. With Buy to Sell, you can buy from our Estates and we help you sell the property in 12 or 24 months for as high as 40% profit. This is the best mode of passive income that allows you to earn without risks as your income is certain from the moment you buy.
            </p>
            <Button 
              className="bg-estate-red hover:bg-red-700 mt-4"
              onClick={() => document.getElementById('investment-options')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore for More Options
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Carousel className={`w-full max-w-md ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
              <CarouselContent>
                <CarouselItem>
                  <img 
                    src="/lovable-uploads/7134ea24-5432-4742-afa9-4a5b736dd8eb.png" 
                    alt="Buy2Sell 6 Months Investment" 
                    className="rounded-lg shadow-xl w-full h-auto hover:scale-105 transition-transform duration-500"
                  />
                </CarouselItem>
                <CarouselItem>
                  <img 
                    src="/lovable-uploads/cc5f0271-0388-40f9-8e69-1fbd5ea1e606.png" 
                    alt="Buy2Sell 12 Months Investment" 
                    className="rounded-lg shadow-xl w-full h-auto hover:scale-105 transition-transform duration-500"
                  />
                </CarouselItem>
                <CarouselItem>
                  <img 
                    src="/lovable-uploads/aeaad90d-a317-4a58-8cba-912498e233e5.png" 
                    alt="Buy2Sell ROI Table" 
                    className="rounded-lg shadow-xl w-full h-auto hover:scale-105 transition-transform duration-500"
                  />
                </CarouselItem>
                <CarouselItem>
                  <img 
                    src="/lovable-uploads/2f745990-7323-42b1-87f3-eb1a3f2db0ba.png" 
                    alt="Flourish Luxury Villas" 
                    className="rounded-lg shadow-xl w-full h-auto hover:scale-105 transition-transform duration-500"
                  />
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-1" />
              <CarouselNext className="right-1" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Buy2SellIntro;
