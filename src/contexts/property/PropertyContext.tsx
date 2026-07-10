
import React, { createContext, useContext, useState, useEffect } from "react";
import { Property, Filters, PropertyContextType } from "./types";
import { applyFilters, applyCustomFilters } from "./propertyUtils";
import { useAuth } from "@/contexts/auth";
import { usePropertyFilters } from "./usePropertyFilters";
import { usePropertyFetch } from "./usePropertyFetch";

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Manage filter/search state via hook
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    showFilters,
    toggleFilters,
  } = usePropertyFilters();

  // Use property fetch hook
  const {
    properties,
    filteredProperties,
    loading,
    setProperties,
    setFilteredProperties,
    fetchProperties,
  } = usePropertyFetch(searchQuery, filters);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hiddenProperties, setHiddenProperties] = useState<string[]>([]);

  // Sync filtered properties if filters/search change
  useEffect(() => {
    setFilteredProperties(applyFilters(properties, searchQuery, filters));
  }, [properties, searchQuery, filters, setFilteredProperties]);

  // Fetch on mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

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

  // Property visibility (legacy)
  const togglePropertyVisibility = (propertyId: string) => {
    setHiddenProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
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
        // Legacy
        searchTerm: searchQuery,
        setSearchTerm: setSearchQuery,
        selectedProperty,
        setSelectedProperty,
        hiddenProperties,
        togglePropertyVisibility,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("usePropertyContext must be used within a PropertyProvider");
  }
  return context;
};
