
import React, { useEffect, useState } from "react";

// Updated with both uploaded images
const motivationData = [
  {
    id: "motivation1",
    title: "New Week, Fresh Listings, Fresh Leads",
    text: "Lagos never sleeps, and neither do we. Let's turn site visits into signed deals. Stay sharp, stay selling.",
    author: "Dalvin Silva",
    image: "/lovable-uploads/774f5bb1-3f2f-4c91-9149-9c6facac4756.png",
  },
  {
    id: "motivation2",
    title: "Rise and Grind: Real Estate Waits for No One",
    text: "It’s Monday – let’s show up and close strong. In real estate, consistent action and persistent follow-up are the keys to success.",
    author: "Dalvin Silva",
    image: "/lovable-uploads/f01a111e-6d07-4fa5-9b33-b646f096419a.png",
  },
];

const MondayMotivationHero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % motivationData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { title, text, author, image } = motivationData[current];

  return (
    <section className="relative w-full h-[32vh] md:h-[45vh] lg:h-[50vh] mb-8 animate-fade-in">
      <div 
        className="h-full w-full bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/25 flex items-center">
          <div className="container-custom px-4 text-white">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-bold mb-2 animate-fade-in">{title}</h2>
              <p className="text-lg md:text-2xl mb-4 animate-fade-in" style={{animationDelay: '200ms'}}>{text}</p>
              <p className="font-semibold text-estate-blue bg-white/70 rounded px-3 py-1 inline-block animate-fade-in" style={{animationDelay: '400ms'}}>
                By {author} <span className="text-xs ml-1">Monday Motivation</span>
              </p>
            </div>
          </div>
        </div>
        {/* Badge as a feature tag */}
        <div className="absolute top-3 right-3 bg-estate-blue text-white px-4 py-1 rounded-full shadow font-semibold text-sm animate-scale-in">
          Monday Motivation
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          {motivationData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`mx-1 h-2 w-8 rounded-full ${current === idx ? "bg-estate-blue" : "bg-white/60"} transition-colors`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MondayMotivationHero;
