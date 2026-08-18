import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TrainingRegistrationForm from './TrainingRegistrationForm';
import { CalendarDays, Clock3, MapPin, Sprout, Tractor, Users, ArrowRight, CheckCircle2, Award, Wheat } from 'lucide-react';

export const AGRICULTURAL_TRAINING_TITLE = 'Farming to Wealth — Agricultural Training Programme (ATP) 2026';
export const AGRICULTURAL_TRAINING_DATE = 'Tuesday, 25th August, 2026';
export const AGRICULTURAL_TRAINING_EVENT_DATE = 'Tuesday, 25th August, 2026 at 11:00 a.m.';

const benefits = [
  'Practical knowledge of modern farming techniques',
  'How to start and manage a profitable agribusiness',
  'Profitable crop and livestock farming opportunities',
  'Understanding soil health, crop nutrition and pest management',
  'Ways to improve productivity and reduce production costs',
  'Accessing markets and building profitable value chains',
  'Agricultural financial management and record keeping',
  'Networking with experienced farmers and agricultural professionals',
  'Insights into agricultural funding, support and investment opportunities',
  'Hands-on workshop and practical farm guidance',
  'Certificate of Participation',
];

interface Props { compact?: boolean; }

const AgriculturalTrainingProgramme = ({ compact = false }: Props) => {
  const [registrationOpen, setRegistrationOpen] = useState(false);

  if (compact) {
    return (
      <>
        <section className="section-padding relative overflow-hidden">
          <div className="container-custom">
            <div className="relative overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 p-6 md:p-10 text-white shadow-2xl">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime-300/10 blur-2xl" />
              <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr] items-center">
                <div>
                  <Badge className="mb-4 border border-lime-200/30 bg-lime-300/15 text-lime-100 hover:bg-lime-300/20">Featured Training • 25 August 2026</Badge>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-lime-200">Bridgefort Agrovest Consults presents</p>
                  <h2 className="text-3xl font-black leading-tight md:text-5xl">Farming to Wealth</h2>
                  <p className="mt-2 text-lg font-semibold text-emerald-100">Agricultural Training Programme (ATP) 2026</p>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/90 md:text-base">A practical seminar and workshop for farmers, intending farmers, entrepreneurs and investors who want to understand how agriculture can become a structured, sustainable and profitable wealth-building venture.</p>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-emerald-50">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><CalendarDays className="h-4 w-4" /> Tuesday, 25 August</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><Clock3 className="h-4 w-4" /> 11:00 a.m.</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><MapPin className="h-4 w-4" /> Festac Town, Lagos</span>
                  </div>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button onClick={() => setRegistrationOpen(true)} className="bg-lime-300 text-emerald-950 hover:bg-lime-200 font-bold">Register for ATP Training<ArrowRight className="ml-2 h-4 w-4" /></Button>
                    <Button asChild variant="outline" className="border-white/40 bg-white/5 text-white hover:bg-white hover:text-emerald-950"><a href="/training">View Training Details</a></Button>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
                  <div className="mb-5 flex items-center gap-3"><Sprout className="h-7 w-7 text-lime-300" /><span className="font-bold">What you will gain</span></div>
                  <ul className="space-y-3 text-sm text-emerald-50/90">{benefits.slice(0, 5).map((benefit) => <li key={benefit} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />{benefit}</li>)}</ul>
                  <div className="mt-5 border-t border-white/10 pt-5 text-sm font-semibold text-lime-200">Farming to Wealth • Learn • Practise • Invest • Profit</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <TrainingRegistrationForm open={registrationOpen} onClose={() => setRegistrationOpen(false)} eventTitle={AGRICULTURAL_TRAINING_TITLE} eventDate={AGRICULTURAL_TRAINING_EVENT_DATE} />
      </>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-green-950 py-16 text-white md:py-24">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(163,230,53,.22), transparent 28%), radial-gradient(circle at 80% 30%, rgba(250,204,21,.12), transparent 24%)' }} />
        <div className="container-custom relative">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <Badge className="mb-4 border-lime-200/30 bg-lime-300/15 px-4 py-2 text-lime-100">Featured Event • Agricultural Training Programme</Badge>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-lime-200">Bridgefort Agrovest Consults</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Farming to Wealth</h1>
              <p className="mt-3 text-xl font-semibold text-emerald-100 md:text-2xl">Agricultural Training Programme (ATP) 2026</p>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-emerald-50/85 md:text-lg">Don't just hear about agriculture. Learn it. Practise it. Invest in it. Profit from it.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"><CalendarDays className="mb-3 h-6 w-6 text-lime-300" /><p className="text-xs uppercase tracking-wider text-emerald-200">Date</p><p className="mt-1 font-bold">Tuesday, 25th August, 2026</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"><Clock3 className="mb-3 h-6 w-6 text-lime-300" /><p className="text-xs uppercase tracking-wider text-emerald-200">Time</p><p className="mt-1 font-bold">11:00 a.m.</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"><MapPin className="mb-3 h-6 w-6 text-lime-300" /><p className="text-xs uppercase tracking-wider text-emerald-200">Venue</p><p className="mt-1 font-bold">Bridgefort Homes Conference Centre, Gacoun Plaza, Opposite K Close, 23 Road, Festac Town, Lagos.</p></div>
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 md:p-8 backdrop-blur-md">
                <div className="flex items-center gap-3"><Wheat className="h-7 w-7 text-lime-300" /><h2 className="text-2xl font-bold">What You Will Gain</h2></div>
                <div className="mt-6 grid gap-3 md:grid-cols-2">{benefits.map((benefit) => <div key={benefit} className="flex gap-3 text-sm leading-6 text-emerald-50/90"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-lime-300" />{benefit}</div>)}</div>
              </div>
              <div className="space-y-5">
                <div className="rounded-3xl border border-lime-200/20 bg-lime-300/10 p-6 backdrop-blur-md"><div className="flex items-center gap-3"><Tractor className="h-7 w-7 text-lime-300" /><h2 className="text-xl font-bold">And There's More</h2></div><p className="mt-4 text-sm leading-7 text-emerald-50/90">Participants will discover how to benefit from <strong>Bridgefort Agrovest Scheme 1 & Scheme 2</strong>, including farmland leasing, crop production, livestock and integrated farming support.</p></div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md"><div className="flex items-center gap-3"><Users className="h-6 w-6 text-lime-300" /><h2 className="text-xl font-bold">Speakers</h2></div><p className="mt-3 text-sm text-emerald-50/90"><strong>Dr. Dalvin Silva</strong> and other professional agriculturists & experienced farmers.</p><div className="mt-4 flex items-center gap-2 text-sm text-lime-200"><Award className="h-4 w-4" /> Certificate of Participation</div></div>
              </div>
            </div>
            <div className="mt-10 rounded-3xl border border-amber-200/20 bg-gradient-to-r from-amber-300/10 to-lime-300/10 p-6 md:p-8"><div className="grid gap-5 md:grid-cols-2"><div><p className="text-sm font-semibold uppercase tracking-wider text-lime-200">Scheme 1</p><h3 className="mt-1 text-xl font-bold">Farmland for Yearly Lease</h3><p className="mt-2 text-sm text-emerald-50/80">Flexible plot sizes available at affordable rates for crop farming.</p></div><div><p className="text-sm font-semibold uppercase tracking-wider text-lime-200">Scheme 2</p><h3 className="mt-1 text-xl font-bold">Livestock & Integrated Farming Support</h3><p className="mt-2 text-sm text-emerald-50/80">Training, mentorship and continuous support.</p></div></div></div>
            <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-3xl bg-white p-6 text-center text-emerald-950 md:flex-row md:text-left md:p-8"><div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Your journey can start here</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Learn. Practise. Invest. Profit.</h2><p className="mt-2 text-sm text-emerald-800/80">Whether you're starting from scratch or already farming, come with questions and leave with direction.</p></div><Button onClick={() => setRegistrationOpen(true)} size="lg" className="shrink-0 bg-emerald-800 px-7 font-bold text-white hover:bg-emerald-700">Register for ATP Training<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          </div>
        </div>
      </section>
      <TrainingRegistrationForm open={registrationOpen} onClose={() => setRegistrationOpen(false)} eventTitle={AGRICULTURAL_TRAINING_TITLE} eventDate={AGRICULTURAL_TRAINING_EVENT_DATE} />
    </>
  );
};

export default AgriculturalTrainingProgramme;
