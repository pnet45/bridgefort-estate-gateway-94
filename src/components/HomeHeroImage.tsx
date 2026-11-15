import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { listenForPublicDataRevalidation, readPublicDataCache, subscribePublicDataCache, writePublicDataCache } from "@/lib/publicDataCache";

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
const HERO_SLIDES_CACHE_KEY = 'public-home-hero-slides';

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
  const [slides, setSlides] = useState<HeroSlide[]>(() => readPublicDataCache<HeroSlide[]>(HERO_SLIDES_CACHE_KEY) || []);
  const [textEffect, setTextEffect] = useState(TEXT_EFFECTS[0]);
  const [textKey, setTextKey] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('id, image_url, title, subtitle, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && active) {
        const nextSlides = data as HeroSlide[];
        writePublicDataCache(HERO_SLIDES_CACHE_KEY, nextSlides);
        setSlides(nextSlides);
        setCurrentSlide((current) => Math.min(current, Math.max(0, nextSlides.length - 1)));
      } else if (error) {
        // Keep the last successful public hero snapshot visible during outages.
        console.warn('Hero slides refresh failed; keeping cached slides.', error.message);
      }
    };

    void fetchSlides();
    const channel = supabase
      .channel('public-home-hero-slides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, () => {
        void fetchSlides();
      })
      .subscribe();

    const stopRevalidation = listenForPublicDataRevalidation(() => void fetchSlides());
    const stopCacheSync = subscribePublicDataCache<HeroSlide[]>(HERO_SLIDES_CACHE_KEY, (nextSlides) => {
      setSlides(nextSlides);
      setCurrentSlide((current) => Math.min(current, Math.max(0, nextSlides.length - 1)));
    });

    return () => {
      active = false;
      stopRevalidation();
      stopCacheSync();
      void supabase.removeChannel(channel);
    };
  }, []);

  const sanitizeBrand = (s: string | null | undefined) =>
    (s || '').replace(/PWAN\s*Bridgefort(?:\s+Estates?\s*&\s*Investment\s*Ltd\.?)?/gi, 'Bridgefort Homes');

  const heroImages = slides.length > 0 ? slides.map(s => s.image_url) : FALLBACK_SLIDES;
  const currentSlideData = slides[currentSlide];
  const heroTitle = sanitizeBrand(currentSlideData?.title) || FALLBACK_TITLE;
  const heroSubtitle = sanitizeBrand(currentSlideData?.subtitle) || FALLBACK_SUBTITLE;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      setTextEffect(TEXT_EFFECTS[Math.floor(Math.random() * TEXT_EFFECTS.length)]);
      setTextKey(k => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative w-screen max-w-none h-[min(50svh,420px)] min-h-[280px] sm:h-[min(60svh,560px)] lg:h-[calc(100vh-104px)] left-1/2 -translate-x-1/2">
      <div className="h-full relative overflow-hidden w-full">
        <img
          src={heroImages[currentSlide]}
          srcSet={`${heroImages[currentSlide]} 1x, ${heroImages[currentSlide]} 2x`}
          sizes="100vw"
          alt={`Bridgefort Homes Development Ltd Hero Image ${currentSlide + 1}`}
          className="w-full h-full object-cover object-center transition-all duration-1000 ease-in-out"
          loading={currentSlide === 0 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={currentSlide === 0 ? 'high' : 'low'}
          onError={(e) => { (e.target as HTMLImageElement).src = '/lovable-uploads/PropertyHero.png'; }}
        />
        {/* Preload next slide via hidden img for smoother transitions */}
        {heroImages[(currentSlide + 1) % heroImages.length] && (
          <img
            src={heroImages[(currentSlide + 1) % heroImages.length]}
            alt=""
            aria-hidden="true"
            className="hidden"
            loading="lazy"
            decoding="async"
          />
        )}

        <div className="absolute inset-0 bg-black/40 flex items-end pb-14 sm:pb-16 md:items-center md:pb-0">
          <div className="container-custom text-white px-4 pt-10 sm:pt-16 flex justify-start">
            <div key={textKey} className={`max-w-3xl w-full ${textEffect}`} style={{ animationDuration: '0.8s' }}>
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 md:mb-6 leading-tight text-left text-white">
                {heroTitle}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 md:mb-8 max-w-2xl text-left text-white" style={{ animationDelay: '200ms' }}>
                {heroSubtitle}
              </p>
              <div className="flex w-fit max-w-full flex-col items-start gap-2 text-left sm:flex-row sm:gap-3" style={{ animationDelay: '400ms' }}>
                <Link to="/properties" className="inline-flex min-h-10 w-fit max-w-full items-center justify-center whitespace-nowrap bg-primary px-4 py-2 text-left text-xs font-semibold text-primary-foreground rounded-lg transition-colors hover:bg-primary/90 active:scale-[.99] sm:text-sm md:px-6 md:py-3">
                  <span>Browse Properties</span>
                </Link>
                <Link to="/contact" className="inline-flex min-h-10 w-fit max-w-full items-center justify-center whitespace-nowrap border-2 border-white bg-black/20 px-4 py-2 text-left text-xs font-semibold text-white rounded-lg transition-colors hover:bg-white/15 active:scale-[.99] sm:text-sm md:px-6 md:py-3">
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => { setCurrentSlide(index); setTextEffect(TEXT_EFFECTS[Math.floor(Math.random() * TEXT_EFFECTS.length)]); setTextKey(k => k + 1); }}
            className={`h-2 w-6 md:w-8 mx-1 rounded-full transition-colors duration-300 ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeHeroImage;
