
import React from "react";
import { useMotivationSlider } from "./motivation/useMotivationSlider";
import MotivationCard from "./motivation/MotivationCard";
import MotivationBadge from "./motivation/MotivationBadge";
import MotivationIndicators from "./motivation/MotivationIndicators";

const MondayMotivationHero = () => {
  const { current, setCurrent, loadingImages, fade, currentData } = useMotivationSlider();

  if (loadingImages) {
    return (
      <section className="relative w-full h-[32vh] md:h-[45vh] lg:h-[50vh] mb-8 bg-gray-200 flex items-center justify-center">
        <div className="text-estate-blue font-bold text-xl animate-pulse-glow">
          Loading inspiration...
        </div>
      </section>
    );
  }

  const { title, text, author, image, link } = currentData as any;
  const isRiseAndGrind = title.startsWith("Rise and Grind");
  const isNewWeek = title.startsWith("New Week, Fresh Listings, Fresh Leads");

  if (isRiseAndGrind || isNewWeek) {
    return (
      <section className="relative w-full h-auto min-h-[32vh] md:min-h-[45vh] lg:min-h-[50vh] mb-8 animate-fade-in">
        <MotivationCard
          title={title}
          text={text}
          author={author}
          image={image}
          fade={fade}
        />
        <MotivationBadge />
        <MotivationIndicators current={current} onSlideChange={setCurrent} />
      </section>
    );
  }

  return (
    <section className="relative w-full h-[32vh] md:h-[45vh] lg:h-[50vh] mb-8 animate-fade-in">
      <MotivationCard
        title={title}
        text={text}
        author={author}
        image={image}
        fade={fade}
        link={link}
      />
      <MotivationBadge />
      <MotivationIndicators current={current} onSlideChange={setCurrent} />
    </section>
  );
};

export default MondayMotivationHero;
