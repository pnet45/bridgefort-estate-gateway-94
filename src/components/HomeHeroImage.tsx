import React, { useEffect, useState, useRef } from "react";
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
  const [loading, setLoading] = useState(true);
  const [textEffect, setTextEffect] = useState(TEXT_EFFECTS[0]);
  const [textKey, setTextKey] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) setSlides(data);
      setLoading(false);
    };
    fetchSlides();
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
    <section className="relative w-full h-[35vh] md:h-[70vh] lg:h-[80vh]">
      <div className="h-full relative overflow-hidden">
        <img 
          src={heroImages[currentSlide]} 
          alt={`Bridgefort Homes Development Ltd Hero Image ${currentSlide + 1}`}
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/lovable-uploads/PropertyHero.png'; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end pb-16 md:items-center md:pb-0">
          <div className="container-custom text-white px-4 pt-20 flex justify-start">
            <div key={textKey} className={`max-w-3xl ${textEffect}`} style={{ animationDuration: '0.8s' }}>
              <h1 className="text-lg md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 md:mb-6 leading-snug md:leading-tight text-left">
                {heroTitle}
              </h1>
              <p className="text-sm md:text-lg lg:text-xl xl:text-2xl mb-3 md:mb-8 max-w-2xl text-left" style={{ animationDelay: '200ms' }}>
                {heroSubtitle}
              </p>
              <div className="flex gap-4 text-center" style={{ animationDelay: '400ms' }}>
                <a href="/properties" className="inline-flex items-center bg-primary text-primary-foreground font-semibold px-5 py-2.5 md:px-8 md:py-3 rounded-lg transition-all duration-300 ease-out hover:bg-primary/90 hover:scale-110 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 text-sm md:text-base group">
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary-foreground after:transition-all after:duration-300 group-hover:after:w-full">Browse Properties</span>
                </a>
                <a href="/contact" className="inline-flex items-center border-2 border-white text-white font-semibold px-5 py-2.5 md:px-8 md:py-3 rounded-lg transition-all duration-300 ease-out hover:bg-white/20 hover:scale-110 hover:shadow-xl hover:shadow-white/30 hover:-translate-y-1 active:scale-95 text-sm md:text-base group">
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">Contact Us</span>
                </a>
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
