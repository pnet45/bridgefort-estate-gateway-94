
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PropertyCard from '../PropertyCard';
import { usePropertyContext } from '@/contexts/property';

const FeaturedProperties = () => {
  const { filteredProperties, loading } = usePropertyContext();

  // Show the latest 3 properties from database
  const featured = filteredProperties.slice(0, 3);

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12 animate-fade-in focus-box-in">
          <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our selection of premium properties, handpicked for their exceptional value and investment potential. Buy plots directly online!
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured properties" aria-busy="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-56 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-8 w-2/5 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((property, index) => (
              <div
                key={property.id}
                className="animate-fade-in focus-box-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-12 animate-fade-in">
          <Link 
            to="/properties" 
            className="inline-flex items-center text-estate-blue font-medium hover:text-estate-darkBlue transition duration-200 focus-box-in"
          >
            View all properties 
            <ArrowRight size={18} className="ml-2" />
          </Link>
          <div>||
          </div>
          <Link 
            to="https://forms.gle/AdJt5YcxiG118Bo56" 
            className="inline-flex items-center text-estate-blue font-medium hover:text-estate-darkBlue transition duration-200 focus-box-in"
          >
            Land Purchase Inquiry 
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
