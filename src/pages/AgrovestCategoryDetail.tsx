import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Sprout, CloudSun, Wheat, ShoppingBag, TrendingUp,
  CheckCircle2, ShoppingCart, MapPin,
} from 'lucide-react';
import { agrovestCategories, getAgrovestCategory } from '@/data/agrovestCategories';
import { useEcommerce } from '@/contexts/ecommerce';

const PLOT_PRICE = 800000;

const AgrovestCategoryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = getAgrovestCategory(slug || '');
  const { addToCart } = useEcommerce();

  useEffect(() => {
    if (category) {
      document.title = `${category.name} | Bridgefort Agrovest Estate`;
      window.scrollTo(0, 0);
    }
  }, [category]);

  if (!category) {
    return <Navigate to="/agrovest" replace />;
  }

  const handleAddToCart = () => {
    addToCart(
      {
        id: `agrovest-${category.slug}`,
        propertyId: 'agrovest-estate',
        propertyName: `Bridgefort Agrovest Estate — ${category.name}`,
        location: 'Ijebu-Ife, Off Ijebu-Ode, Ogun State',
        pricePerPlot: PLOT_PRICE,
        plotNumber: 1,
        imageUrl: category.image,
        size: 1,
        propertyType: 'Agrovest',
      },
      1
    );
  };

  const otherCategories = agrovestCategories.filter((c) => c.slug !== category.slug).slice(0, 4);

  const infoSections = [
    { icon: Sprout, title: 'Planting', body: category.planting },
    { icon: CloudSun, title: 'Weather Conditions', body: category.weather },
    { icon: Wheat, title: 'Yield & Harvesting', body: category.yieldHarvesting },
    { icon: ShoppingBag, title: 'Marketing', body: category.marketing },
    { icon: TrendingUp, title: 'Profit Sharing', body: category.profitSharing },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[104px] lg:pt-[120px] bg-green-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url('${category.image}')` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/70 via-green-950/50 to-green-950" />
        <div className="container-custom relative z-10 py-14 lg:py-20">
          <Link to="/agrovest" className="inline-flex items-center gap-2 text-green-200 hover:text-white text-sm mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Agrovest
          </Link>
          <Badge className="bg-amber-400 text-green-950 mb-4">{category.tag}</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 max-w-3xl">{category.name}</h1>
          <p className="text-green-200 text-lg max-w-2xl">{category.tagline}</p>
          <div className="flex items-center gap-2 text-green-300 text-sm mt-6">
            <MapPin className="h-4 w-4" /> Ijebu-Ife, Off Ijebu-Ode, Ogun State
          </div>
        </div>
      </section>

      {/* Image + description */}
      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden aspect-[4/3]">
            <picture>
              <source srcSet={category.image.replace(/\.jpe?g$/i, '.webp')} type="image/webp" />
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </picture>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-900 mb-4">About This {category.tag}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{category.description}</p>
            <Button className="bg-green-700 hover:bg-green-800" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Invest in a Plot — ₦{PLOT_PRICE.toLocaleString()}
            </Button>
          </div>
        </div>
      </section>

      {/* Info sections */}
      <section className="section-padding bg-green-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 text-center mb-10">
            Everything You Need to Know
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {infoSections.map((s) => (
              <Card key={s.title} className="border-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <s.icon className="h-5 w-5 text-green-700" />
                    <h3 className="font-bold text-green-900">{s.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key benefits */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 text-center mb-8">Key Benefits</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {category.benefits.map((b) => (
              <div key={b} className="flex items-start gap-3 bg-white border border-green-100 rounded-xl p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm text-green-900">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore other categories */}
      <section className="section-padding bg-green-950 text-white">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Explore Other Categories</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                to={`/agrovest/${c.slug}`}
                className="relative rounded-2xl overflow-hidden aspect-square group"
              >
                <picture>
                  <source srcSet={c.image.replace(/\.jpe?g$/i, '.webp')} type="image/webp" />
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/90 via-green-950/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold text-white">{c.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-green-950 font-bold">
              <Link to="/agrovest">View Full Agrovest Estate</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default AgrovestCategoryDetail;
