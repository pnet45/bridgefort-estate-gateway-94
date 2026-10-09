import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HeroSlide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  display_order: number;
}

const FALLBACK_SLIDES = [
  '/lovable-uploads/ikoyi link bridge.png',
  '/lovable-uploads/Homeheroimage2222.png',
  '/lovable-uploads/PropertyHero.png',
];

const FALLBACK_TITLE = "Bridgefort Homes Development Ltd. ...Bringing your dreams home!";
const FALLBACK_SUBTITLE = "At Bridgefort Homes Development Ltd, we're not just selling properties—we're building legacies.";

const TEXT_EFFECTS = [
  'animate-fade-in',
  'animate-slide-in-right',
  'animate-scale-in',
  'animate-blur-in',
];

const HomeHeroImage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [textEffect, setTextEffect] = useState(TEXT_EFFECTS[0]);
  const [textKey, setTextKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('id, image_url, title, subtitle, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!cancelled && !error && data && data.length > 0) {
        setSlides(data);
      }
    };

    void fetchSlides();
    return () => { cancelled = true; };
  }, []);

  const sanitizeBrand = (s: string | null | undefined) =>
    (s || '').replace(/PWAN\s*Bridgefort(?:\s+Estates?\s*&\s*Investment\s*Ltd\.?)?/gi, 'Bridgefort Homes');

  const heroImages = slides.length > 0 ? slides.map(s => s.image_url) : FALLBACK_SLIDES;
  const currentSlideData = slides[currentSlide];
  const heroTitle = sanitizeBrand(currentSlideData?.title) || FALLBACK_TITLE;
  const heroSubtitle = sanitizeBrand(currentSlideData?.subtitle) || FALLBACK_SUBTITLE;

  useEffect(() => {
    if (heroImages.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
      setTextEffect(TEXT_EFFECTS[Math.floor(Math.random() * TEXT_EFFECTS.length)]);
      setTextKey(k => k + 1);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [heroImages.length]);

  const selectSlide = (index: number) => {
    setCurrentSlide(index);
    setTextEffect(TEXT_EFFECTS[Math.floor(Math.random() * TEXT_EFFECTS.length)]);
    setTextKey(k => k + 1);
  };

  return (
    <section className="relative left-1/2 h-[calc(100svh-88px)] min-h-[520px] max-h-[900px] w-screen max-w-none -translate-x-1/2 lg:h-[calc(100svh-104px)]">
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={heroImages[currentSlide]}
          alt="Property and estate developments by Bridgefort Homes Development Ltd"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={(e) => {
            const image = e.currentTarget;
            if (!image.src.endsWith('/lovable-uploads/PropertyHero.png')) {
              image.src = '/lovable-uploads/PropertyHero.png';
            }
          }}
        />

        <div className="hero-overlay-light absolute inset-0 flex items-end pb-24 sm:pb-24 md:items-center md:pb-10">
          <div className="container-custom w-full px-4 pb-safe pt-8 sm:px-6 md:pt-12">
            <div key={textKey} className={"w-full max-w-3xl " + textEffect} style={{ animationDuration: '0.6s' }}>
              <h1 className="mb-3 max-w-full break-words text-left text-2xl font-bold leading-tight text-gradient [overflow-wrap:anywhere] sm:text-3xl md:mb-5 md:text-4xl lg:text-5xl xl:text-6xl">
                {heroTitle}
              </h1>
              <p className="hero-text mb-5 max-w-2xl break-words text-left text-base leading-relaxed sm:text-lg md:mb-7 md:text-xl xl:text-2xl">
                {heroSubtitle}
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
                <a
                  href="/properties"
                  className="group inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-44 sm:px-7 md:text-base"
                >
                  Browse Properties
                </a>
                <a
                  href="/contact"
                  className="group inline-flex min-h-12 w-full items-center justify-center rounded-lg border-2 border-white bg-black/20 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-36 sm:px-7 md:text-base"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {heroImages.length > 1 && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 px-4 sm:bottom-2" role="group" aria-label="Choose hero image">
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSlide(index)}
                className="flex h-11 min-w-8 items-center justify-center rounded-full px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label={"Go to slide " + (index + 1)}
                aria-current={currentSlide === index ? 'true' : undefined}
              >
                <span className={"h-2 w-6 rounded-full transition-colors sm:w-8 " + (currentSlide === index ? 'bg-white' : 'bg-white/60')} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeHeroImage;
