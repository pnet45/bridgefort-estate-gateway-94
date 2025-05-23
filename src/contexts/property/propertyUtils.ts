
import { Property, Filters } from './types';

// Apply filters to properties
export const applyFilters = (
  props: Property[], 
  query: string, 
  filterOptions: Filters
): Property[] => {
  let filtered = [...props];

  // Apply search query filter (search name, location, price, type)
  if (query) {
    const searchLower = query.toLowerCase();
    filtered = filtered.filter(property => {
      const titleMatch = property.title.toLowerCase().includes(searchLower);
      const locationMatch = property.location.toLowerCase().includes(searchLower);
      const typeMatch = property.propertyType.toLowerCase().includes(searchLower);
      const priceMatch = property.price.toLowerCase().includes(searchLower);
      
      return titleMatch || locationMatch || typeMatch || priceMatch;
    });
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

  return filtered;
};

export const applyCustomFilters = (
  properties: Property[],
  filter: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
  }
): Property[] => {
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

  return filtered;
};
