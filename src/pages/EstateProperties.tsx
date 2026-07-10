import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppChat from '../components/WhatsAppChat';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyGrid from '../components/properties/PropertyGrid';
import { Toaster } from '@/components/ui/toaster';
import { PropertyProvider } from '../contexts/property';
import { MapPin, Layers, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const EstateProperties = () => {
  return (
    <PropertyProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-estate-blue to-estate-darkBlue text-white py-20">
          <div className="container-custom text-center">
            <div className="flex justify-center mb-6">
              <Layers size={60} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Premium Estate Lands</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Discover prime land plots across Nigeria's most promising locations. 
              Perfect for investment, development, or future homes.
            </p>
          </div>
        </section>

        {/* Properties Section */}
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Available Estate Land Plots</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse our collection of premium land estates with flexible payment plans and secure documentation.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Link 
                  to="/homes-sales" 
                  className="text-estate-blue hover:text-estate-darkBlue underline"
                >
                  View Homes & Apartments →
                </Link>
                <Link 
                  to="/properties" 
                  className="text-estate-blue hover:text-estate-darkBlue underline"
                >
                  View All Properties →
                </Link>
              </div>
            </div>
            
            <PropertyFilters />
            <PropertyGrid filterCategory="land" enhanced={true} />
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">Why Invest in Our Estates?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <MapPin size={50} className="text-estate-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Strategic Locations</h3>
                <p className="text-gray-600">Properties in rapidly developing areas with excellent growth potential</p>
              </div>
              <div className="text-center">
                <Layers size={50} className="text-estate-red mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Secure Documentation</h3>
                <p className="text-gray-600">All properties come with proper documentation and clear titles</p>
              </div>
              <div className="text-center">
                <TrendingUp size={50} className="text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">High ROI Potential</h3>
                <p className="text-gray-600">Carefully selected locations with strong appreciation potential</p>
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

export default EstateProperties;