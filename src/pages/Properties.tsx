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
