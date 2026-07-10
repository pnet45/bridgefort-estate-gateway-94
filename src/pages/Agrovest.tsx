import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  ShieldCheck,
  TrendingUp,
  Sprout,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Home,
  Fish,
  Bird,
  Beef,
  Wheat,
  Leaf,
  Landmark,
} from 'lucide-react';

const cashCrops = [
  { name: 'Oil Palm Plantation', img: '/lovable-uploads/agrovest-estate-2.jpg' },
  { name: 'Cocoa Plantation', img: '/lovable-uploads/agrovest-estate-2.jpg' },
  { name: 'Rubber Plantation', img: '/lovable-uploads/agrovest-estate-2.jpg' },
  { name: 'Cassava Farm', img: '/lovable-uploads/agrovest-estate-2.jpg' },
  { name: 'Ginger Plantation', img: '/lovable-uploads/agrovest-estate-2.jpg' },
  { name: 'Lemon Orchard', img: '/lovable-uploads/agrovest-estate-2.jpg' },
  { name: 'Maize Plantation', img: '/lovable-uploads/agrovest-estate-2.jpg' },
];

const facilities = [
  { name: 'Modern Farmhouse', icon: Home },
  { name: 'Poultry Farm', icon: Bird },
  { name: 'Fish Farm', icon: Fish },
  { name: 'Ruminants Farm', icon: Beef },
];

const profitPlan = [
  { year: '1st Year', cadence: 'Paid Annually', range: '10% – 20%' },
  { year: '2nd Year', cadence: 'Paid Quarterly', range: '30% – 40%' },
  { year: '3rd Year', cadence: 'Paid Quarterly', range: '30% – 40%' },
  { year: '4th Year', cadence: 'Paid Quarterly', range: '40% – 50%' },
  { year: '5th Year', cadence: 'Paid Quarterly', range: '40% – 50%' },
];

const trustBadges = [
  { label: 'Govt Allocated Farmland', icon: Landmark },
  { label: 'Professional Management', icon: ShieldCheck },
  { label: 'High Return Potential', icon: TrendingUp },
  { label: 'Secure Investment', icon: ShieldCheck },
  { label: 'Sustainable & Green', icon: Leaf },
];

const whatYouGain = [
  { label: 'Fertile Land for Maximum Yield', icon: Sprout },
  { label: 'Steady Returns Every Quarter', icon: TrendingUp },
  { label: 'Sustainable & Profitable Investment', icon: Leaf },
  { label: 'Secure Your Future Today', icon: ShieldCheck },
];

const importantNotes = [
  `The farmland was acquired from and allocated to us by the Ogun State Government under the supervision of the Ministry of Agriculture, and is thus for farming purposes only. An investor can own the land and continue with the agricultural scheme after 20 years, subject to a new contractual agreement and the approval of the state government. In this case, the client is solely responsible for the farming activities on their portion of land, and is required to pay a minimal annual land use charge. Should the client prefer to have our team run the farming business on their behalf, the terms of that arrangement will be spelt out separately.`,
  `The term "ownership" is subjective. Nigeria's constitution vests all rights and ownership of land in the respective State Government, granted out on a 99-year lease. Ownership as used here refers to owning the produce on that portion of land for the number of years contracted as a lease — in this case, 5 years, with the option of renewal.`,
  `The parcels of land have already been discounted, considering the actual price of ₦1,000,000, to cater for bulk buyers.`,
  `As required by the Ogun State Government, we concentrate 70% – 80% on cash crops. The farm estate has been sectioned into cash crops, food crops and livestock farming. We currently have oil palm and other cash crops already cultivated on 25 acres, along with some food crops, and plan to expand into fish farming, animal husbandry and full-scale processing. A purchaser has the liberty to choose Cash Crops Farming, Food Crops Farming, or Livestock Farming.`,
];

const Agrovest: React.FC = () => {
  useEffect(() => {
    document.title = 'Bridgefort Agrovest Estate | Bridgefort Homes Development Ltd';
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[104px] lg:pt-[120px] bg-gradient-to-b from-green-950 via-green-900 to-green-800 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: "url('/lovable-uploads/agrovest-hero-1.jpg')" }}
          aria-hidden="true"
        />
        <div className="container-custom relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-amber-300 font-semibold tracking-wide uppercase text-sm mb-4">
              <Sprout className="h-4 w-4" /> Bridgefort Agrovest Estate Scheme
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Invest in <span className="text-green-400">Farmland</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-2">
              Secure • Sustainable • Profitable
            </p>
            <p className="text-green-200 mb-8 max-w-2xl">
              Invest Today, Harvest Tomorrow — grow wealth and feed generations with a fully
              managed agricultural estate on government-allocated farmland.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-green-950 font-bold">
                <Link to="/contact">Invest Today</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-green-300 text-green-950 bg-white/90 hover:bg-white"
              >
                <a href="#profit-sharing">View Profit Sharing Plan</a>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-green-100">
              <MapPin className="h-5 w-5 text-amber-300" />
              <span>Ijebu-Ife, Off Ijebu-Ode, Ogun State</span>
            </div>
          </div>

          {/* Price card */}
          <Card className="mt-10 lg:mt-0 lg:absolute lg:top-16 lg:right-8 max-w-sm bg-green-950/70 border-amber-400/40 backdrop-blur">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-wide text-amber-300 mb-1">Invest From</p>
              <p className="text-4xl font-extrabold text-white">
                ₦800K <span className="text-base font-medium text-green-200">per plot</span>
              </p>
              <p className="text-sm text-green-300 line-through">Actual price ₦1,000,000</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-amber-400 text-green-950 font-semibold text-sm px-3 py-1.5 rounded-full">
                <Calendar className="h-4 w-4" /> 5 Years Investment Duration
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-green-50 border-b border-green-100">
        <div className="container-custom py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {trustBadges.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-green-800">
                <b.icon className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you invest in */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-3">What You Invest In</h2>
            <p className="text-muted-foreground">
              Your farm estate is sectioned into three categories. As a purchaser, you have the
              liberty to choose which one your plot is invested in.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="border-green-100 text-center">
              <CardContent className="p-8">
                <Wheat className="h-10 w-10 text-green-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">Cash Crops</h3>
                <p className="text-sm text-muted-foreground">
                  Oil palm and other high-value cash crops, currently cultivated on 25 acres.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-100 text-center">
              <CardContent className="p-8">
                <Leaf className="h-10 w-10 text-green-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">Food Crops</h3>
                <p className="text-sm text-muted-foreground">
                  Vegetables, cassava, maize and other food crops grown alongside our cash crops.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-100 text-center">
              <CardContent className="p-8">
                <Beef className="h-10 w-10 text-green-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">Livestock</h3>
                <p className="text-sm text-muted-foreground">
                  Poultry, fish and ruminants farming as we scale into full livestock production.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Farm estate plantations */}
      <section className="section-padding bg-green-950 text-white">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Our Farm Estate Includes</h2>
          <p className="text-green-200 text-center max-w-2xl mx-auto mb-12">
            An integrated, diversified plantation portfolio designed for sustainable, year-round
            income.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-14">
            {cashCrops.map((c) => (
              <div key={c.name} className="text-center">
                <div className="aspect-square rounded-xl bg-green-800 border border-green-700 flex items-center justify-center mb-2">
                  <Sprout className="h-8 w-8 text-amber-300" />
                </div>
                <p className="text-xs font-semibold text-green-100">{c.name}</p>
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold text-center mb-8">Integrated Farm Facilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {facilities.map((f) => (
              <div
                key={f.name}
                className="bg-green-900/60 border border-green-700 rounded-xl p-6 text-center"
              >
                <f.icon className="h-8 w-8 text-amber-300 mx-auto mb-3" />
                <p className="font-semibold text-sm">{f.name}</p>
              </div>
            ))}
            <div className="bg-green-900/60 border border-green-700 rounded-xl p-6 text-center">
              <TrendingUp className="h-8 w-8 text-amber-300 mx-auto mb-3" />
              <p className="font-semibold text-sm">Processing &amp; Value Addition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Profit sharing plan */}
      <section id="profit-sharing" className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-3">
              Bridgefort Agrovest Annual Profit Shares
            </h2>
            <p className="text-muted-foreground">
              Earn quarterly cash proceeds from your farm every year. Terms and conditions apply.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {profitPlan.map((p) => (
              <Card key={p.year} className="border-green-100">
                <CardContent className="p-5 text-center">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">{p.year}</p>
                  <p className="text-xs text-muted-foreground mb-3">({p.cadence})</p>
                  <p className="text-2xl font-extrabold text-green-700">{p.range}</p>
                  <p className="text-xs text-muted-foreground mt-1">Profit of Cash Invested</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">
                  Quarterly Payout Schedule
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cash proceeds are shared out every quarter, then the cycle renews.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {['March', 'June', 'September', 'December'].map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-2 bg-white border border-green-200 rounded-full px-4 py-2 text-sm font-semibold text-green-800"
                  >
                    <Calendar className="h-4 w-4 text-green-600" /> {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-green-800 font-semibold text-sm">
              <RefreshCw className="h-4 w-4" /> Renew after 5 years and continue earning.
            </div>
          </div>
        </div>
      </section>

      {/* What you gain */}
      <section className="section-padding bg-green-50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-12">
            What You Gain
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatYouGain.map((g) => (
              <Card key={g.label} className="border-green-100 text-center">
                <CardContent className="p-6">
                  <g.icon className="h-9 w-9 text-green-700 mx-auto mb-3" />
                  <p className="font-semibold text-green-900 text-sm">{g.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important notes */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-10">
            Important Notes on Agrovest
          </h2>
          <div className="space-y-6">
            {importantNotes.map((note, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 h-8 w-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-8">Terms &amp; Conditions apply.</p>
        </div>
      </section>

      {/* Location + CTA */}
      <section className="section-padding bg-green-900 text-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Own the Future. Grow Wealth. Make Impact.</h2>
              <p className="text-green-200 mb-6">
                Bridgefort Agrovest — where agriculture meets prosperity. Step into a thriving
                agricultural haven where fertile soil, modern farming and smart investment come
                together to secure your financial freedom.
              </p>
              <div className="flex items-center gap-2 text-amber-300 font-semibold mb-8">
                <MapPin className="h-5 w-5" /> Ijebu-Ife, Off Ijebu-Ode, Ogun State
              </div>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-green-950 font-bold">
                  <Link to="/contact">Talk to an Advisor</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-green-300 text-green-950 bg-white/90 hover:bg-white">
                  <Link to="/properties/estates">View All Estates</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {[
                'Government-allocated farmland',
                'Professionally managed farming operations',
                'Choice of Cash Crops, Food Crops or Livestock Farming',
                'Quarterly cash proceeds, renewable after 5 years',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-green-800/60 border border-green-700 rounded-lg p-4">
                  <CheckCircle2 className="h-5 w-5 text-amber-300 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-green-300 text-xs mt-12">
            Managed by Bridgefort Homes Development Ltd (Agrovest)
          </p>
        </div>
      </section>

      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default Agrovest;
