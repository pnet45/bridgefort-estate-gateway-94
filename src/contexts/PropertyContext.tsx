
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

// Define the property type
export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  sqm: number;
  propertyType: string;
  category?: string;
  type?: string;
  phase?: number;
  scheme?: number;
}

// Define the filter type
interface PropertyFilters {
  category: string;
  type: string;
  minPrice: string;
  maxPrice: string;
}

// Define the context type
interface PropertyContextType {
  allProperties: Property[];
  filteredProperties: Property[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
  showFilters: boolean;
  toggleFilters: () => void;
}

// Create the context
const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Sample properties data
const allProperties = [
  {
    id: '1',
    title: 'Hampton Ville Estate',
    location: 'Itoikin, Epe, Lagos',
    price: '₦3,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 500,
    propertyType: 'Land',
    category: 'buy',
    type: 'residential',
    phase: 1
  },
  {
    id: '2',
    title: 'Fortress Hills Estate',
    location: 'Imota, Ikorodu, Lagos',
    price: '₦4,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 500,
    propertyType: 'Land',
    category: 'buy',
    type: 'residential',
    phase: 1
  },
  {
    id: '3',
    title: 'Greenfield County',
    location: 'Agbara, Ogun State',
    price: '₦1,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 500,
    propertyType: 'Land',
    category: 'buy',
    type: 'residential',
    phase: 1
  },
  {
    id: '4',
    title: 'Precious Gardens Estate',
    location: 'Ode-Omi, Ibeju-Lekki',
    price: '₦1,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 500,
    propertyType: 'Land',
    category: 'buy',
    type: 'residential',
    scheme: 1
  },
  {
    id: '5',
    title: 'Fountain Springs Estate',
    location: 'Ode-Omi, Ibeju-Lekki',
    price: 'Pre-Launch ₦2,500,000 | Actual Price: ₦3,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 500,
    propertyType: 'Land',
    category: 'buy',
    type: 'residential',
    phase: 1
  },
  {
    id: '6',
    title: 'Olanma Gardens',
    location: 'Ogbaku, Owerri, Imo State',
    price: 'Promo Price: ₦7,500,000 | Actual Price: ₦10,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'residential',
    phase: 1
  },
  {
    id: '7',
    title: 'The Big League County',
    location: 'Warri, Delta State',
    price: '₦10,000,000 | Initial Deposit: ₦2,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'residential',
    phase: 1
  },
  {
    id: '8',
    title: 'The Big League Smart City',
    location: 'Omagwa, Port Harcourt',
    price: '₦4,500,000 | Initial Deposit: ₦1,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'commercial',
    phase: 1
  },
  {
    id: '9',
    title: 'The Big League Paradise',
    location: 'Oghara, Ethiope, Delta State',
    price: '₦4,000,000 | Initial Deposit: ₦1,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'land',
    phase: 1
  },
  {
    id: '10',
    title: 'Akuchi Luxury Estate',
    location: 'Ifite, Awka, Anambra State',
    price: 'Promo Price: ₦7,500,000 | Actual Price: ₦10,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'land',
    phase: 1
  },
  {
    id: '11',
    title: 'Afaoma Castle Estate',
    location: 'Utulu, Umuahia, Abia State',
    price: 'Promo Price: ₦7,500,000 | Actual Price: ₦10,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'land',
    phase: 1
  },
  {
    id: '12',
    title: 'The Big League Haven',
    location: 'Ogwashi-Uku, Asaba, Delta State',
    price: '₦7,500,000 | Initial Deposit: ₦1,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqm: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'land',
    phase: 1
  }
];

// Provider component
export const PropertyProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState(allProperties);

  // Parse URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Set filters based on URL parameters
    if (params.has('location')) {
      setSearchQuery(params.get('location') || '');
    }
    
    if (params.has('type')) {
      setFilters(prev => ({
        ...prev,
        type: params.get('type') || 'all'
      }));
    }
    
    if (params.has('price')) {
      const priceRange = params.get('price') || '';
      if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-');
        setFilters(prev => ({
          ...prev,
          minPrice: min || '',
          maxPrice: max || ''
        }));
      } else if (priceRange.endsWith('+')) {
        setFilters(prev => ({
          ...prev,
          minPrice: priceRange.replace('+', '') || ''
        }));
      }
    }
    
    // Scroll to top when page loads or URL changes
    window.scrollTo(0, 0);
  }, [location]);

  // Filter properties based on selected filters and search query
  useEffect(() => {
    const filtered = allProperties.filter(property => {
      // Filter by category
      const categoryMatch = filters.category === 'all' || property.category === filters.category;
      
      // Filter by type
      const typeMatch = filters.type === 'all' || property.type === filters.type;
      
      // Filter by price
      const price = parseInt(property.price.replace(/[^0-9]/g, ''));
      const minPriceMatch = !filters.minPrice || price >= parseInt(filters.minPrice);
      const maxPriceMatch = !filters.maxPrice || price <= parseInt(filters.maxPrice);
      
      // Filter by search query
      const searchMatch = !searchQuery || 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.propertyType.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && typeMatch && minPriceMatch && maxPriceMatch && searchMatch;
    });

    setFilteredProperties(filtered);
  }, [searchQuery, filters]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <PropertyContext.Provider
      value={{
        allProperties,
        filteredProperties,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        showFilters,
        toggleFilters
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

// Custom hook to use the property context
export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
};
