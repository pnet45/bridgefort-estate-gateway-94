
import React, { useEffect, useState } from "react";

// Updated images as per user requests
const motivationData = [
  {
    id: "motivation1",
    title: "New Week, Fresh Listings, Fresh Leads",
    text: "Lagos never sleeps, and neither do we. Let's turn site visits into signed deals. Stay sharp, stay selling.",
    author: "Dalvin Silva",
    image: "/lovable-uploads/Happy new week.png", // <-- changed image
  },
  {
    id: "motivation2",
    title: "Rise and Grind: Real Estate Waits for No One",
    text: "It’s Monday – let’s show up and close strong. In real estate, consistent action and persistent follow-up are the keys to success.",
    author: "Dalvin Silva",
    image: "/lovable-uploads/rise-and-grind-real-estae-waits-for-no-1.png", // confirmed per prior request
  },
];

const preloadImages = (srcs: string[], onComplete: () => void) => {
  let loaded = 0;
  srcs.forEach((src) => {
    const img = new window.Image();
    img.onload = () => {
      loaded += 1;
      if (loaded === srcs.length) onComplete();
    };
    img.onerror = () => {
      console.error("Failed to load image:", src);
      loaded += 1;
      if (loaded === srcs.length) onComplete();
    };
    img.src = src;
  });
};

const MondayMotivationHero = () => {
  const [current, setCurrent] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);
  useEffect(() => {
    const imagePaths = motivationData.map((d) => d.image);
    preloadImages(imagePaths, () => setLoadingImages(false));
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % motivationData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const { title, text, author, image } = motivationData[current];

  if (loadingImages) {
    return (
      <section className="relative w-full h-[32vh] md:h-[45vh] lg:h-[50vh] mb-8 bg-gray-200 flex items-center justify-center">
        <div className="text-estate-blue font-bold text-xl animate-pulse-glow">
          Loading inspiration...
        </div>
      </section>
    );
  }

  // Custom split layout for "Rise and Grind" (text left/image right)
  const isRiseAndGrind = title.startsWith("Rise and Grind");
  if (isRiseAndGrind) {
    return (
      <section className="relative w-full h-auto min-h-[32vh] md:min-h-[45vh] lg:min-h-[50vh] mb-8 animate-fade-in">
        <div className="container-custom px-2 md:px-6 py-6 md:py-10 flex flex-col md:flex-row items-center bg-gradient-to-l from-estate-blue/80 to-estate-blue/60 rounded-xl shadow-lg">
          {/* Text (left) */}
          <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col justify-center items-start text-white py-4 pr-0 md:pr-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 animate-fade-in text-left">
              {title}
            </h2>
            <p
              className="text-lg md:text-2xl mb-4 animate-fade-in text-left"
              style={{ animationDelay: "200ms" }}
            >
              {text}
            </p>
            <p
              className="font-semibold text-estate-blue bg-white/80 rounded px-3 py-1 inline-block animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              By {author} <span className="text-xs ml-1">Monday Motivation</span>
            </p>
          </div>
          {/* Image (right) */}
          <div className="w-full md:w-1/3 lg:w-1/2 flex justify-center md:justify-end py-4">
            <img
              src={image}
              alt={title}
              className="rounded-lg shadow-lg max-h-[260px] md:max-h-[320px] object-contain bg-white/80"
              style={{ minWidth: "180px", maxWidth: "100%", width: "320px" }}
            />
          </div>
        </div>
        {/* Badge */}
        <div className="absolute top-3 right-3 text-white px-4 py-1 rounded-full shadow font-semibold text-sm animate-scale-in bg-cyan-500 z-10">
          Monday Motivation
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
          {motivationData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`mx-1 h-2 w-8 rounded-full ${
                current === idx ? "bg-estate-blue" : "bg-white/60"
              } transition-colors`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>
    );
  }

  // Custom split layout for "New Week, Fresh Listings, Fresh Leads" (image left, text right)
  const isNewWeek = title.startsWith("New Week, Fresh Listings, Fresh Leads");
  if (isNewWeek) {
    return (
      <section className="relative w-full h-auto min-h-[32vh] md:min-h-[45vh] lg:min-h-[50vh] mb-8 animate-fade-in">
        <div className="container-custom px-2 md:px-6 py-6 md:py-10 flex flex-col md:flex-row items-center bg-gradient-to-r from-estate-blue/80 to-estate-blue/60 rounded-xl shadow-lg">
          {/* Image (left) */}
          <div className="w-full md:w-1/3 lg:w-1/2 flex justify-center md:justify-start py-4">
            <img
              src={image}
              alt={title}
              className="rounded-lg shadow-lg max-h-[260px] md:max-h-[320px] object-contain bg-white/80"
              style={{ minWidth: "180px", maxWidth: "100%", width: "320px" }}
            />
          </div>
          {/* Text (right) */}
          <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col justify-center items-start text-white py-4 pl-0 md:pl-8 md:text-left text-left">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 animate-fade-in">{title}</h2>
            <p
              className="text-lg md:text-2xl mb-4 animate-fade-in text-left"
              style={{ animationDelay: "200ms" }}
            >
              {text}
            </p>
            <p
              className="font-semibold text-estate-blue bg-white/80 rounded px-3 py-1 inline-block animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              By {author} <span className="text-xs ml-1">Monday Motivation</span>
            </p>
          </div>
        </div>
        {/* Badge */}
        <div className="absolute top-3 right-3 text-white px-4 py-1 rounded-full shadow font-semibold text-sm animate-scale-in bg-cyan-500 z-10">
          Monday Motivation
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
          {motivationData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`mx-1 h-2 w-8 rounded-full ${
                current === idx ? "bg-estate-blue" : "bg-white/60"
              } transition-colors`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>
    );
  }

  // Default fallback layout for unexpected data
  return (
    <section className="relative w-full h-[32vh] md:h-[45vh] lg:h-[50vh] mb-8 animate-fade-in">
      <div
        className="h-full w-full bg-cover bg-center transition-all duration-1000 ease-in-out relative"
        style={{
          backgroundImage: `url(${image})`,
          backgroundColor: "#142447",
        }}
      >
        <img
          src={image}
          alt={title}
          className="absolute pointer-events-none opacity-0"
          aria-hidden="true"
          width={2}
          height={2}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/25 flex items-center rounded-bl-xl rounded-2xl my-0 py-[12px] bg-cyan-700">
          <div className="container-custom px-4 text-white">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-bold mb-2 animate-fade-in">
                {title}
              </h2>
              <p
                className="text-lg md:text-2xl mb-4 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                {text}
              </p>
              <p
                className="font-semibold text-estate-blue bg-white/70 rounded px-3 py-1 inline-block animate-fade-in"
                style={{ animationDelay: "400ms" }}
              >
                By {author} <span className="text-xs ml-1">Monday Motivation</span>
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-3 right-3 text-white px-4 py-1 rounded-full shadow font-semibold text-sm animate-scale-in bg-cyan-500">
          Monday Motivation
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          {motivationData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`mx-1 h-2 w-8 rounded-full ${
                current === idx ? "bg-estate-blue" : "bg-white/60"
              } transition-colors`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MondayMotivationHero;
