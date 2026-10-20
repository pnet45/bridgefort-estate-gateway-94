import React from 'react';

const VisionMission = () => (
  <section className="px-4 py-8 sm:px-6 md:py-14 lg:px-8">
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:gap-7 lg:grid-cols-2">
      <article className="h-full rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8 md:p-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Where we are going</p>
        <h2 className="mb-4 text-2xl font-bold text-estate-blue sm:text-3xl">Our Vision</h2>
        <p className="mb-5 text-lg font-medium italic leading-7 text-foreground sm:text-xl sm:leading-8">
          “To be a pioneering force in African real estate—bridging people to prosperity, one property at a time.”
        </p>
        <p className="leading-7 text-muted-foreground">
          Each project, territory and partnership is guided by our commitment to make property ownership more accessible, support financial empowerment and help build communities that last.
        </p>
      </article>
      <article className="h-full rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8 md:p-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">How we serve</p>
        <h2 className="mb-4 text-2xl font-bold text-estate-blue sm:text-3xl">Our Mission</h2>
        <p className="mb-5 text-lg font-medium italic leading-7 text-foreground sm:text-xl sm:leading-8">
          “To simplify home ownership, strengthen people, and serve with purpose—while redefining what is possible in real estate across Africa and beyond.”
        </p>
        <p className="leading-7 text-muted-foreground">
          We create accessible real estate opportunities, equip and empower our realtor network, and support clients with practical solutions that go beyond land to legacy, lifestyle and long-term security.
        </p>
      </article>
    </div>
  </section>
);

export default VisionMission;
