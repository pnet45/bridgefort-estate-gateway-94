import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane, Hotel, MapPin, FileCheck, Shield, Headphones, BadgeDollarSign,
  Compass, CalendarCheck, Ticket, Globe2, Check, Star, Briefcase, GraduationCap, Stethoscope, Heart, SearchX
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import TravelsFilters, { TravelFiltersState, TravelType } from '@/components/travels/TravelsFilters';
import TravelsBookingForm from '@/components/travels/TravelsBookingForm';
import heroImg from '@/assets/travels-hero.jpg';

const valueProps = [
  { icon: FileCheck, title: 'Visa Assistance', desc: 'End-to-end visa processing for tourist, business, student, and pilgrimage travel.' },
  { icon: Plane, title: 'Flight Bookings', desc: 'Best fares on premium and budget airlines across every major route.' },
  { icon: Hotel, title: 'Hotel Reservations', desc: 'Hand-picked accommodations from boutique stays to 5-star luxury.' },
  { icon: MapPin, title: 'Tour Packages', desc: 'Curated leisure, group, and bespoke itineraries to dream destinations.' },
];

type DestType = Exclude<TravelType, 'all'>;
interface Destination {
  city: string; country: string; img: string; from: string; price: number; types: DestType[];
}

const destinations: Destination[] = [
  { city: 'Dubai', country: 'United Arab Emirates', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80', from: '850,000', price: 850000, types: ['tourist', 'business', 'luxury'] },
  { city: 'London', country: 'United Kingdom', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=80', from: '1,450,000', price: 1450000, types: ['tourist', 'business', 'student', 'medical'] },
  { city: 'Istanbul', country: 'Türkiye', img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=900&q=80', from: '780,000', price: 780000, types: ['tourist', 'medical', 'pilgrimage'] },
  { city: 'Cape Town', country: 'South Africa', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=900&q=80', from: '920,000', price: 920000, types: ['tourist', 'luxury'] },
  { city: 'Bali', country: 'Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80', from: '1,250,000', price: 1250000, types: ['tourist', 'luxury'] },
  { city: 'New York', country: 'United States', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=900&q=80', from: '1,890,000', price: 1890000, types: ['tourist', 'business', 'student'] },
];

const PRICE_MIN = 500000;
const PRICE_MAX = 2000000;

const packages = [
  {
    name: 'Explorer',
    price: '650,000',
    tagline: 'Perfect for first-time travelers',
    perks: ['Return economy flight', '3-night hotel stay', 'Airport transfers', 'Visa support', 'Travel insurance'],
    featured: false,
  },
  {
    name: 'Premium',
    price: '1,450,000',
    tagline: 'Our most popular package',
    perks: ['Premium economy flight', '5-night 4-star hotel', 'Private city tours', 'Visa fast-track', 'Travel insurance', '24/7 concierge'],
    featured: true,
  },
  {
    name: 'Luxury',
    price: '3,200,000',
    tagline: 'Bespoke five-star experience',
    perks: ['Business class flight', '7-night 5-star resort', 'Chauffeured transport', 'VIP visa handling', 'Premium insurance', 'Personal travel butler', 'Exclusive excursions'],
    featured: false,
  },
];

const visaCategories = [
  { icon: Compass, label: 'Tourist Visa', desc: 'Schengen, UK, US, Canada, UAE, and more.' },
  { icon: Briefcase, label: 'Business Visa', desc: 'Conference, trade, and corporate travel.' },
  { icon: GraduationCap, label: 'Student Visa', desc: 'Application support for top global universities.' },
  { icon: Stethoscope, label: 'Medical Visa', desc: 'India, Turkey, Germany and UAE medical travel.' },
  { icon: Heart, label: 'Pilgrimage', desc: 'Hajj, Umrah, and Holy Land tours.' },
  { icon: Globe2, label: 'Transit & Other', desc: 'Specialty visas and re-entry processing.' },
];

const steps = [
  { n: '01', icon: Headphones, title: 'Consult', desc: 'Tell us your destination, dates, and dream.' },
  { n: '02', icon: CalendarCheck, title: 'Plan', desc: 'We design a tailored itinerary and quote.' },
  { n: '03', icon: Ticket, title: 'Book', desc: 'Flights, hotels, and visas confirmed in one place.' },
  { n: '04', icon: Plane, title: 'Travel', desc: 'You fly while we stand by 24/7 worldwide.' },
];

const testimonials = [
  { name: 'Adaeze O.', trip: 'Dubai Family Vacation', quote: 'Bridgefort handled every detail flawlessly — from visa to hotel pickup. Absolutely stress-free.' },
  { name: 'Tunde A.', trip: 'London Business Trip', quote: 'They got me a Schengen visa in record time and an unbeatable business class fare.' },
  { name: 'Mrs. Okafor', trip: 'Umrah Pilgrimage', quote: 'Spiritually fulfilling and beautifully organised. I will travel with Bridgefort again and again.' },
];

const faqs = [
  { q: 'How long does visa processing take?', a: 'Most tourist visas are processed in 7–21 working days depending on the embassy. We offer fast-track options where available.' },
  { q: 'Do you offer payment plans?', a: 'Yes. Premium and Luxury packages can be split into flexible instalments. Speak to our consultant for details.' },
  { q: 'Can you arrange group travel?', a: 'Absolutely. We organise corporate retreats, family groups, pilgrimage groups, and student tours of any size.' },
  { q: 'What if my visa is denied?', a: 'We provide a refund of refundable components and assist with re-application strategy at no extra consultation fee.' },
  { q: 'Are flight prices guaranteed?', a: 'Fares are confirmed at the point of ticket issuance. We always source the best available rate at the time of booking.' },
];

const Travels = () => {
  useEffect(() => {
    document.title = 'Bridgefort Travels — Flights, Visas & Tours';
    const meta = document.querySelector('meta[name="description"]');
    const content = 'Bridgefort Travels: visa processing, flight bookings, hotel reservations, and curated tour packages worldwide.';
    if (meta) meta.setAttribute('content', content);
    else {
      const m = document.createElement('meta');
      m.name = 'description'; m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  const [filters, setFilters] = useState<TravelFiltersState>({
    query: '',
    travelType: 'all',
    priceRange: [PRICE_MIN, PRICE_MAX],
  });
  const [bookingPackage, setBookingPackage] = useState('');
  const [bookingDestination, setBookingDestination] = useState('');

  const filteredDestinations = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return destinations.filter((d) => {
      if (q && !`${d.city} ${d.country}`.toLowerCase().includes(q)) return false;
      if (filters.travelType !== 'all' && !d.types.includes(filters.travelType as DestType)) return false;
      if (d.price < filters.priceRange[0] || d.price > filters.priceRange[1]) return false;
      return true;
    });
  }, [filters]);

  const scrollToBooking = (pkg = '', dest = '') => {
    setBookingPackage(pkg);
    setBookingDestination(dest);
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TravelAgency',
        name: 'Bridgefort Travels',
        description: 'Visa, flights, hotels and bespoke tour packages.',
        areaServed: 'Worldwide',
      }) }} />

      {/* HERO */}
      <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Airplane wing soaring above clouds at sunset"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1024}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-estate-darkBlue/85 via-estate-darkBlue/60 to-estate-blue/70" />
        <div className="relative z-10 container-custom h-full flex flex-col justify-center text-white">
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-semibold tracking-wide w-fit mb-6"
          >
            ✈️ Bridgefort Travels
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl"
          >
            Explore the World with <span className="text-gradient bg-gradient-to-r from-white to-estate-blue bg-clip-text text-transparent">Bridgefort Travels</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl"
          >
            From visas and flights to luxury escapes — your trusted travel partner for seamless journeys to every corner of the globe.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button asChild variant="cta" size="lg" className="text-base">
              <Link to="/contact">Plan My Trip</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white hover:text-estate-darkBlue">
              <a href="#packages">Browse Packages</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Everything you need to travel well</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">One trusted partner for every part of your journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group bg-card border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-estate-blue to-estate-red flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <v.icon className="text-white" size={26} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <TravelsFilters
        value={filters}
        onChange={setFilters}
        min={PRICE_MIN}
        max={PRICE_MAX}
        resultCount={filteredDestinations.length}
      />

      {/* DESTINATIONS */}
      <section className="section-padding pt-6 bg-muted/40">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Featured Destinations</h2>
              <p className="text-muted-foreground">Trending getaways our travelers love right now.</p>
            </div>
            <a href="#booking" className="text-estate-blue font-semibold hover:underline">Request a custom destination →</a>
          </div>

          {filteredDestinations.length === 0 ? (
            <div className="text-center py-16 bg-card border rounded-2xl">
              <SearchX className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl font-semibold mb-1">No destinations match your filters</h3>
              <p className="text-muted-foreground mb-4">Try widening the price range or clearing the search.</p>
              <Button variant="cta" onClick={() => scrollToBooking('Custom', filters.query)}>
                Request a custom trip
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((d, i) => (
                <motion.div
                  key={d.city}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-shadow cursor-pointer"
                  onClick={() => scrollToBooking('', d.city)}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={d.img}
                      alt={`${d.city}, ${d.country}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="text-sm font-medium opacity-80">{d.country}</div>
                    <div className="font-display text-2xl font-bold">{d.city}</div>
                    <div className="mt-2 text-sm flex items-center justify-between">
                      <span>From <span className="text-estate-blue font-bold text-base">₦{d.from}</span></span>
                      <span className="text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
                        Book →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Travel Packages</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Pre-designed itineraries with full transparency — pick a tier or let us tailor it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {packages.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 border-2 transition-all ${
                  p.featured
                    ? 'border-estate-blue bg-gradient-to-br from-estate-blue to-estate-red text-white shadow-2xl scale-[1.03]'
                    : 'border-border bg-card hover:border-estate-blue hover:shadow-xl'
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-estate-blue px-4 py-1 rounded-full text-xs font-bold shadow-md">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold mb-1">{p.name}</h3>
                <p className={`text-sm mb-6 ${p.featured ? 'text-white/85' : 'text-muted-foreground'}`}>{p.tagline}</p>
                <div className="mb-6">
                  <span className="text-sm align-top">from ₦</span>
                  <span className="font-display text-4xl font-bold">{p.price}</span>
                  <span className={`text-sm ml-1 ${p.featured ? 'text-white/85' : 'text-muted-foreground'}`}>/ person</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm">
                      <Check size={18} className={p.featured ? 'text-white shrink-0 mt-0.5' : 'text-estate-blue shrink-0 mt-0.5'} />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${p.featured ? 'bg-white text-estate-blue hover:bg-white/90' : ''}`}
                  variant={p.featured ? 'default' : 'cta'}
                >
                  <Link to="/contact">Enquire Now</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VISA SERVICES */}
      <section className="section-padding bg-gradient-to-br from-estate-darkBlue to-estate-blue text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Visa Services</h2>
            <p className="text-white/80 max-w-2xl mx-auto">Expert documentation and embassy liaison across every major category.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visaCategories.map((v, i) => (
              <motion.div
                key={v.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-6 hover:bg-white/15 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <v.icon size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold">{v.label}</div>
                    <div className="text-sm text-white/75">{v.desc}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Four simple steps from idea to take-off.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-card border rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="absolute -top-4 -right-4 font-display text-5xl font-bold text-estate-blue/15">{s.n}</div>
                <div className="w-12 h-12 rounded-xl bg-estate-blue/10 flex items-center justify-center mb-4">
                  <s.icon size={22} className="text-estate-blue" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="section-padding bg-muted/40">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Why Choose Bridgefort Travels</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Licensed & Trusted', desc: 'Fully accredited travel partner with IATA-affiliated suppliers.' },
              { icon: Headphones, title: '24/7 Support', desc: 'Live travel concierge before, during, and after your trip.' },
              { icon: BadgeDollarSign, title: 'Best Price Guarantee', desc: "Find a better quote? We'll match it — or beat it." },
            ].map((w, i) => (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-8 bg-card rounded-2xl border hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-estate-blue to-estate-red flex items-center justify-center mb-4">
                  <w.icon size={28} className="text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{w.title}</h3>
                <p className="text-muted-foreground">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Travelers Love Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card border rounded-2xl p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} size={18} className="fill-estate-blue text-estate-blue" />
                  ))}
                </div>
                <p className="text-foreground italic mb-5">"{t.quote}"</p>
                <div className="font-display font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.trip}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-muted/40">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border rounded-xl px-5"
              >
                <AccordionTrigger className="font-display font-semibold text-left hover:text-estate-blue">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 bg-gradient-to-r from-estate-blue via-estate-darkBlue to-estate-red text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative container-custom text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Ready to Take Off?</h2>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-8">
            Speak with a Bridgefort travel consultant today and start planning your next unforgettable journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-estate-blue hover:bg-white/90 text-base font-semibold">
              <Link to="/contact">Start Planning</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-estate-blue text-base font-semibold">
              <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Travels;
