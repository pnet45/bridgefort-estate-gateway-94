
export interface Property {
  id: string;
  name: string;
  location: string;
  pricePerPlot: number;
  imageUrl: string;
  availablePlots: number;
  totalPlots: number;
  phase?: number;
  size: number;
  propertyType: string;
  promoPrice?: number;
  actualPrice?: number;
  prelaunchPrice?: number;
  scheme?: number;
  description?: string;
  media?: string[];
  subForm?: string;
  title: string; // Made required instead of optional
  type?: string;
  features?: string[]; // Added missing property
  amenities?: string[]; // Added missing property
  paymentPlans?: string[]; // Added missing property
  // Legacy properties for backward compatibility
  price?: string;
  sqm?: number;
}

export interface Filters {
  category: string;
  type: string;
  minPrice: string;
  maxPrice: string;
}

export interface Plot {
  id: string;
  plotNumber: number;
  size: number;
  price: number;
  status: 'available' | 'sold' | 'reserved';
  propertyId: string;
}

export interface PropertyContextType {
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
  // Legacy properties for backward compatibility
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  hiddenProperties: string[];
  togglePropertyVisibility: (propertyId: string) => void;
}
