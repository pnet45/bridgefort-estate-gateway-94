
import React from "react";
import { useNavigate } from "react-router-dom";

interface MotivationCardProps {
  title: string;
  text: string;
  author: string;
  image: string;
  fade: boolean;
  link?: string;
}

const MotivationCard = ({ title, text, author, image, fade, link }: MotivationCardProps) => {
  const navigate = useNavigate();
  const isRiseAndGrind = title.startsWith("Rise and Grind");
  const isNewWeek = title.startsWith("New Week, Fresh Listings, Fresh Leads");

  if (isRiseAndGrind) {
    return (
      <div className={`container-custom px-2 md:px-6 py-6 md:py-10 flex flex-col md:flex-row items-center bg-gradient-to-l from-estate-blue/80 to-estate-blue/60 rounded-xl shadow-lg transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
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
        <div className="w-full md:w-1/3 lg:w-1/2 flex justify-center md:justify-end py-4">
          <img
            src={image}
            alt={title}
            className="rounded-lg shadow-lg max-h-[260px] md:max-h-[320px] object-contain bg-white/80"
            style={{ minWidth: "180px", maxWidth: "100%", width: "320px" }}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/lovable-uploads/Happy new week.png';
            }}
          />
        </div>
      </div>
    );
  }

  if (isNewWeek) {
    return (
      <div className={`container-custom px-2 md:px-6 py-6 md:py-10 flex flex-col md:flex-row items-center bg-gradient-to-r from-estate-blue/80 to-estate-blue/60 rounded-xl shadow-lg transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
        <div className="w-full md:w-1/3 lg:w-1/2 flex justify-center md:justify-start py-4">
          <img
            src={image}
            alt={title}
            className="rounded-lg shadow-lg max-h-[260px] md:max-h-[320px] object-contain bg-white/80"
            style={{ minWidth: "180px", maxWidth: "100%", width: "320px" }}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/lovable-uploads/Happy new week.png';
            }}
          />
        </div>
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
    );
  }

  // Default fallback layout
  return (
    <div
      className={`h-full w-full relative transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"} ${link ? "cursor-pointer" : ""}`}
      onClick={link ? () => navigate(link) : undefined}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/lovable-uploads/Happy new week.png';
        }}
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
            {link && (
              <span className="ml-3 inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold animate-fade-in" style={{ animationDelay: "600ms" }}>
                Read Full Article →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationCard;
