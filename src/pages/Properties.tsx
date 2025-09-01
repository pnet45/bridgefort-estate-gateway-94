import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyHero from '../components/properties/PropertyHero';
import PropertyList from '../components/properties/PropertyList';
import SubscriptionGuide from '../components/properties/SubscriptionGuide';
import PurchaseGuide from '../components/properties/PurchaseGuide';
import { Toaster } from '@/components/ui/toaster';
import { PropertyProvider } from '../contexts/property';

const Properties = () => {
  return (
    <PropertyProvider>
      <div className="flex flex-col min-h-screen">
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
        <Toaster />
      </div>
    </PropertyProvider>
  );
};

export default Properties;
