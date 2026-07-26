import { useState, useRef, useEffect } from 'react';
import { Search, X, BellPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePropertyContext } from '../contexts/property';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

const PropertySearch = () => {
  const [expanded, setExpanded] = useState(false);
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { setSearchQuery, setFilters } = usePropertyContext();
  const { user } = useAuth();
  const [savingSearch, setSavingSearch] = useState(false);
  const [searchLabel, setSearchLabel] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const hasCriteria = !!(location || propertyType || priceRange || searchText);

  const handleSaveSearch = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to save searches and get alerts.' });
      return;
    }
    if (!searchLabel.trim()) return;

    setSavingSearch(true);
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      minPrice = min ? Number(min) : null;
      maxPrice = max ? Number(max.replace('+', '')) : null;
    }

    // Cast: saved_searches is introduced by a migration and isn't in the
    // generated Supabase types until they're regenerated against the live schema.
    const { error } = await (supabase.from('saved_searches') as any).insert({
      user_id: user.id,
      label: searchLabel.trim(),
      location: location || null,
      type: propertyType || null,
      min_price: minPrice,
      max_price: maxPrice,
    });
    setSavingSearch(false);

    if (error) {
      console.error('Failed to save search:', error);
      toast({ title: 'Could not save search', description: error.message, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Search saved',
      description: "We'll notify you when a new listing matches these criteria.",
    });
    setShowSaveInput(false);
    setSearchLabel('');
  };

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [expanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location && !propertyType && !priceRange && !searchText) {
      toast({
        title: "Search Parameters Required",
        description: "Please enter at least one search criteria.",
        variant: "destructive",
      });
      return;
    }

    let searchQuery = '';
    if (searchText) searchQuery = searchText;
    else if (location) searchQuery = location;

    if (searchQuery) setSearchQuery(searchQuery);

    const newFilters = { category: 'all', type: propertyType || 'all', minPrice: '', maxPrice: '' };
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-');
      newFilters.minPrice = minPrice || '';
      newFilters.maxPrice = maxPrice?.replace('+', '') || '';
    }
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (location) params.set("location", location);
    if (propertyType) params.set("type", propertyType);
    if (priceRange) params.set("priceRange", priceRange);

    navigate({ pathname: '/properties', search: params.toString() });
    setExpanded(false);

    toast({ title: "Search Initiated", description: "Redirecting to search results..." });
  };

  return (
    <div
      ref={wrapRef}
      className="-mt-20 relative z-10 mx-auto w-full max-w-5xl animate-fade-in flex justify-center"
    >
      {/* Collapsed trigger button */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Open search"
          className="group inline-flex items-center gap-2 md:gap-3 bg-white dark:bg-card px-5 py-3 md:px-7 md:py-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-estate-purple/20"
        >
          <Search size={20} className="text-estate-blue transition-transform group-hover:rotate-12" />
          <span className="font-semibold text-estate-blue text-base md:text-lg">Search</span>
        </button>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div
          className={
            // Mobile: vertical dropdown from trigger (animate-fade-in + scale)
            // Desktop: horizontal expansion
            "bg-white dark:bg-card p-4 md:p-5 rounded-2xl shadow-2xl w-full border border-estate-purple/20 " +
            "origin-top animate-scale-in md:animate-fade-in"
          }
        >
          <form onSubmit={handleSubmit}>
            {/* Mobile: vertical stack. Desktop: 5-col row */}
            <div className="flex flex-col md:grid md:grid-cols-5 gap-3 md:gap-4">
              <div className="md:col-span-1 animate-fade-in" style={{ animationDelay: '0ms' }}>
                <label htmlFor="searchText" className="block text-sm font-medium text-foreground mb-1">Search</label>
                <input
                  id="searchText"
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Name, location, price..."
                  className="input-field w-full text-black focus:text-black"
                  autoFocus
                />
              </div>

              <div className="md:col-span-1 animate-fade-in" style={{ animationDelay: '60ms' }}>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">Location</label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field w-full text-black focus:text-black"
                >
                  <option value="">Any Location</option>
                  <option value="lagos">Lagos</option>
                  <option value="abuja">Abuja</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="ibadan">Ibadan</option>
                  <option value="owerri">Owerri</option>
                  <option value="warri">Warri</option>
                  <option value="imo">Imo State</option>
                  <option value="ondo">Ondo State</option>
                  <option value="enugu">Enugu State</option>
                  <option value="abia">Abia State</option>
                  <option value="anambra">Anambra State</option>
                  <option value="delta">Delta State</option>
                  <option value="ogun">Ogun State</option>
                  <option value="akwa-ibom">Akwa Ibom State</option>
                </select>
              </div>

              <div className="md:col-span-1 animate-fade-in" style={{ animationDelay: '120ms' }}>
                <label htmlFor="propertyType" className="block text-sm font-medium text-foreground mb-1">Property Type</label>
                <select
                  id="propertyType"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="input-field w-full text-black focus:text-black"
                >
                  <option value="">Any Type</option>
                  <option value="land">Land</option>
                  <option value="home">Homes & Apartments</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="terrace">Terrace</option>
                  <option value="detached">Detached</option>
                  <option value="semi-detached">Semi-Detached</option>
                </select>
              </div>

              <div className="md:col-span-1 animate-fade-in" style={{ animationDelay: '180ms' }}>
                <label htmlFor="priceRange" className="block text-sm font-medium text-foreground mb-1">Price Range</label>
                <select
                  id="priceRange"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="input-field w-full text-black focus:text-black"
                >
                  <option value="">Any Price</option>
                  <option value="0-10000000">₦0 - ₦10M</option>
                  <option value="10000000-30000000">₦10M - ₦30M</option>
                  <option value="30000000-50000000">₦30M - ₦50M</option>
                  <option value="50000000-100000000">₦50M - ₦100M</option>
                  <option value="100000000+">₦100M+</option>
                </select>
              </div>

              <div className="md:col-span-1 flex items-end gap-2 animate-fade-in" style={{ animationDelay: '240ms' }}>
                <button
                  type="submit"
                  className="flex-1 bg-estate-blue hover:bg-estate-darkBlue text-white py-2 px-4 rounded flex items-center justify-center transition duration-300 hover:scale-105 focus:ring-2 focus:ring-purple-500"
                >
                  <Search size={18} className="mr-2" />
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Close search"
                  className="p-2 rounded border border-border hover:bg-muted transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {hasCriteria && (
              <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center gap-2 animate-fade-in">
                {!showSaveInput ? (
                  <button
                    type="button"
                    onClick={() => setShowSaveInput(true)}
                    className="inline-flex items-center gap-1.5 text-sm text-estate-purple hover:text-estate-blue font-medium"
                  >
                    <BellPlus size={16} />
                    Save this search &amp; get alerts for new matches
                  </button>
                ) : (
                  <div className="flex flex-1 gap-2">
                    <input
                      type="text"
                      value={searchLabel}
                      onChange={(e) => setSearchLabel(e.target.value)}
                      placeholder="Name this search (e.g. 'Lagos land under 30M')"
                      className="input-field flex-1 text-black focus:text-black text-sm"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveSearch}
                      disabled={savingSearch || !searchLabel.trim()}
                      className="bg-estate-purple hover:bg-estate-blue text-white text-sm px-4 rounded transition disabled:opacity-50"
                    >
                      {savingSearch ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSaveInput(false)}
                      className="p-2 rounded border border-border hover:bg-muted transition"
                      aria-label="Cancel save search"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default PropertySearch;
