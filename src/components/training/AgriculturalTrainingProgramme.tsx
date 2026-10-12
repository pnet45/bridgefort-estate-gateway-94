import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TrainingRegistrationForm from './TrainingRegistrationForm';
import { CalendarDays, Clock3, MapPin, Sprout, Tractor, Users, ArrowRight, CheckCircle2, Award, Wheat } from 'lucide-react';

export const AGRICULTURAL_TRAINING_TITLE = 'Advanced Sales and Marketing Clinic - (SMC) 2026';
export const AGRICULTURAL_TRAINING_DATE = 'Tuesday, 1st September, 2026';
export const AGRICULTURAL_TRAINING_EVENT_DATE = 'Tuesday, 1st September, 2026 at 11:00 a.m.';

// Official ATP flyer, used as a shaded background on the featured/compact card below.
const ATP_POSTER_IMAGE = '/lovable-uploads/sales-clinic.jpg';

const benefits = [
  '|Week 1 | Tuesday, Sept 1 | Advanced Prospecting & Lead Generation',
  '|Week 2 | Tuesday, Sept 8 | Influence & Persuasion Mastery',
  '|Week 3 | Tuesday, Sept 15  | High-Ticket Closing & Negotiation Excellence',
  '|Week 4 | Tuesday, Sept 22  | Branding, Marketing & Positioning',
  '|Week 5 | Tuesday, Sept 29  | Customer Loyalty, Referrals & Scale',
  'Accessing markets and building profitable value chains',
  'Digital tools for social marketing',
  'Networking with experienced sales and marketing professionals',
  'Insights into network marketing, support and investment opportunities',
  'Hands-on workshop and practical sales guidance',
  'Step-by-step framework to apply and market confidently',
];

interface Props { compact?: boolean; }

const AgriculturalTrainingProgramme = ({ compact = false }: Props) => {
  const [registrationOpen, setRegistrationOpen] = useState(false);

  if (compact) {
    return (
      <>
        <section className="section-padding relative overflow-hidden">
          <div className="container-custom">
            <div className="relative overflow-hidden rounded-[2rem] border border-indigo-900/10 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 p-6 md:p-10 text-white shadow-2xl">
              {/* ATP flyer background image, shaded so the text stays readable */}
              <img
                src={ATP_POSTER_IMAGE}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-indigo-900/90 to-violet-900/85" />
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime-300/10 blur-2xl" />
              <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr] items-center">
                <div>
                  <Badge className="mb-4 border border-lime-200/30 bg-lime-300/15 text-lime-100 hover:bg-lime-300/20">Featured Training • All Tuesdays in September 2026</Badge>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-lime-200">Bridgefort Homes presents</p>
                  <h2 className="text-3xl font-black leading-tight md:text-5xl">Advanced Sales & Marketing Clinic</h2>
                  <p className="mt-2 text-lg font-semibold text-emerald-100">Five Tuesdays. Five Game-Changing Modules. One New You in Sales. FREE.</p>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/90 md:text-base">It's not just a clinic — it's a TRANSFORMATION. ⭐ FREE to attend..</p>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-emerald-50">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><CalendarDays className="h-4 w-4" /> All Tuesdays, in September</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><Clock3 className="h-4 w-4" /> 11:00 a.m.</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><MapPin className="h-4 w-4" /> Bridgefort Homes Center, Suite 8, Gacoum Plaza, 23 Road, opp. K-Close, Festac Town, Lagos</span>
                  </div>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button onClick={() => setRegistrationOpen(true)} className="bg-lime-300 text-emerald-950 hover:bg-lime-200 font-bold">Register for Sales Clinic Training<ArrowRight className="ml-2 h-4 w-4" /></Button>
                    <Button asChild variant="outline" className="border-white/40 bg-white/5 text-white hover:bg-white hover:text-emerald-950"><a href="/training">View Training Details</a></Button>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
                  <div className="mb-5 flex items-center gap-3"><Sprout className="h-7 w-7 text-lime-300" /><span className="font-bold">What you will gain</span></div>
                  <ul className="space-y-3 text-sm text-emerald-50/90">{benefits.slice(0, 5).map((benefit) => <li key={benefit} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />{benefit}</li>)}</ul>
                  <div className="mt-5 border-t border-white/10 pt-5 text-sm font-semibold text-lime-200">Market Like a Pro • Learn • Practise • Sell • Resell</div>
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
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-indigo-900 to-violet-950 py-16 text-white md:py-24">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(163,230,53,.22), transparent 28%), radial-gradient(circle at 80% 30%, rgba(250,204,21,.12), transparent 24%)' }} />
        <div className="container-custom relative">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <Badge className="mb-4 border-lime-200/30 bg-lime-300/15 px-4 py-2 text-lime-100">Featured Event • Advance Marketing Clinic</Badge>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-lime-200">Bridgefort Homes Development</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Advanced Sales & Marketing Clinic</h1>
              <p className="mt-3 text-xl font-semibold text-emerald-100 md:text-2xl">Advanced Sales & Marketing Clinic</p>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-emerald-50/85 md:text-lg">Don't just hear about Sales and Marketing. Learn it. Practise it. Grow in it. Profit from it.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"><CalendarDays className="mb-3 h-6 w-6 text-lime-300" /><p className="text-xs uppercase tracking-wider text-emerald-200">Date</p><p className="mt-1 font-bold">All Tuesdays in September, 2026</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"><Clock3 className="mb-3 h-6 w-6 text-lime-300" /><p className="text-xs uppercase tracking-wider text-emerald-200">Time</p><p className="mt-1 font-bold">11:00 a.m.</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md"><MapPin className="mb-3 h-6 w-6 text-lime-300" /><p className="text-xs uppercase tracking-wider text-emerald-200">Venue</p><p className="mt-1 font-bold">Bridgefort Homes Conference Centre, Gacoun Plaza, Opposite K Close, 23 Road, Festac Town, Lagos.</p></div>
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 md:p-8 backdrop-blur-md">
                <div className="flex items-center gap-3"><Wheat className="h-7 w-7 text-lime-300" /><h2 className="text-2xl font-bold">What You Will Gain</h2></div>
                <div className="mt-6 grid gap-3 md:grid-cols-2">{benefits.map((benefit) => <div key={benefit} className="flex gap-3 text-sm leading-6 text-emerald-50/90"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-lime-300" />{benefit}</div>)}</div>
              </div>
              <div className="space-y-5">
                <div className="rounded-3xl border border-lime-200/20 bg-lime-300/10 p-6 backdrop-blur-md"><div className="flex items-center gap-3"><Tractor className="h-7 w-7 text-lime-300" /><h2 className="text-xl font-bold">And There's More</h2></div><p className="mt-4 text-sm leading-7 text-indigo-50/90">Participants will discover how to benefit from <strong>Experienced sales gurus</strong>, The clinic distills the proven frameworks of world-class sales and marketing authorities into one practical, free program: Sales Masters: Brian Tracy · Zig Ziglar · Tom Hopkins · Grant Cardone · Dan Kennedy Marketing & Strategy: Seth Godin · Philip Kotler · Jay Abraham · Gary Vaynerchuk · Lisa K. Simmons.</p></div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md"><div className="flex items-center gap-3"><Users className="h-6 w-6 text-lime-300" /><h2 className="text-xl font-bold">Speakers</h2></div><p className="mt-3 text-sm text-indigo-50/90"><strong>Dr. Dalvin Silva</strong> and other sales professional  & experienced marketers.</p><div className="mt-4 flex items-center gap-2 text-sm text-lime-200"><Award className="h-4 w-4" /> Practical and proven step-by-step guide</div></div>
              </div>
            </div>
            <div className="mt-10 rounded-3xl border border-amber-200/20 bg-gradient-to-r from-amber-300/10 to-lime-300/10 p-6 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-lime-200">Who should attend?</p>
                  <h3 className="mt-1 text-xl font-bold">Sales professionals and business owners who want to close bigger deals</h3>
                  <p className="mt-2 text-sm text-indigo-50/80">Entrepreneurs, startups & founders building their pipeline.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-lime-200">Who should attend?</p>
                  <h3 className="mt-1 text-xl font-bold">Real estate agents & investors.</h3>
                  <p className="mt-2 text-sm text-indigo-50/80">Training, marketing managers, brand leads & content creators.</p>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-3xl bg-white p-6 text-center text-indigo-950 md:flex-row md:text-left md:p-8"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Your journey can start here</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Learn. Practise. Close deals. and Grow.</h2><p className="mt-2 text-sm text-indigo-800/80">Whether you're starting from scratch or financial advisor, consultant, service provider, or just somone ready to transform your income and influence, this is your opportunity! come with questions and leave with direction.</p></div><Button onClick={() => setRegistrationOpen(true)} size="lg" className="shrink-0 bg-indigo-800 px-7 font-bold text-white hover:bg-indigo-700">Register for SMC Training<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          </div>
        </div>
      </section>
      <TrainingRegistrationForm open={registrationOpen} onClose={() => setRegistrationOpen(false)} eventTitle={AGRICULTURAL_TRAINING_TITLE} eventDate={AGRICULTURAL_TRAINING_EVENT_DATE} />
    </>
  );
};

export default AgriculturalTrainingProgramme;
