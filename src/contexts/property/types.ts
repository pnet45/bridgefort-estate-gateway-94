
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
  title?: string;
  type?: string;
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
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProperties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  hiddenProperties: string[];
  togglePropertyVisibility: (propertyId: string) => void;
}
