
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyHero from '../components/properties/PropertyHero';
import PropertyList from '../components/properties/PropertyList';
import { PropertyProvider } from '../contexts/PropertyContext';

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

        <Footer />
      </div>
    </PropertyProvider>
  );
};

export default Properties;
