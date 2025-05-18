
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Filters, PropertyContextType } from './types';
import { sampleProperties } from './sampleData';
import { applyFilters, applyCustomFilters } from './propertyUtils';
import { supabase } from '@/integrations/supabase/client';

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(sampleProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(sampleProperties);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    type: 'all',
    minPrice: '',
    maxPrice: ''
  });

  // Function to toggle filters visibility
  const toggleFilters = () => setShowFilters(!showFilters);

  // Function to fetch properties from Supabase (can be implemented later)
  const fetchProperties = async () => {
    setLoading(true);
    try {
      // In the future, this could be replaced with a real API call
      // const { data, error } = await supabase.from('properties').select('*');
      // if (data) setProperties(data);
      
      // For now, we're using the sample data
      setProperties(sampleProperties);
      setFilteredProperties(applyFilters(sampleProperties, searchQuery, filters));
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
        refreshProperties
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
