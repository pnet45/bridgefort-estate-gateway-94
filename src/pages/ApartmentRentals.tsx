import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyGrid from '../components/properties/PropertyGrid';
import { Toaster } from '@/components/ui/toaster';
import { PropertyProvider } from '../contexts/property';
import { Building2, Key, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApartmentRentals = () => {
  return (
    <PropertyProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-estate-red to-red-700 text-white py-20">
          <div className="container-custom text-center">
            <div className="flex justify-center mb-6">
              <Building2 size={60} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Premium Apartment Rentals</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Discover luxury apartments and rental properties in prime locations across Nigeria. 
              Move in today with flexible rental terms.
            </p>
          </div>
        </section>

        {/* Properties Section */}
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Available Rental Properties</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse our collection of premium apartments, houses, and commercial spaces available for rent.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Link 
                  to="/homes-sales" 
                  className="text-estate-red hover:text-red-700 underline"
                >
                  View Properties for Sale →
                </Link>
                <Link 
                  to="/properties" 
                  className="text-estate-red hover:text-red-700 underline"
                >
                  View All Properties →
                </Link>
              </div>
            </div>
            
            <PropertyFilters />
            <PropertyGrid filterCategory="rental" enhanced={true} />
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">Why Rent With Us?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Key size={50} className="text-estate-red mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Move-in Ready</h3>
                <p className="text-gray-600">All rental properties are fully furnished and ready for immediate occupation</p>
              </div>
              <div className="text-center">
                <Calendar size={50} className="text-estate-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Flexible Terms</h3>
                <p className="text-gray-600">Choose from monthly, quarterly, or annual rental agreements to suit your needs</p>
              </div>
              <div className="text-center">
                <Building2 size={50} className="text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Premium Locations</h3>
                <p className="text-gray-600">Properties in the most desirable neighborhoods with excellent amenities</p>
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

export default ApartmentRentals;