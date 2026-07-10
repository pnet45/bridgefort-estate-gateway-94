import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, FileCheck, Hotel, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import featureImg from '@/assets/travels-feature.jpg';

const TravelsFeature = () => {
  const bullets = [
    { icon: FileCheck, text: 'Visa processing for every major destination' },
    { icon: Plane, text: 'Best fares on premium and budget airlines' },
    { icon: Hotel, text: 'Hand-picked hotel stays worldwide' },
    { icon: MapPin, text: 'Curated tours and bespoke itineraries' },
  ];

  return (
    <section className="section-padding bg-muted/40">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center bg-card rounded-3xl overflow-hidden shadow-xl border"
        >
          <div className="relative h-72 lg:h-full min-h-[400px]">
            <img
              src={featureImg}
              alt="Passport, boarding pass and globe — Bridgefort Travels"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-estate-darkBlue/40 to-transparent" />
            <div className="absolute top-6 left-6 inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md">
              <Plane className="text-estate-blue" size={18} />
              <span className="font-display font-bold text-estate-blue">Bridgefort Travels</span>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <span className="inline-block px-3 py-1 rounded-full bg-estate-blue/10 text-estate-blue text-xs font-bold tracking-wide mb-4">
              NEW SERVICE
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Explore the world with <span className="text-estate-blue">Bridgefort Travels</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Your trusted partner for visas, flights, hotels and unforgettable tour experiences across every continent.
            </p>
            <ul className="space-y-3 mb-8">
              {bullets.map((b) => (
                <li key={b.text} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-estate-blue/10 flex items-center justify-center shrink-0">
                    <b.icon size={16} className="text-estate-blue" />
                  </span>
                  <span className="text-foreground">{b.text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/travels"
              className="inline-flex items-center gap-2 btn-cta group"
            >
              Visit Bridgefort Travels
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TravelsFeature;
