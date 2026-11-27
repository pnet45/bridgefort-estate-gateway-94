import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyHero from '../components/properties/PropertyHero';
import PropertyList from '../components/properties/PropertyList';
import SubscriptionGuide from '../components/properties/SubscriptionGuide';
import PurchaseGuide from '../components/properties/PurchaseGuide';
import { PropertyProvider } from '../contexts/property';
import { Helmet } from 'react-helmet-async';

const Properties = () => {
  return (
    <PropertyProvider>
      <div className="flex flex-col min-h-screen">
        <Helmet>
          <title>Land & Property for Sale in Nigeria | Bridgefort Homes</title>
          <meta name="description" content="Explore available residential estates, land plots and commercial properties across Nigeria. Compare locations, prices and flexible subscription options with Bridgefort Homes." />
          <link rel="canonical" href="https://www.bridgeforthomes.com/properties" />
          <meta property="og:title" content="Land & Property for Sale in Nigeria | Bridgefort Homes" />
          <meta property="og:description" content="Explore available estates, land plots and commercial properties across Nigeria." />
          <meta property="og:url" content="https://www.bridgeforthomes.com/properties" />
          <meta property="og:type" content="website" />
        </Helmet>
        <Navbar />
        <PropertyHero />

        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Browse Properties</h2>
              <p className="text-gray-600">Explore our available land plots, homes, and commercial properties</p>
              <div className="mt-6">
                <a href="/homes-sales" className="bg-estate-blue text-white px-6 py-3 rounded-lg hover:bg-estate-darkBlue transition-colors">
                  View Luxury Homes & Apartments →
                </a>
              </div>
            </div>
            <PropertyFilters />
            <PropertyList />
          </div>
        </section>

        {/* Purchase Guide */}
        <PurchaseGuide />

        {/* Subscription Guide */}
        <SubscriptionGuide />

        <Footer />
        <WhatsAppChat />
      </div>
    </PropertyProvider>
  );
};

export default Properties;
