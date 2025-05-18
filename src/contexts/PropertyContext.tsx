
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  sqm: number;
  propertyType: string;
  phase?: number;
}

interface Filters {
  category: string;
  type: string;
  minPrice: string | number;
  maxPrice: string | number;
}

interface PropertyContextType {
  properties: Property[];
  filteredProperties: Property[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  setFilter: (filter: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
  }) => void;
  refreshProperties: () => Promise<void>;
}

// Sample data for properties
const sampleProperties = [
  {
    id: '1',
    title: 'Hampton Ville Estate',
    location: 'Itoikin, Epe, Lagos',
    price: '₦3,500,000',
    imageUrl: '/lovable-uploads/5f92d89a-e9fc-4c84-a49d-72cb376b8510.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 1
  },
  {
    id: '2',
    title: 'Fortress Hills Estate',
    location: 'Imota, Ikorodu, Lagos',
    price: '₦4,000,000',
    imageUrl: '/lovable-uploads/b6b178d0-ae26-4527-9569-dce064d705b9.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 1
  },
  {
    id: '3',
    title: 'Precious Garden Estate',
    location: 'Ode-Omi Via Ibeju-Lekki, Lagos',
    price: '₦1,500,000',
    imageUrl: '/lovable-uploads/5c033a2a-1e10-49b7-b7de-5b56e384b9d5.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 1
  },
  {
    id: '4',
    title: 'Estate Four',
    location: 'Lagos Island, Lagos',
    price: '₦5,000,000',
    imageUrl: '/lovable-uploads/0ce2a221-82bc-451d-96af-0c1941da3e67.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 1
  },
  {
    id: '5',
    title: 'Estate Five',
    location: 'Victoria Island, Lagos',
    price: '₦10,000,000',
    imageUrl: '/lovable-uploads/d22fc324-491b-4130-abe6-8ca58eea41f5.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 1
  },
  {
    id: '6',
    title: 'Estate Six',
    location: 'Lekki, Lagos',
    price: '₦8,500,000',
    imageUrl: '/lovable-uploads/e31d4e61-7436-4a63-a118-84656f87dd4c.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 1
  },
  {
    id: '7',
    title: 'Estate Seven',
    location: 'Ajah, Lagos',
    price: '₦7,000,000',
    imageUrl: '/lovable-uploads/4f01a4aa-9e4d-4670-8ae0-1d983713856f.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 2
  },
  {
    id: '8',
    title: 'Estate Eight',
    location: 'Ikeja, Lagos',
    price: '₦6,200,000',
    imageUrl: '/lovable-uploads/45a1964f-920e-46ef-b23a-31c95fe79867.png',
    sqm: 500,
    propertyType: 'Land',
    phase: 2
  },
];

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
      applyFilters(sampleProperties, searchQuery, filters);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to properties
  const applyFilters = (props: Property[], query: string, filterOptions: Filters) => {
    let filtered = [...props];

    // Apply search query filter
    if (query) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query.toLowerCase()) ||
        property.location.toLowerCase().includes(query.toLowerCase()) ||
        property.propertyType.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply category filter
    if (filterOptions.category && filterOptions.category !== 'all') {
      // Filter by category (could be extended based on your data model)
    }

    // Apply type filter
    if (filterOptions.type && filterOptions.type !== 'all') {
      filtered = filtered.filter(property =>
        property.propertyType.toLowerCase() === filterOptions.type.toLowerCase()
      );
    }

    // Apply min price filter
    if (filterOptions.minPrice) {
      filtered = filtered.filter(property => {
        const priceValue = parseInt(property.price.replace(/[^\d]/g, ''), 10);
        return priceValue >= Number(filterOptions.minPrice);
      });
    }

    // Apply max price filter
    if (filterOptions.maxPrice) {
      filtered = filtered.filter(property => {
        const priceValue = parseInt(property.price.replace(/[^\d]/g, ''), 10);
        return priceValue <= Number(filterOptions.maxPrice);
      });
    }

    setFilteredProperties(filtered);
  };

  // Update filtered properties when search query or filters change
  useEffect(() => {
    applyFilters(properties, searchQuery, filters);
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
    let filtered = [...properties];

    if (filter.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filter.location!.toLowerCase())
      );
    }

    if (filter.propertyType) {
      filtered = filtered.filter(property =>
        property.propertyType.toLowerCase() === filter.propertyType!.toLowerCase()
      );
    }

    if (filter.minPrice !== undefined) {
      filtered = filtered.filter(property => {
        // Extract numeric value from price string (e.g., ₦3,500,000 -> 3500000)
        const priceValue = parseInt(property.price.replace(/[^\d]/g, ''), 10);
        return priceValue >= filter.minPrice!;
      });
    }

    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter(property => {
        const priceValue = parseInt(property.price.replace(/[^\d]/g, ''), 10);
        return priceValue <= filter.maxPrice!;
      });
    }

    setFilteredProperties(filtered);
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
