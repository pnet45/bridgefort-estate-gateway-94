
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Property, Filters } from "./types";
import { applyFilters } from "./propertyUtils";
import { readPublicDataCache, writePublicDataCache } from "@/lib/publicDataCache";

const ESTATE_CACHE_KEY = "public-estate-catalogue";

// Handles fetching properties from Supabase and fallback to sample data
export function usePropertyFetch(
  searchQuery: string,
  filters: Filters
) {
  const [properties, setProperties] = useState<Property[]>(() => readPublicDataCache<Property[]>(ESTATE_CACHE_KEY) || []);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(() => {
    const cached = readPublicDataCache<Property[]>(ESTATE_CACHE_KEY) || [];
    return applyFilters(cached, searchQuery, filters);
  });
  const [loading, setLoading] = useState(() => readPublicDataCache<Property[]>(ESTATE_CACHE_KEY) === null);

  const fetchProperties = useCallback(async () => {
    if (properties.length === 0) setLoading(true);
    try {
      const { data: estates, error } = await supabase
        .from("estate")
        .select("*");

      if (error) {
        throw error;
      }

      if (estates) {
        const propertyData: Property[] = estates.map((estate: any) => {
          let price = "Price on Request";
          let pricePerPlot = 0;

          if (estate.promo_price) {
            price = `₦${estate.promo_price.toLocaleString()}`;
            pricePerPlot = +estate.promo_price;
          } else if (estate.prelaunch_price && estate.actual_price) {
            price = `Pre-Launch: ₦${estate.prelaunch_price.toLocaleString()} | Actual: ₦${estate.actual_price.toLocaleString()}`;
            pricePerPlot = +estate.prelaunch_price;
          } else if (estate.actual_price) {
            price = `₦${estate.actual_price.toLocaleString()}`;
            pricePerPlot = +estate.actual_price;
          }

          const totalPlots = estate.total_plots || 100;
          const soldPlots = estate.sold_plots || 0;
          const availablePlots = Math.max(0, totalPlots - soldPlots);

          return {
            id: estate.id,
            name: estate.name,
            title: estate.name,
            location: estate.location || "",
            price,
            imageUrl: estate.media && estate.media.length > 0 ? estate.media[0] : "/placeholder.svg",
            size: estate.size || 0,
            sqm: estate.size || 0,
            propertyType: estate.type || "Land",
            property_category: estate.property_category || "land",
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
            features: [],
            amenities: [],
            paymentPlans: [],
          };
        });

        // Keep the last good public catalogue available across reloads, then
        // replace it only when the live database response arrives.
        writePublicDataCache(ESTATE_CACHE_KEY, propertyData);
        setProperties(propertyData);
        setFilteredProperties(applyFilters(propertyData, searchQuery, filters));
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Preserve the last successful database snapshot during transient
      // network/API failures instead of blanking the whole catalogue.
      if (properties.length === 0) {
        setProperties([]);
        setFilteredProperties([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, properties.length]);

  return {
    properties,
    filteredProperties,
    loading,
    setProperties,
    setFilteredProperties,
    fetchProperties,
  };
}
