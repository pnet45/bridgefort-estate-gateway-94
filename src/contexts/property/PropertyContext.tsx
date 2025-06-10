
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Filters, PropertyContextType } from './types';
import { applyFilters, applyCustomFilters } from './propertyUtils';
import { supabase } from '@/integrations/supabase/client';

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hiddenProperties, setHiddenProperties] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    type: 'all',
    minPrice: '',
    maxPrice: ''
  });

  // Function to toggle filters visibility
  const toggleFilters = () => setShowFilters(!showFilters);

  // Function to toggle property visibility
  const togglePropertyVisibility = (propertyId: string) => {
    setHiddenProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Function to fetch properties from Supabase
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data: estates, error } = await supabase
        .from('estate')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (estates) {
        // Convert database estates to our Property format
        const propertyData: Property[] = estates.map((estate: any) => {
          // Determine price based on available price fields
          let price = 'Price on Request';
          let pricePerPlot = 0;
          
          if (estate.promo_price) {
            price = `₦${estate.promo_price.toLocaleString()}`;
            pricePerPlot = estate.promo_price;
          } else if (estate.prelaunch_price && estate.actual_price) {
            price = `Pre-Launch: ₦${estate.prelaunch_price.toLocaleString()} | Actual: ₦${estate.actual_price.toLocaleString()}`;
            pricePerPlot = estate.prelaunch_price;
          } else if (estate.actual_price) {
            price = `₦${estate.actual_price.toLocaleString()}`;
            pricePerPlot = estate.actual_price;
          }

          // Calculate plot information
          const totalPlots = estate.total_plots || 100; // Default to 100 if not specified
          const soldPlots = estate.sold_plots || Math.floor(Math.random() * 30); // Random sold plots if not specified
          const availablePlots = totalPlots - soldPlots;

          return {
            id: estate.id,
            name: estate.name,
            title: estate.name, // For backward compatibility
            location: estate.location || '',
            price: price, // For backward compatibility
            imageUrl: estate.media && estate.media.length > 0 ? estate.media[0] : '/placeholder.svg',
            size: estate.size || 0,
            sqm: estate.size || 0, // For backward compatibility
            propertyType: estate.type || 'Land',
            phase: estate.phase || 1,
            totalPlots,
            availablePlots: Math.max(0, availablePlots),
            pricePerPlot,
            description: estate.description,
            media: estate.media,
            subForm: estate.sub_form,
            type: estate.type,
            promoPrice: estate.promo_price,
            actualPrice: estate.actual_price,
            prelaunchPrice: estate.prelaunch_price,
            scheme: estate.scheme
          };
        });
        
        setProperties(propertyData);
        setFilteredProperties(applyFilters(propertyData, searchQuery, filters));
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update filtered properties when search query or filters change
  useEffect(() => {
    setFilteredProperties(applyFilters(properties, searchQuery, filters));
  }, [properties, searchQuery, filters]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const setFilter = (filter: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
  }) => {
    setFilteredProperties(applyCustomFilters(properties, filter));
  };
  
  const refreshProperties = async () => {
    await fetchProperties();
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        filteredProperties,
        loading,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        showFilters,
        toggleFilters,
        setFilter,
        refreshProperties,
        // Legacy properties for backward compatibility
        searchTerm: searchQuery,
        setSearchTerm: setSearchQuery,
        selectedProperty,
        setSelectedProperty,
        hiddenProperties,
        togglePropertyVisibility
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
};
