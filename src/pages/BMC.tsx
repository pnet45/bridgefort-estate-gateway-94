import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Plane, Sprout, Printer, GraduationCap, TrendingUp, Users, Settings, Trophy, Phone, Mail, Globe2 } from 'lucide-react';

const commissions = [
  { title: 'Land sales', rate: '15%', note: 'Through BH-Realtors', icon: Building2 },
  { title: 'House sales', rate: '5%', note: 'Through BH-Realtors', icon: Building2 },
  { title: 'Agribusiness lease partnerships', rate: '10%', note: 'Agrovest', icon: Sprout },
  { title: 'Foreign travels & tours', rate: '10%', note: 'Bridgefort Travels', icon: Plane },
];

const businesses = [
  { title: 'Real Estate', detail: 'Buy · Sell · Refer · Earn', icon: Building2 },
  { title: 'Agrovest', detail: 'Farming · Investment · Food security', icon: Sprout },
  { title: 'Travels & Tours', detail: 'Visa support · Tickets · Tours', icon: Plane },
  { title: 'Prints', detail: 'Branding · Printing · Corporate gifts', icon: Printer },
];

const benefits = [
  { title: 'Learn', detail: 'Business skills and strategies', icon: GraduationCap },
  { title: 'Earn', detail: 'Attractive referral commissions', icon: TrendingUp },
  { title: 'Grow', detail: 'Your network and influence', icon: Users },
  { title: 'Access', detail: 'Products and services across our businesses', icon: Settings },
  { title: 'Build', detail: 'Long-term financial opportunities', icon: Trophy },
];

export default function BMC() {
  return (
    <div className="min-h-screen bg-white text-[#281033] dark:bg-[#100817] dark:text-white">
      <Navbar />
      <main className="pt-20">
        <section className="relative overflow-hidden border-b-[6px] border-[#d5a62d] bg-white dark:bg-[#160b1d]">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-16">
            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d5a62d]/60 bg-[#fff8e5] px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-[#4b075c] dark:bg-[#3a2042] dark:text-[#f6d77e]">
                <span className="h-2 w-2 rounded-full bg-[#d5a62d]" /> Bridgefort Multi-Business Consultants
              </div>
              <p className="text-sm font-semibold uppercase tracking-[.28em] text-[#b98719]">One network. Multiple opportunities.</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-[#39064a] dark:text-white sm:text-5xl lg:text-6xl">
                Your network can create <span className="text-[#bd8b1e]">more opportunities.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-200">
                While you retain your job in any organisation—or continue your self-employed work—you can become part of the Bridgefort network and earn by referring clients who complete qualifying transactions.
              </p>
              <p className="mt-4 text-sm font-semibold text-[#4b075c] dark:text-[#f1d47d]">People. Products. Prosperity.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="h-12 rounded-full bg-[#3b064d] px-7 font-bold text-white hover:bg-[#511367]">
                  <Link to="/bridgefort-realtors-login">Join the BMC Network <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full border-2 border-[#bd8b1e] px-7 font-bold text-[#3b064d] hover:bg-[#fff8e5] dark:text-white">
                  <Link to="/bmc-partner-agreement">Read Partner Agreement</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Designed for working professionals, 9-to-5 employees, entrepreneurs and self-employed people.</p>
            </div>
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-3 rounded-[2rem] border-2 border-[#d5a62d]"></div>
              <img
                src="/lovable-uploads/bhRealtors-reward-scheme.jpeg"
                alt="Bridgefort partner rewards and real estate opportunities"
                className="relative aspect-[4/3] w-full rounded-[1.6rem] border border-[#d5a62d]/70 bg-[#f8f4eb] object-contain shadow-2xl"
                loading="eager"
              />
              <div className="relative mt-3 rounded-2xl bg-[#3b064d] px-5 py-4 text-center text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#f2d37a]">A network of entrepreneurs</p>
                <p className="mt-1 text-xl font-black sm:text-2xl">Creating a brighter future together</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-[#b98719]">One platform · Multiple businesses</p>
            <h2 className="mt-3 text-3xl font-black text-[#39064a] dark:text-white sm:text-4xl">Real people. Real support. Real income.</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Connect clients to products and services across the Bridgefort Group through one partner network.</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {businesses.map(({ title, detail, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-[#e7d6a8] bg-white p-5 shadow-sm dark:border-[#6a4b70] dark:bg-[#21142a]">
                <span className="inline-flex rounded-xl bg-[#3b064d] p-3 text-[#f3d47a]"><Icon className="h-6 w-6" /></span>
                <h3 className="mt-4 text-lg font-extrabold text-[#39064a] dark:text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#f8f4eb] py-14 dark:bg-[#1b1022]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[.25em] text-[#a87916]">Commission opportunities</p>
              <h2 className="mt-3 text-3xl font-black text-[#39064a] dark:text-white sm:text-4xl">Earn on successful client referrals</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">Commission is earned on a referred client who completes the transaction and makes the qualifying payment. A referral or enquiry alone does not earn commission.</p>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {commissions.map(({ title, rate, note, icon: Icon }) => (
                <article key={title} className="relative overflow-hidden rounded-2xl border-2 border-[#d5a62d] bg-white p-5 shadow-md dark:bg-[#24152d]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-xl bg-[#3b064d] p-3 text-[#f4d47a]"><Icon className="h-5 w-5" /></span>
                    <span className="text-4xl font-black tracking-tight text-[#a87916]">{rate}</span>
                  </div>
                  <h3 className="mt-5 min-h-12 text-lg font-extrabold text-[#39064a] dark:text-white">{title}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">{note}</p>
                  <div className="mt-4 h-1 w-14 rounded-full bg-[#d5a62d]" />
                </article>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-6 text-slate-600 dark:text-slate-300">
              Published rates are gross commission rates. Applicable withholding tax (WHT) and approved administrative fees are deducted from commission payable. Payment is subject to verification of the referral, completed transaction and cleared customer payment, and the applicable partner terms.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.25em] text-[#b98719]">Your path forward</p>
              <h2 className="mt-3 text-3xl font-black text-[#39064a] dark:text-white sm:text-4xl">Learn. Earn. Grow. Build.</h2>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Build relationships, understand our products and connect people to opportunities—with support from the Bridgefort team.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map(({ title, detail, icon: Icon }) => (
                <div key={title} className="flex gap-3 rounded-xl border border-[#eadcb9] p-4 dark:border-[#57405e]">
                  <span className="h-fit rounded-full bg-[#3b064d] p-2 text-[#f2d37a]"><Icon className="h-5 w-5" /></span>
                  <div><h3 className="font-extrabold text-[#39064a] dark:text-white">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{detail}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#3b064d] py-12 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.25em] text-[#f1d47d]">Your journey to financial opportunity starts here</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Join the Bridgefort Multi-Business Consultants network.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">Register your interest, review the BMC Partner Agreement and select the divisions you wish to represent.</p>
            </div>
            <Button asChild className="h-12 rounded-full bg-[#e0b43f] px-8 font-black text-[#2b1232] hover:bg-[#f0cb65]">
              <Link to="/bridgefort-realtors-login">Join now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mx-auto mt-9 flex max-w-7xl flex-wrap gap-x-8 gap-y-3 border-t border-white/20 px-4 pt-6 text-sm text-white/85 sm:px-6 lg:px-8">
            <a href="tel:+2347120134957" className="inline-flex items-center gap-2 hover:text-[#f1d47d]"><Phone className="h-4 w-4" /> +234 712 013 4957</a>
            <a href="mailto:career@bridgeforthomes.com" className="inline-flex items-center gap-2 hover:text-[#f1d47d]"><Mail className="h-4 w-4" /> career@bridgeforthomes.com</a>
            <a href="https://www.bridgeforthomes.com" className="inline-flex items-center gap-2 hover:text-[#f1d47d]"><Globe2 className="h-4 w-4" /> www.bridgeforthomes.com</a>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="font-serif text-xl italic text-[#5b2b67] dark:text-[#e3c77c]">Dalvin Silva</p>
          <p className="mt-1 font-bold text-[#39064a] dark:text-white">GMD/CEO · Bridgefort Group</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">www.bridgeforthomes.com</p>
          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-[#d5a62d]" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
