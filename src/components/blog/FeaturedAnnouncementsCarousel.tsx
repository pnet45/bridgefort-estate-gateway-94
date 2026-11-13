import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { announcementItems } from "@/data/announcements";
import { useContentItems } from "@/hooks/useContentItems";

const FeaturedAnnouncementsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { items: cmsItems } = useContentItems({ page: "home", contentType: "announcement" });
  const announcements = useMemo(() => {
    if (!cmsItems.length) return announcementItems;
    return cmsItems.map(item => ({
      id: item.id,
      title: item.title,
      text: item.excerpt || item.body || "",
      img: item.image_url || "/lovable-uploads/PropertyHero.png",
    }));
  }, [cmsItems]);

  const animations = ["animate-fade-in", "animate-scale-in", "animate-slide-in-right"];
  const safeIndex = announcements.length ? currentIndex % announcements.length : 0;

  useEffect(() => {
    setCurrentIndex(0);
  }, [announcements.length]);

  useEffect(() => {
    if (announcements.length <= 2) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 2) % announcements.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  const currentItems = announcements.length
    ? [announcements[safeIndex], announcements[(safeIndex + 1) % announcements.length]].filter(Boolean)
    : [];

  return (
    <section className="py-10 bg-white" aria-label="Featured announcements">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Featured Announcements</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {currentItems.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-lg overflow-hidden shadow bg-gray-50 flex flex-col sm:flex-row transition-all ${animations[(safeIndex + index) % animations.length]}`}
            >
              <div className="w-full sm:w-2/5 h-40 sm:h-auto sm:min-h-[200px] sm:max-h-[240px] bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, 40vw"
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

        {announcements.length > 2 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(announcements.length / 2) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * 2)}
                className={`h-2 rounded-full transition-all ${safeIndex === i * 2 ? 'bg-estate-blue w-8' : 'bg-gray-300 w-2'}`}
                aria-label={`Go to announcement group ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedAnnouncementsCarousel;
