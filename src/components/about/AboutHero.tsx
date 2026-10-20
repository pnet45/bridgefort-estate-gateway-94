import React from 'react';

const AboutHero = () => (
  <section className="relative pt-[88px] lg:pt-[104px]">
    <div
      className="relative flex min-h-[340px] items-center overflow-hidden bg-slate-950 bg-cover bg-center py-14 sm:min-h-[400px] md:py-20 lg:min-h-[440px]"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />
      <div className="container-custom relative z-10 w-full text-white">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-amber-300 sm:text-sm">Our story • Our values • Our people</p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
          About Bridgefort Homes Development Ltd
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8 md:text-xl">
          We help people take confident steps towards property ownership through trusted guidance, clear processes and long-term service.
        </p>
      </div>
    </div>
  </section>
);

export default AboutHero;
