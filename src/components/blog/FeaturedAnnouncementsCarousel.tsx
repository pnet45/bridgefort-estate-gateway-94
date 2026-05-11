import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { announcementItems } from "@/data/announcements";

const FeaturedAnnouncementsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const animations = ["animate-fade-in", "animate-scale-in", "animate-slide-in-right"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 2) % announcementItems.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentItems = [
    announcementItems[currentIndex],
    announcementItems[(currentIndex + 1) % announcementItems.length],
  ];

  return (
    <section className="py-10 bg-white">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Featured Announcements</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg overflow-hidden shadow bg-gray-50 flex flex-col sm:flex-row transition-all ${animations[Math.floor(Math.random() * animations.length)]}`}
            >
              <div className="w-full sm:w-2/5 h-56 sm:h-auto sm:min-h-[260px] bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/lovable-uploads/PropertyHero.png';
                  }}
                />
              </div>
              <div className="w-full sm:w-3/5 p-5 sm:p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-lg sm:text-xl text-estate-blue mb-2 line-clamp-3">{item.title}</h3>
                <p className="text-gray-700 mb-4 flex-grow text-sm sm:text-base line-clamp-4">{item.text}</p>
                <Link
                  to={`/announcements/${item.id}`}
                  className="self-start bg-estate-blue text-white px-4 py-2 rounded shadow hover:bg-estate-blue/90 text-sm font-medium transition-colors"
                >
                  Read Full Article
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(announcementItems.length / 2) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * 2)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === i * 2 ? 'bg-estate-blue w-8' : 'bg-gray-300 w-2'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAnnouncementsCarousel;
