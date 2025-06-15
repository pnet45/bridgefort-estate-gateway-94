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
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Properties = () => {
  const locationHook = useLocation();

  // Helper to parse URL and sync search state on mount
  useEffect(() => {
    // This will run only after the context is available (i.e., inside PropertyProvider's children)
    // So wrap with setTimeout 0 to ensure it's after PropertyProvider is mounted
    setTimeout(() => {
      const searchParams = new URLSearchParams(locationHook.search);

      const searchQuery = searchParams.get("q") || "";
      const locationParam = searchParams.get("location") || "";
      const propertyType = searchParams.get("type") || "";
      const priceRange = searchParams.get("priceRange") || "";

      // Access property context and update accordingly
      // We'll grab context in the child below so this effect runs only once but updates at the right place
      const contextUpdater = (window as any).__propertyContextUpdater__;
      if (contextUpdater) {
        contextUpdater({
          searchQuery,
          filters: {
            category: 'all',
            type: propertyType || 'all',
            minPrice: priceRange ? priceRange.split('-')[0] : '',
            maxPrice: priceRange
              ? (priceRange.split('-')[1]?.replace('+', '') || '')
              : '',
          },
        });
      }
    }, 0);
  }, [locationHook.search]);

  return (
    <PropertyProvider>
      <PropertyContextBridge>
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
      </PropertyContextBridge>
    </PropertyProvider>
  );
};

export default Properties;

// PropertyContextBridge (below) is used to allow the useEffect above to access the context and update the query/filters
import { usePropertyContext } from '../contexts/property';

const PropertyContextBridge = ({ children }: { children: React.ReactNode }) => {
  const { setSearchQuery, setFilters } = usePropertyContext();

  // Expose updater to window (for hacky effect on first mount)
  (window as any).__propertyContextUpdater__ = ({
    searchQuery,
    filters,
  }: {
    searchQuery: string;
    filters: any;
  }) => {
    setSearchQuery(searchQuery);
    setFilters(filters);
  };

  return <>{children}</>;
};
