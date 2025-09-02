import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyGrid from '../components/properties/PropertyGrid';
import { Toaster } from '@/components/ui/toaster';
import { PropertyProvider } from '../contexts/property';
import { Home, MapPin, Bed, Bath, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomesSales = () => {
  return (
    <PropertyProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-estate-blue to-estate-darkBlue text-white py-20">
          <div className="container-custom text-center">
            <div className="flex justify-center mb-6">
              <Home size={60} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Luxury Homes for Sale & Rent</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Discover premium residential properties across Lagos, Asaba, and Ogun State. 
              From modern apartments to luxury detached homes.
            </p>
          </div>
        </section>

        {/* Properties Section */}
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Available Homes for Sale & Rent</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse our collection of luxury homes, apartments, and rental properties in prime locations. Find your dream home for purchase or rent.
              </p>
              <div className="mt-4">
                <Link 
                  to="/properties" 
                  className="text-estate-blue hover:text-estate-darkBlue underline"
                >
                  View All Properties →
                </Link>
              </div>
            </div>
            
            <PropertyFilters />
            <PropertyGrid filterCategory="home" />
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Homes?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <MapPin size={50} className="text-estate-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Prime Locations</h3>
                <p className="text-gray-600">Properties in the most desirable areas of Lagos, Asaba, and Ogun State</p>
              </div>
              <div className="text-center">
                <Bed size={50} className="text-estate-red mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Modern Amenities</h3>
                <p className="text-gray-600">Fully equipped with contemporary features and luxury finishes</p>
              </div>
              <div className="text-center">
                <DollarSign size={50} className="text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Flexible Payment</h3>
                <p className="text-gray-600">Multiple payment options for both purchase and rental agreements</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <WhatsAppChat />
        <Toaster />
      </div>
    </PropertyProvider>
  );
};

export default HomesSales;