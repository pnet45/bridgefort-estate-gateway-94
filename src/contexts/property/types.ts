
export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  sqm: number;
  propertyType: string;
  phase?: number;
}

export interface Filters {
  category: string;
  type: string;
  minPrice: string | number;
  maxPrice: string | number;
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
}
