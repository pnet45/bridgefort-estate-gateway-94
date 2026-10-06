import React, { useEffect, useState } from 'react';
import { ArrowDown, BookOpen, Clock3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const heroImages = [
  '/lovable-uploads/Bridgefort County - Ikota .jpg',
  '/lovable-uploads/ba3b8490-e83f-477b-b729-b617da515b2c.png',
  '/lovable-uploads/f27b5aee-88b8-457a-ba3a-45bff68f8d85.png',
  '/lovable-uploads/d6f71783-c6ac-4ff8-885e-f4290eba3780.png',
  '/lovable-uploads/Precious Gardens Estate.jpg',
];

const BlogHeader: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % heroImages.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 pt-[88px] lg:pt-[104px]">
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full min-h-[560px] w-full object-cover transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/35" />
      </div>

      <div className="container-custom relative z-10 flex min-h-[560px] items-center py-16 md:py-24">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200 backdrop-blur-md">
            <Sparkles className="h-4 w-4" /> The Bridgefort Journal
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl md:text-7xl">
            Property ideas, market insight and stories that help you move smarter.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
            Practical real estate insights, Bridgefort news, investment education, client stories and opportunities — written for people making real property decisions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#latest" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100">
              Read latest stories <ArrowDown className="h-4 w-4" />
            </a>
            <Link to="/properties" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15">
              Explore properties
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <BookOpen className="h-5 w-5 text-violet-200" />
              <p className="mt-3 text-xs uppercase tracking-wider text-white/60">Stories</p>
              <p className="mt-1 font-bold text-white">Real estate & life</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <Clock3 className="h-5 w-5 text-violet-200" />
              <p className="mt-3 text-xs uppercase tracking-wider text-white/60">Format</p>
              <p className="mt-1 font-bold text-white">Quick, useful reads</p>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md sm:block">
              <Sparkles className="h-5 w-5 text-violet-200" />
              <p className="mt-3 text-xs uppercase tracking-wider text-white/60">From Bridgefort</p>
              <p className="mt-1 font-bold text-white">News & opportunities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
        {heroImages.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all ${currentSlide === index ? 'w-10 bg-white' : 'w-4 bg-white/40'}`}
            aria-label={`Show blog hero image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default BlogHeader;
