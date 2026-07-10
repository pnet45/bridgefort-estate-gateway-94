import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppChat from '@/components/WhatsAppChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { getLocationBySlug, locations } from '@/data/locations';

const SITE_URL = 'https://bridgefort.lovable.app';

const LocationLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const loc = slug ? getLocationBySlug(slug) : undefined;

  if (!loc) return <Navigate to="/properties" replace />;

  const canonical = `${SITE_URL}/locations/${loc.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Place',
        name: `${loc.name}, ${loc.state}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: loc.name,
          addressRegion: loc.state,
          addressCountry: 'NG',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Locations', item: `${SITE_URL}/locations` },
          { '@type': 'ListItem', position: 3, name: `${loc.name}, ${loc.state}`, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: loc.faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  const otherLocations = locations.filter(l => l.slug !== loc.slug).slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>{loc.metaTitle}</title>
        <meta name="description" content={loc.metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={loc.metaTitle} />
        <meta property="og:description" content={loc.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={loc.metaTitle} />
        <meta name="twitter:description" content={loc.metaDescription} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-estate-blue to-estate-darkBlue text-white py-16 md:py-24">
          <div className="container-custom">
            <nav className="text-sm mb-4 opacity-80">
              <Link to="/" className="hover:underline">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/properties" className="hover:underline">Properties</Link>
              <span className="mx-2">/</span>
              <span>{loc.name}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{loc.heroTitle}</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-3xl mb-6">{loc.intro}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-estate-blue hover:bg-gray-100">
                <Link to={`/properties?q=${encodeURIComponent(loc.name)}`}>Browse {loc.name} Plots</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/contact">Speak to an Advisor</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Invest */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Why Invest in {loc.name}, {loc.state}?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {loc.whyInvest.map((reason, i) => (
                <Card key={i} className="border-l-4 border-estate-blue">
                  <CardContent className="p-6 flex gap-4">
                    <TrendingUp className="text-estate-blue flex-shrink-0 mt-1" />
                    <p>{reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick facts */}
        <section className="py-16">
          <div className="container-custom grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <MapPin className="text-estate-blue mb-2" />
                <h3 className="font-bold mb-2">Popular Estates & Areas</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  {loc.popularEstates.map(e => <li key={e}>• {e}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <TrendingUp className="text-estate-blue mb-2" />
                <h3 className="font-bold mb-2">Price Range</h3>
                <p className="text-2xl font-bold text-estate-blue mb-2">{loc.priceRange}</p>
                <p className="text-sm text-gray-600">{loc.roiNote}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <ShieldCheck className="text-estate-blue mb-2" />
                <h3 className="font-bold mb-2">Nearby Communities</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  {loc.nearbyCommunities.map(c => <li key={c}>• {c}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom max-w-3xl">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {loc.name} Real Estate FAQs
            </h2>
            {loc.faqs.map((f, i) => (
              <Card key={i} className="mb-4">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">{f.q}</h3>
                  <p className="text-gray-700">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Internal links - other locations */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-2xl font-bold mb-6">Explore Other Investment Locations</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {otherLocations.map(o => (
                <Link
                  key={o.slug}
                  to={`/locations/${o.slug}`}
                  className="group flex items-center justify-between p-4 border rounded-lg hover:border-estate-blue hover:shadow-md transition-all"
                >
                  <div>
                    <p className="font-semibold">{o.name}</p>
                    <p className="text-xs text-gray-500">{o.state}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-estate-blue group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-estate-blue text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Invest in {loc.name}?</h2>
            <p className="mb-6 opacity-90">Talk to a Bridgefort advisor today and reserve your plot.</p>
            <Button asChild size="lg" className="bg-white text-estate-blue hover:bg-gray-100">
              <Link to="/contact">Get In Touch</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default LocationLanding;
