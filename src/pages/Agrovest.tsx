import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEcommerce } from '@/contexts/ecommerce';
import { toast } from '@/hooks/use-toast';
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
  Download,
  ShoppingCart,
  Minus,
  Plus,
  AlertTriangle,
  Factory,
  Users,
  ArrowRight,
} from 'lucide-react';

const PLOT_PRICE = 800000;
const ACTUAL_VALUE = 1000000;

const plantationGallery = [
  { slug: 'oil-palm', name: 'Oil Palm Plantation', img: '/lovable-uploads/agrovest-oil-palm-plantation.jpg' },
  { slug: 'cocoa', name: 'Cocoa Plantation', img: '/lovable-uploads/agrovest-cocoa-plantation.jpg' },
  { slug: 'rubber', name: 'Rubber Plantation', img: '/lovable-uploads/agrovest-rubber-plantation.jpg' },
  { slug: 'cassava', name: 'Cassava Farm', img: '/lovable-uploads/agrovest-cassava-farm.jpg' },
  { slug: 'ginger', name: 'Ginger Plantation', img: '/lovable-uploads/agrovest-ginger-plantation.jpg' },
  { slug: 'lemon', name: 'Lemon Plantation', img: '/lovable-uploads/agrovest-lemon-plantation.jpg' },
  { slug: 'maize', name: 'Maize Plantation', img: '/lovable-uploads/agrovest-maize-plantation.jpg' },
];

const facilityGallery = [
  { slug: 'farm-house', name: 'Farm House', img: '/lovable-uploads/agrovest-farm-house.jpg', icon: Home },
  { slug: 'poultry', name: 'Poultry Farm', img: '/lovable-uploads/agrovest-poultry-farm.jpg', icon: Bird },
  { slug: 'fish', name: 'Fish Farm', img: '/lovable-uploads/agrovest-fish-farm.jpg', icon: Fish },
  { slug: 'ruminants', name: 'Ruminants Farm', img: '/lovable-uploads/agrovest-ruminants-farm.jpg', icon: Beef },
  { slug: 'processing-value-addition', name: 'Processing & Value Addition', img: '/lovable-uploads/agrovest-processing-value-addition.jpg', icon: Factory },
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

const howItWorks = [
  'Select the number of farm plots you wish to purchase.',
  'Complete your investment documentation.',
  'Receive your allocation details.',
  'Bridgefort Agrovest begins cultivation and farm management.',
  'The farm is professionally managed throughout the investment period.',
  'Harvests are processed and marketed.',
  'You receive your agreed profit shares according to the investment schedule.',
];

const whyInvestWithUs = [
  'Government-approved agricultural location',
  'Professionally managed farms',
  'Multiple agricultural sectors',
  'Cash crops, food crops & livestock farming',
  'Sustainable farming methods',
  'Quarterly profit opportunities (from Year 2)',
  'Discounted investment price',
  'Long-term wealth creation',
  'Opportunity for contract renewal',
  'Experienced management team',
];

const whoCanInvest = [
  'Salary Earners', 'Business Owners', 'Professionals', 'Nigerians in Diaspora', 'Cooperatives',
  'Religious Organizations', 'Investment Clubs', 'Corporate Organizations', 'Families',
  'Young Investors', 'Retirees',
];

const futureOps = [
  'Food Processing', 'Storage Facilities', 'Packaging Plants', 'Agro Processing Centres',
  'Feed Mills', 'Palm Oil Processing', 'Cassava Processing', 'Export Packaging',
];

// Reusable glass card wrapper
const Glass: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl ${className}`}>
    {children}
  </div>
);

// Serves the smaller WebP alternate when the browser supports it, falling
// back to the (already resized/compressed) JPEG otherwise — keeps the
// image-heavy plantation/facility gallery light on mobile data.
const OptimizedImg: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => (
  <picture>
    <source srcSet={src.replace(/\.jpe?g$/i, '.webp')} type="image/webp" />
    <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />
  </picture>
);

const Agrovest: React.FC = () => {
  const { addToCart } = useEcommerce();
  const [quantity, setQuantity] = useState(1);
  const [sector, setSector] = useState<'cash' | 'food' | 'livestock'>('cash');

  useEffect(() => {
    document.title = 'Bridgefort Agrovest Estate | Bridgefort Homes Development Ltd';
  }, []);

  const sectorLabels: Record<string, string> = {
    cash: 'Cash Crops Farming',
    food: 'Food Crops Farming',
    livestock: 'Livestock Farming',
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: `agrovest-${sector}`,
        propertyId: 'agrovest-estate',
        propertyName: `Bridgefort Agrovest Estate — ${sectorLabels[sector]}`,
        location: 'Ijebu-Ife, Off Ijebu-Ode, Ogun State',
        pricePerPlot: PLOT_PRICE,
        plotNumber: 1,
        imageUrl: '/lovable-uploads/agrovest-oil-palm-plantation.jpg',
        size: 1,
        propertyType: 'Agrovest',
      },
      quantity
    );
  };

  const handleDownloadForm = async () => {
    const url = '/documents/agrovest-subscription-form.pdf';
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'Bridgefort_Agrovest_Subscription_Form.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Download error:', err);
      window.open(url, '_blank');
    }
    toast({ title: 'Downloading form', description: 'Fill it out and send it back to us to complete your subscription.' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-[104px] lg:pt-[120px] bg-gradient-to-b from-green-950 via-green-900 to-green-800 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('/lovable-uploads/agrovest-hero-1.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/60 via-green-950/40 to-green-900/80" />

        <div className="container-custom relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl">
            <Glass className="inline-flex items-center gap-2 px-4 py-1.5 mb-5">
              <Sprout className="h-4 w-4 text-amber-300" />
              <span className="text-amber-200 font-semibold tracking-wide uppercase text-xs">
                Bridgefort Agrovest Estate Scheme
              </span>
            </Glass>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Growing Wealth <span className="text-green-400">Through Agriculture</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-6 max-w-2xl">
              You Invest. We Farm. You Earn. Own productive farmland at Nigeria's leading
              integrated agricultural investment estate — no farming experience required.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-green-950 font-bold" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Invest Today
              </Button>
              <Button size="lg" variant="outline" className="border-green-300 text-green-950 bg-white/90 hover:bg-white" onClick={handleDownloadForm}>
                <Download className="mr-2 h-4 w-4" /> Download Subscription Form
              </Button>
            </div>

            <div className="flex items-center gap-2 text-green-100">
              <MapPin className="h-5 w-5 text-amber-300" />
              <span>Ijebu-Ife, Off Ijebu-Ode, Ogun State</span>
            </div>
          </div>

          {/* Price + Add to Cart glass card */}
          <Glass className="mt-10 lg:mt-0 lg:absolute lg:top-14 lg:right-8 max-w-sm p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-wide text-amber-300 mb-1">Invest From</p>
            <p className="text-4xl font-extrabold text-white">
              ₦800K <span className="text-base font-medium text-green-200">per plot</span>
            </p>
            <p className="text-sm text-green-300 line-through">Actual value ₦1,000,000</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-amber-400 text-green-950 font-semibold text-sm px-3 py-1.5 rounded-full">
              <Calendar className="h-4 w-4" /> 5 Years Investment Duration
            </div>

            <div className="mt-5 pt-5 border-t border-white/20 space-y-3">
              <div>
                <Label className="text-green-100 text-xs mb-1 block">Farming Sector</Label>
                <Select value={sector} onValueChange={(v) => setSector(v as typeof sector)}>
                  <SelectTrigger className="bg-white/90 text-green-950 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash Crops Farming</SelectItem>
                    <SelectItem value="food">Food Crops Farming</SelectItem>
                    <SelectItem value="livestock">Livestock Farming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-green-100 text-xs">Number of Plots</Label>
                <div className="flex items-center gap-2 bg-white/90 rounded-lg px-2 py-1">
                  <button
                    className="p-1 text-green-800 hover:text-green-950 disabled:opacity-40"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease plots"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center font-semibold text-green-950">{quantity}</span>
                  <button
                    className="p-1 text-green-800 hover:text-green-950"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase plots"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-green-100">
                Total: <span className="font-bold text-white">₦{(PLOT_PRICE * quantity).toLocaleString()}</span>
              </p>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-green-950 font-bold" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <p className="text-[11px] text-green-200/80 text-center">
                Checkout online via Paystack/Card, or download the form to subscribe offline.
              </p>
            </div>
          </Glass>
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

      {/* Company Profile */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-3">Company Profile</h2>
          <p className="text-muted-foreground text-center mb-8">
            Bridgefort Agrovest Scheme is a flagship agricultural investment initiative of
            Bridgefort Homes Development Ltd, created to enable individuals, families,
            professionals, entrepreneurs and corporate organizations participate in profitable
            commercial agriculture without requiring farming experience.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="border-green-100 bg-green-50/60">
              <CardContent className="p-6">
                <h3 className="font-bold text-green-900 mb-2">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  To build one of Nigeria's leading integrated agricultural investment estates,
                  where investors earn consistent returns while creating lasting wealth through
                  agriculture.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-100 bg-green-50/60">
              <CardContent className="p-6">
                <h3 className="font-bold text-green-900 mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  To transform agriculture into a secure, profitable and professionally managed
                  investment opportunity for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Invest / About the Estate */}
      <section className="section-padding bg-green-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: "url('/lovable-uploads/agrovest-oil-palm-plantation.jpg')" }}
          aria-hidden="true"
        />
        <div className="container-custom relative z-10 grid lg:grid-cols-2 gap-8">
          <Glass className="p-8">
            <h3 className="text-2xl font-bold mb-3 text-amber-300">Why Invest in Agriculture?</h3>
            <p className="text-green-100 text-sm leading-relaxed">
              Agriculture remains one of the world's oldest and most reliable wealth-creating
              industries because people will always need food. As populations continue to grow,
              demand for food, cash crops, livestock and processed agricultural products keeps
              rising. Bridgefort Agrovest Estate gives investors the opportunity to own
              productive agricultural plots, professionally managed for maximum productivity and
              profitability.
            </p>
          </Glass>
          <Glass className="p-8">
            <h3 className="text-2xl font-bold mb-3 text-amber-300">About Bridgefort Agrovest Estate</h3>
            <p className="text-green-100 text-sm leading-relaxed mb-4">
              An integrated agricultural estate where investors purchase designated farm plots
              cultivated and managed by experienced agricultural professionals. Our team takes
              responsibility for farm management, labour, irrigation, fertilizer, security,
              harvesting and marketing — while investors receive agreed profit shares.
            </p>
            <p className="text-xl font-extrabold tracking-wide">
              You Invest. <span className="text-amber-300">We Farm.</span> You Earn.
            </p>
          </Glass>
        </div>
      </section>

      {/* Agricultural sectors */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-3">Our Agricultural Sectors</h2>
            <p className="text-muted-foreground">
              Bridgefort Agrovest Estate consists of three major farming divisions. As an
              investor, you choose which sector your plot is invested in.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="border-green-100 group overflow-hidden">
              <CardContent className="p-8 text-center">
                <Wheat className="h-10 w-10 text-green-700 mx-auto mb-4 transition-transform duration-500" />
                <h3 className="text-xl font-bold text-green-900 mb-3">Cash Crops</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {['Oil Palm', 'Cocoa', 'Rubber', 'Ginger', 'Lemon', 'Other approved commercial crops'].map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-green-100 group overflow-hidden">
              <CardContent className="p-8 text-center">
                <Leaf className="h-10 w-10 text-green-700 mx-auto mb-4 transition-transform duration-500" />
                <h3 className="text-xl font-bold text-green-900 mb-3">Food Crops</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {['Cassava', 'Maize', 'Vegetables', 'Other staple crops'].map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-green-100 group overflow-hidden">
              <CardContent className="p-8 text-center">
                <Beef className="h-10 w-10 text-green-700 mx-auto mb-4 transition-transform duration-500" />
                <h3 className="text-xl font-bold text-green-900 mb-3">Livestock</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {['Poultry', 'Fish Farming', 'Cattle', 'Goat', 'Sheep', 'Other approved livestock'].map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plantation gallery — real photos, zoom on hover, glass captions */}
      <section className="section-padding bg-green-950 text-white">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Our Farm Estate Includes</h2>
          <p className="text-green-200 text-center max-w-2xl mx-auto mb-12">
            A diversified, integrated plantation portfolio built for sustainable, year-round income.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-16">
            {plantationGallery.map((c) => (
              <Link
                to={`/agrovest/${c.slug}`}
                key={c.slug}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer block focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <OptimizedImg
                  src={c.img}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-950/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-white">{c.name}</p>
                    <ArrowRight className="h-3.5 w-3.5 text-amber-300 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <h3 className="text-2xl font-bold text-center mb-8">Integrated Farm Facilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {facilityGallery.map((f) => (
              <Link
                to={`/agrovest/${f.slug}`}
                key={f.slug}
                className="relative rounded-2xl overflow-hidden aspect-square group cursor-pointer block focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <OptimizedImg
                  src={f.img}
                  alt={f.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-950/10 to-transparent" />
                <f.icon className="absolute top-3 right-3 h-5 w-5 text-amber-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold text-white">{f.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Future value-added operations */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-3">Future Value-Added Operations</h2>
            <p className="text-muted-foreground">
              Designed to increase profitability over time, Bridgefort Agrovest Estate also plans
              to develop:
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {futureOps.map((op) => (
              <span
                key={op}
                className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-2 rounded-full"
              >
                <Factory className="h-4 w-4 text-green-600" /> {op}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* What investors are buying + Investment scheme */}
      <section className="section-padding bg-green-50">
        <div className="container-custom grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl font-bold text-green-900 mb-4">What Investors Are Buying</h2>
            <ul className="space-y-3">
              {[
                'Each investor purchases an allocated farm plot within the Agrovest Estate.',
                'Each plot is professionally managed throughout the contract period.',
                'The investor owns the agricultural produce generated from that allocated plot during the agreed contractual period.',
              ].map((t) => (
                <li key={t} className="flex gap-3 items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-green-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-green-900 mb-1">Investment Scheme</h3>
              <p className="text-sm text-muted-foreground mb-4">Buy a Farm Plot</p>
              <p className="text-4xl font-extrabold text-green-800">
                ₦{PLOT_PRICE.toLocaleString()} <span className="text-base font-medium text-muted-foreground">per plot</span>
              </p>
              <p className="text-sm text-muted-foreground line-through mb-4">
                Actual Value: ₦{ACTUAL_VALUE.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                The current selling price has been discounted for investors, to cater for bulk buyers.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-green-700 hover:bg-green-800" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <Button variant="outline" className="border-green-300 text-green-800" onClick={handleDownloadForm}>
                  <Download className="mr-2 h-4 w-4" /> Download Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Profit sharing plan */}
      <section id="profit-sharing" className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-3">
              Bridgefort Agrovest Profit Shares
            </h2>
            <p className="text-muted-foreground">
              Earn quarterly cash proceeds from your farm from Year 2 onward. Terms and
              conditions apply.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {profitPlan.map((p) => (
              <Card key={p.year} className="border-green-100 group">
                <CardContent className="p-5 text-center">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">{p.year}</p>
                  <p className="text-xs text-muted-foreground mb-3">({p.cadence})</p>
                  <p className="text-2xl font-extrabold text-green-700 transition-transform duration-300">
                    {p.range}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Expected Annual Profit</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">Quarterly Payout Schedule</h3>
                <p className="text-sm text-muted-foreground">
                  Beginning from the second year, profits are paid quarterly.
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
              <RefreshCw className="h-4 w-4" /> Standard contract runs 5 years — renewable thereafter.
            </div>
          </div>
        </div>
      </section>

      {/* How the scheme works */}
      <section className="section-padding bg-green-950 text-white relative overflow-hidden">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How The Scheme Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorks.map((step, i) => (
              <Glass key={step} className="p-6 hover:bg-white/15 transition-colors">
                <div className="h-9 w-9 rounded-full bg-amber-400 text-green-950 font-bold flex items-center justify-center mb-4">
                  {i + 1}
                </div>
                <p className="text-sm text-green-100">{step}</p>
              </Glass>
            ))}
          </div>
        </div>
      </section>

      {/* Renewal + Land ownership */}
      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-2 gap-8">
          <Card className="border-green-100">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-green-900 mb-3">Renewal Option</h3>
              <p className="text-sm text-muted-foreground mb-4">
                At the end of the initial five-year contract, an investor may:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'Renew the agricultural management agreement.',
                  'Continue farming under a fresh contractual arrangement.',
                  'Subject to approval by the Ogun State Government and applicable regulations, take direct responsibility for farming operations while paying the prescribed annual land use charge.',
                  'Engage Bridgefort Agrovest under a new service agreement to continue managing the farm professionally.',
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-green-900 mb-3">Land Ownership Explained</h3>
              <p className="text-sm text-muted-foreground">
                Under Nigeria's Land Use Act, all land is held by State Governments and granted on
                long-term lease arrangements. Therefore, ownership under Bridgefort Agrovest
                refers to the right to enjoy the agricultural produce generated from the allocated
                portion of land during the agreed contractual lease period.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why our model works + why invest with us */}
      <section className="section-padding bg-green-50">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-3">Why Our Model Works</h2>
            <p className="text-muted-foreground">
              Professional Farm Management + Modern Agricultural Practices + Commercial Scale
              Production + Experienced Agricultural Experts + Sustainable Farming = Long-Term
              Wealth Creation.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {whyInvestWithUs.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-white border border-green-100 rounded-xl p-3"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-xs sm:text-sm text-green-900 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who can invest */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-3 flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-green-700" /> Who Can Invest?
          </h2>
          <p className="text-muted-foreground mb-8">No farming experience is required.</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {whoCanInvest.map((w) => (
              <span
                key={w}
                className="bg-green-700/10 text-green-800 text-sm font-medium px-4 py-2 rounded-full border border-green-200"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Risks disclosure */}
      <section className="pb-4">
        <div className="container-custom max-w-4xl">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 flex gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 mb-1">Risks &amp; Important Disclosures</h3>
                <p className="text-sm text-amber-900/80">
                  Agriculture is a productive business but, like all investments, it carries
                  risks. Actual returns can vary depending on factors such as weather conditions,
                  pests and diseases, market prices, production costs, government policies, and
                  other operational circumstances. The profit percentages stated are projected
                  ranges rather than guaranteed returns, and all investments remain subject to the
                  terms and conditions of the investment agreement.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our commitment */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 text-center mb-8">Our Commitment</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Sustainable Agriculture', 'Transparency', 'Professional Farm Management', 'Investor Satisfaction', 'Food Security', 'Wealth Creation', 'Environmental Responsibility', 'Long-Term Growth'].map((c) => (
              <span key={c} className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-2 rounded-full">
                <Leaf className="h-4 w-4 text-green-600" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-green-900 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: "url('/lovable-uploads/agrovest-cassava-farm.jpg')" }}
          aria-hidden="true"
        />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-amber-300 font-semibold uppercase tracking-wide text-sm mb-3">Our Promise</p>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Plant Today. Prosper Tomorrow.</h2>
          <p className="text-green-200 mb-8">
            Own Productive Farmland. Earn Sustainable Returns. Build Generational Wealth Through
            Agriculture. Bridgefort Agrovest Estate — Where Agriculture Meets Opportunity,
            Sustainability Meets Prosperity, and Every Investment Helps Grow a Better Future.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-green-950 font-bold" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Invest Now
            </Button>
            <Button asChild size="lg" variant="outline" className="border-green-300 text-green-950 bg-white/90 hover:bg-white">
              <Link to="/contact">
                Talk to an Advisor <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-300 text-sm">
            <MapPin className="h-4 w-4" /> Ijebu-Ife, Off Ijebu-Ode, Ogun State
          </div>
          <p className="text-center text-green-400/80 text-xs mt-6">
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
