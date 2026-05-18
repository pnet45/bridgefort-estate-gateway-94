import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Listing } from '@/types/listing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingCard from '@/components/listings/ListingCard';
import ListingFilters, { ListingFilterState } from '@/components/listings/ListingFilters';
import RegionSpotlightCards from '@/components/listings/RegionSpotlightCards';
import { LayoutGrid, List, Loader2, Plus, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

const defaultFilters: ListingFilterState = {
  region: 'all',
  propertyType: 'all',
  pricePeriod: 'all',
  minPrice: '',
  maxPrice: '',
  minBeds: 'all',
  search: '',
};

const Listings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilterState>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setListings(data as unknown as Listing[]);
    }
    setLoading(false);
  };

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach(l => {
      counts[l.region] = (counts[l.region] || 0) + 1;
    });
    return counts;
  }, [listings]);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (filters.region !== 'all' && l.region !== filters.region) return false;
      if (filters.propertyType !== 'all' && l.property_type !== filters.propertyType) return false;
      if (filters.pricePeriod !== 'all' && l.price_period !== filters.pricePeriod) return false;
      if (filters.minPrice && l.price_amount < Number(filters.minPrice)) return false;
      if (filters.maxPrice && l.price_amount > Number(filters.maxPrice)) return false;
      if (filters.minBeds !== 'all' && l.bedrooms < Number(filters.minBeds)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match = [l.title, l.city, l.estate, l.region, l.description, l.address]
          .filter(Boolean)
          .some(f => f!.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [listings, filters]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-10 lg:py-16">
          <div className="container-custom">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-2">Premium Property Listings</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Explore verified luxury properties across Lagos, Asaba, Port Harcourt, and Ogun. Filter by region, type, and budget.
            </p>
          </div>
        </section>

        <div className="container-custom py-8 space-y-8">
          {/* Region spotlight cards */}
          <RegionSpotlightCards
            selectedRegion={filters.region}
            onSelect={(region) => setFilters(prev => ({ ...prev, region }))}
            counts={regionCounts}
          />

          {/* Filters */}
          <ListingFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
            showAdvanced={showAdvanced}
            onToggleAdvanced={() => setShowAdvanced(p => !p)}
          />

          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'listing' : 'listings'} found`}
            </p>
            <div className="flex items-center gap-1">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Listings grid/list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-semibold text-foreground">No listings found</p>
              <p className="text-muted-foreground mt-2">Try adjusting your filters or check back soon for new properties.</p>
              <Button variant="outline" className="mt-4" onClick={() => setFilters(defaultFilters)}>Clear Filters</Button>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : 'flex flex-col gap-4'
            }>
              {filtered.map(listing => (
                <ListingCard key={listing.id} listing={listing} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
