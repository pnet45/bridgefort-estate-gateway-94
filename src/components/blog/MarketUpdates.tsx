import React, { useEffect, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const updates = [
  {
    title: "Market Update: Igbogun/Ebute-Okun Prices Rise",
    img: "/lovable-uploads/d6f71783-c6ac-4ff8-885e-f4290eba3780.png",
    details:
      "Our Igbogun and Ebute-Okun sites have seen price appreciation by 15% since Q4 2024, making now the perfect time for new investors to secure their plots.",
  },
  {
    title: "High Demand in New Estates",
    img: "/lovable-uploads/Precious.png",
    details:
      "Buyer turnout for the new phase launch of Precious Gardens Estate exceeded expectations – immediate allocation ongoing! Book a site visit today.",
  },
  {
    title: "Plot Allocation for Precious Garden Estate",
    img: "/lovable-uploads/Precious Gardens Estate.jpg",
    details:
      "Plot allocation at Precious Garden Estate is currently ongoing, with new landowners receiving documentation and enjoying prompt, guided allocation tours of their plots.",
  },
];

const MarketUpdates = () => {
  // Ref to keep Embla Carousel API instance for controls
  const carouselApi = useRef<any>(null);

  // Auto-slide every 7 seconds
  useEffect(() => {
    if (!carouselApi.current) return;
    const api = carouselApi.current;
    const interval = setInterval(() => {
      if (api && typeof api.scrollNext === "function") {
        api.scrollNext();
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [carouselApi.current]);

  return (
    <section className="py-10 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Market Updates</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
          }}
          setApi={api => { carouselApi.current = api; }}
          className="relative"
        >
          <CarouselContent className="!flex-row">
            {updates.map((u, i) => (
              <CarouselItem
                key={i}
                className="basis-full md:basis-1/2 px-3 transition-transform duration-700 animate-slide-in-right"
              >
                <div className="rounded-lg overflow-hidden shadow bg-white flex flex-col md:flex-row box-border h-full animate-[scale-in_0.4s_cubic-bezier(0.4,0,0.6,1)]">
                  <div className="md:w-1/3 h-44 md:h-52 overflow-hidden flex items-center">
                    <img
                      src={u.img}
                      alt={u.title}
                      className="w-full h-full object-cover rounded-md"
                      loading="lazy"
                    />
                  </div>
                  <div className="md:w-2/3 p-6 flex flex-col">
                    <h3 className="font-bold text-xl text-estate-blue mb-2">
                      {u.title}
                    </h3>
                    <p className="text-gray-700">{u.details}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <style>
          {`
          @media (max-width: 768px) {
            /* On mobile, show 1 card per view */
            .embla__slide { min-width: 100% !important; }
          }
        `}
        </style>
      </div>
    </section>
  );
};

export default MarketUpdates;
