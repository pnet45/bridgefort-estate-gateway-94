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
    <section className="section-padding bg-background text-foreground">
      <div className="container-custom">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in focus-box-in">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Featured Properties</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-1 sm:px-0">
            Explore our selection of premium properties, handpicked for their exceptional value and investment potential. Buy plots directly online!
          </p>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-base sm:text-lg" role="status" aria-live="polite">
            Loading properties...
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {featured.map((property, index) => (
              <div
                key={property.id}
                className="min-w-0 animate-fade-in focus-box-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-5 py-10 sm:px-8 text-center">
            <p className="font-semibold text-foreground">No properties to display right now.</p>
            <p className="mt-2 text-sm text-muted-foreground">Please check back soon or contact our team for available locations.</p>
            <Link
              to="/properties"
              className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-estate-gold px-5 py-3 font-semibold text-black transition-colors hover:bg-estate-gold/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-estate-gold"
            >
              Browse all properties <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        )}
        <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 animate-fade-in">
          <Link
            to="/properties"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-estate-gold px-5 py-3 text-center font-semibold text-foreground transition-colors hover:bg-estate-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-estate-gold"
          >
            View all properties <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link
            to="https://forms.gle/AdJt5YcxiG118Bo56"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-estate-gold px-5 py-3 text-center font-semibold text-black transition-colors hover:bg-estate-gold/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-estate-gold"
          >
            Land Purchase Inquiry <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
