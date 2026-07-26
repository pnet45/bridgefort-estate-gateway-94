import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, ShieldCheck, TrendingUp, FileCheck, MapPin, Calendar,
  ArrowRight, Sprout,
} from 'lucide-react';
import { fiveKEstates } from '@/data/fiveKDailyPromo';
import { useAuth } from '@/contexts/auth';

const perks = [
  { icon: DollarSign, label: 'Affordable Investment' },
  { icon: ShieldCheck, label: 'Secured Environment' },
  { icon: TrendingUp, label: 'High ROI' },
  { icon: FileCheck, label: 'Instant Allocation' },
];

const FiveKDailyPromo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = '5K Daily Promo | Become a Landlord | Bridgefort Homes';
  }, []);

  const goToPromoPlan = () => {
    navigate(user ? '/cart' : '/auth');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[104px] lg:pt-[120px] bg-gradient-to-b from-[#1a0b3d] via-[#2a0f52] to-[#1a0b3d] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: "url('/lovable-uploads/5k-daily-family-hero.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b3d]/70 via-[#1a0b3d]/60 to-[#1a0b3d]" />
        <div className="container-custom relative z-10 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="bg-yellow-400 text-purple-950 font-bold mb-4">PROMO! PROMO! PROMO!!!</Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Promo Price <span className="text-yellow-400">5K</span> Daily
            </h1>
            <p className="text-lg text-purple-100 mb-2 font-semibold">
              It's leveling up time!!! Become a landlord with as low as 5K daily.
            </p>
            <p className="text-purple-200 mb-8 max-w-xl">
              Invest today, own tomorrow. Choose any of our featured estates below and start your
              Daily, Weekly or Monthly savings plan — we'll track your progress until you own your plot.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-purple-950 font-bold" onClick={goToPromoPlan}>
                <Sprout className="mr-2 h-4 w-4" /> Start My 5K Daily Plan
              </Button>
              <Button asChild size="lg" variant="outline" className="border-purple-300 text-purple-950 bg-white/90 hover:bg-white">
                <a href="#estates">View Estates</a>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 hidden lg:block">
            <picture>
              <source srcSet="/lovable-uploads/5k-daily-flyer.webp" type="image/webp" />
              <img src="/lovable-uploads/5k-daily-flyer.jpg" alt="Bridgefort Homes 5K Daily Promo flyer" className="w-full h-auto" loading="lazy" decoding="async" />
            </picture>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-purple-50 border-b border-purple-100">
        <div className="container-custom py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {perks.map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-purple-900">
                <p.icon className="h-5 w-5 text-purple-600 shrink-0" />
                <span className="text-sm font-medium">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estates grid */}
      <section id="estates" className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-950 mb-3">
              Choose Your Estate
            </h2>
            <p className="text-muted-foreground">
              Pick a plot size that fits your budget, then start paying it off Daily, Weekly or
              Monthly — as low as ₦5,000 at a time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fiveKEstates.map((e) => {
              const cheapest = e.tiers.reduce((min, t) => (t.price < min.price ? t : min), e.tiers[0]);
              return (
                <Card key={e.slug} className="border-purple-100 overflow-hidden group">
                  <div className="h-32 bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center relative">
                    <Sprout className="h-10 w-10 text-yellow-400 opacity-80 transition-transform duration-500" />
                    <Badge className="absolute top-2 right-2 bg-purple-950/70 text-yellow-300 text-[10px]">{e.badge}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-purple-950 mb-1">{e.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-3.5 w-3.5" /> {e.location}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">From</p>
                    <p className="text-xl font-extrabold text-purple-800 mb-4">
                      ₦{cheapest.price.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">/ {cheapest.sqm}sqm</span>
                    </p>
                    <Button
                      className="w-full bg-purple-800 hover:bg-purple-900"
                      onClick={goToPromoPlan}
                    >
                      Start Saving <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-purple-950 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-10">How the 5K Daily Promo Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Pick an estate & plot size', icon: MapPin },
              { step: '2', title: 'Choose Daily, Weekly or Monthly', icon: Calendar },
              { step: '3', title: 'Pay installments via Paystack', icon: DollarSign },
              { step: '4', title: 'Track progress until fully paid', icon: TrendingUp },
            ].map((s) => (
              <div key={s.step} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="h-9 w-9 rounded-full bg-yellow-400 text-purple-950 font-bold flex items-center justify-center mb-4 mx-auto">
                  {s.step}
                </div>
                <s.icon className="h-6 w-6 text-yellow-300 mx-auto mb-3" />
                <p className="text-sm text-purple-100">{s.title}</p>
              </div>
            ))}
          </div>
          <p className="text-purple-300 text-xs mt-10">
            Your progress and countdown are tracked live under "5K Daily Promo" in your Cart page.
          </p>
          <div className="mt-6">
            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-purple-950 font-bold" onClick={goToPromoPlan}>
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default FiveKDailyPromo;
