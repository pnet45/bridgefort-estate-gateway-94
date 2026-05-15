import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppChat from '@/components/WhatsAppChat';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ArrowRight } from 'lucide-react';
import { locations } from '@/data/locations';

const SITE_URL = 'https://bridgefort.lovable.app';

const LocationsIndex = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Land for Sale in Nigeria by Location | Bridgefort Homes</title>
        <meta
          name="description"
          content="Browse verified estate land for sale across Lagos, Asaba, Port Harcourt, Owerri, Ogun & more. Bridgefort Homes location guides with prices and ROI."
        />
        <link rel="canonical" href={`${SITE_URL}/locations`} />
        <meta property="og:title" content="Land for Sale in Nigeria by Location | Bridgefort Homes" />
        <meta property="og:url" content={`${SITE_URL}/locations`} />
      </Helmet>

      <Navbar />
      <main className="flex-grow pt-20">
        <section className="bg-gradient-to-br from-estate-blue to-estate-darkBlue text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Investment Locations Across Nigeria</h1>
            <p className="text-lg max-w-3xl opacity-90">
              Explore verified, titled estate land across Lagos, Asaba, Port Harcourt, Owerri and more — with location-specific prices, ROI guides and FAQs.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container-custom grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map(loc => (
              <Link key={loc.slug} to={`/locations/${loc.slug}`}>
                <Card className="h-full hover:shadow-lg hover:border-estate-blue transition-all">
                  <CardContent className="p-6">
                    <MapPin className="text-estate-blue mb-3" />
                    <h2 className="text-xl font-bold mb-1">{loc.name}</h2>
                    <p className="text-sm text-gray-500 mb-3">{loc.state} · {loc.region}</p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{loc.intro}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-estate-blue">{loc.priceRange}</span>
                      <ArrowRight className="w-4 h-4 text-estate-blue" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default LocationsIndex;
