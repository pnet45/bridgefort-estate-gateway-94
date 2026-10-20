import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import AboutHero from '../components/about/AboutHero';
import VisionMission from '../components/about/VisionMission';
import CoreValues from '../components/about/CoreValues';
import WhyRealEstate from '../components/about/WhyRealEstate';
import OurEstates from '../components/about/OurEstates';
import TeamPhoto from '../components/about/TeamPhoto';
import ManagementTeam from '../components/about/ManagementTeam';
import BoardOfDirectors from '../components/about/BoardOfDirectors';
import CallToAction from '../components/about/CallToAction';

const About = () => (
  <div className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
    <Navbar />
    <main className="flex-1">
      <AboutHero />

      <section className="px-4 py-10 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-6 rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm sm:p-8 md:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:p-14">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Who we are</p>
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Property ownership built on trust, service and lasting value.
            </h2>
            <div className="mt-5 h-1 w-16 rounded-full bg-amber-500" />
          </div>
          <div className="space-y-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            <p>
              Bridgefort Homes Development Ltd provides land and housing opportunities that help individuals and families plan confidently for the future.
            </p>
            <p>
              We bring together property development, realtor support and customer service with a commitment to integrity, transparency and responsible follow-through.
            </p>
          </div>
        </div>
      </section>

      <VisionMission />
      <CoreValues />
      <WhyRealEstate />
      <OurEstates />
      <TeamPhoto />
      <ManagementTeam />
      <BoardOfDirectors />
      <CallToAction />
    </main>
    <Footer />
    <WhatsAppChat />
  </div>
);

export default About;
