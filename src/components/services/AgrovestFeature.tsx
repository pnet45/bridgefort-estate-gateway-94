import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, TrendingUp, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AgrovestFeature = () => {
  const bullets = [
    { icon: ShieldCheck, text: 'Government-allocated farmland, professionally managed' },
    { icon: TrendingUp, text: 'Quarterly profit shares from Year 2, up to 40% – 50%' },
    { icon: Sprout, text: 'Choose Cash Crops, Food Crops or Livestock Farming' },
    { icon: Calendar, text: '5-year investment term, renewable thereafter' },
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
          <div className="relative h-72 lg:h-full min-h-[400px] overflow-hidden group">
            <img
              src="/lovable-uploads/agrovest-oil-palm-plantation.jpg"
              alt="Bridgefort Agrovest oil palm plantation"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-green-950/50 to-transparent" />
            <div className="absolute top-6 left-6 inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md">
              <Sprout className="text-green-700" size={18} />
              <span className="font-display font-bold text-green-800">Bridgefort Agrovest</span>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <span className="inline-block px-3 py-1 rounded-full bg-green-700/10 text-green-800 text-xs font-bold tracking-wide mb-4">
              NEW SERVICE
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Grow wealth with <span className="text-green-700">Bridgefort Agrovest</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Own a farm plot at our government-allocated agricultural estate in Ijebu-Ife, Ogun
              State. We farm it, you earn — from ₦800,000 per plot.
            </p>
            <ul className="space-y-3 mb-8">
              {bullets.map((b) => (
                <li key={b.text} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-700/10 flex items-center justify-center shrink-0">
                    <b.icon size={16} className="text-green-700" />
                  </span>
                  <span className="text-foreground">{b.text}</span>
                </li>
              ))}
            </ul>
            <Link to="/agrovest" className="inline-flex items-center gap-2 btn-cta group">
              Explore Bridgefort Agrovest
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AgrovestFeature;
