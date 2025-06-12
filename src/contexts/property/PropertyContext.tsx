
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Filters, PropertyContextType } from './types';
import { applyFilters, applyCustomFilters } from './propertyUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
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
      // Always fetch from estate table
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

          // Calculate plot information - check for sold out estates
          const totalPlots = estate.total_plots || 100;
          const soldPlots = estate.sold_plots || 0;
          const availablePlots = Math.max(0, totalPlots - soldPlots);

          return {
            id: estate.id,
            name: estate.name,
            title: estate.name, // For backward compatibility
            location: estate.location || '',
            price: price, // Required field
            imageUrl: estate.media && estate.media.length > 0 ? estate.media[0] : '/placeholder.svg',
            size: estate.size || 0,
            sqm: estate.size || 0, // Required field
            propertyType: estate.type || 'Land',
            phase: estate.phase || 1,
            totalPlots,
            availablePlots,
            pricePerPlot,
            description: estate.description,
            media: estate.media,
            subForm: estate.sub_form,
            type: estate.type,
            promoPrice: estate.promo_price,
            actualPrice: estate.actual_price,
            prelaunchPrice: estate.prelaunch_price,
            scheme: estate.scheme,
            features: [], // Default empty array
            amenities: [], // Default empty array
            paymentPlans: [] // Default empty array
          };
        });
        
        setProperties(propertyData);
        setFilteredProperties(applyFilters(propertyData, searchQuery, filters));
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Fallback to sample data on error
      const sampleProperties: Property[] = [
        {
          id: '1',
          name: 'Bridgefort County',
          title: 'Bridgefort County',
          location: 'Ogun State',
          price: '₦2,500,000',
          imageUrl: '/lovable-uploads/Bridgefort County - Lagoon Front .jpg',
          size: 600,
          sqm: 600,
          propertyType: 'Residential Land',
          phase: 1,
          totalPlots: 200,
          availablePlots: 150,
          pricePerPlot: 2500000,
          description: 'Premium waterfront estate',
          features: [],
          amenities: [],
          paymentPlans: []
        },
        {
          id: '2',
          name: 'Precious Gardens Estate',
          title: 'Precious Gardens Estate',
          location: 'Lagos State',
          price: '₦3,200,000',
          imageUrl: '/lovable-uploads/Precious Gardens Estate.jpg',
          size: 500,
          sqm: 500,
          propertyType: 'Residential Land',
          phase: 2,
          totalPlots: 150,
          availablePlots: 85,
          pricePerPlot: 3200000,
          description: 'Luxury residential estate',
          features: [],
          amenities: [],
          paymentPlans: []
        }
      ];
      
      setProperties(sampleProperties);
      setFilteredProperties(applyFilters(sampleProperties, searchQuery, filters));
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
  }, []); // Remove user dependency to always fetch

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
