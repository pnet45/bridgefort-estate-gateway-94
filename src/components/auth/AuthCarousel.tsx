import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  image: string;
  webp?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    image: '/lovable-uploads/PropertyHero.png',
    eyebrow: 'Estates',
    title: 'Own Your Dream Estate',
    subtitle: 'Verified plots and homes across Nigeria, ready for allocation.',
  },
  {
    image: '/lovable-uploads/5k-daily-flyer.jpg',
    webp: '/lovable-uploads/5k-daily-flyer.webp',
    eyebrow: 'Promo',
    title: 'Become a Landlord with ₦5K Daily',
    subtitle: 'Save daily, weekly or monthly toward any of 8 flagship estates.',
  },
  {
    image: '/lovable-uploads/travels-flyer.jpg',
    webp: '/lovable-uploads/travels-flyer.webp',
    eyebrow: 'Travels',
    title: 'Travel & Work in Europe',
    subtitle: '100% guaranteed visa assistance — salary €500 to €1500 monthly.',
  },
  {
    image: '/lovable-uploads/agrovest-hero-1.jpg',
    webp: '/lovable-uploads/agrovest-hero-1.webp',
    eyebrow: 'Agrovest',
    title: 'Grow Wealth Through Agriculture',
    subtitle: 'Own a professionally managed farm plot from ₦800,000.',
  },
  {
    image: '/lovable-uploads/wealth-summit-2026-flyer.jpg',
    eyebrow: 'Wealth Summit',
    title: 'Bridgefort Wealth Summit',
    subtitle: 'Insights, networking and opportunities for serious investors.',
  },
];

const AUTO_ROTATE_MS = 5500;

interface AuthCarouselProps {
  /** Set false when the carousel fills its container edge-to-edge (e.g. a
   *  full-height side panel) — rounded corners only make sense when there's
   *  surrounding margin for them to read as a floating card. */
  rounded?: boolean;
}

const AuthCarousel: React.FC<AuthCarouselProps> = ({ rounded = true }) => {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex(((i % slides.length) + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-estate-blue/10 ${rounded ? 'rounded-3xl shadow-2xl' : ''}`}>
      {slides.map((slide, i) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <picture>
            {slide.webp && <source srcSet={slide.webp} type="image/webp" />}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 mb-2">
              {slide.eyebrow}
            </span>
            <h3 className="text-xl lg:text-2xl font-bold mb-1">{slide.title}</h3>
            <p className="text-sm text-white/80 max-w-sm">{slide.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Prev/Next controls */}
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthCarousel;
