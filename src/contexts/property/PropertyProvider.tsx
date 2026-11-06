
import React, { useState, useEffect, useRef } from "react";
import { Property, PropertyContextType } from "./types";
import { applyFilters, applyCustomFilters } from "./propertyUtils";
import { useAuth } from "@/contexts/auth";
import { usePropertyFilters } from "./usePropertyFilters";
import { usePropertyFetch } from "./usePropertyFetch";
import { supabase } from "@/integrations/supabase/client";
import { PropertyContext } from "./PropertyContext";

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

  const fetchPropertiesRef = useRef(fetchProperties);
  useEffect(() => { fetchPropertiesRef.current = fetchProperties; }, [fetchProperties]);

  // The estate catalogue is public content. Realtime updates refresh only this
  // dataset; focus/online refreshes cover browsers where Realtime is unavailable.
  useEffect(() => {
    const channel = supabase
      .channel("public-estate-catalogue-refresh")
      .on("postgres_changes", { event: "*", schema: "public", table: "estate" }, () => {
        void fetchPropertiesRef.current();
      })
      .subscribe();

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void fetchPropertiesRef.current();
      }
    };
    window.addEventListener("focus", refreshWhenVisible);
    window.addEventListener("online", refreshWhenVisible);
    const interval = window.setInterval(refreshWhenVisible, 120000);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      window.removeEventListener("online", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, []);

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
