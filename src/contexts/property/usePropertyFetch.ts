import { useState, useCallback, useEffect, useId } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Property, Filters } from "./types";
import { applyFilters } from "./propertyUtils";
import { listenForPublicDataRevalidation, readPublicDataCache, refreshPublicDataCache, subscribePublicDataCache, writePublicDataCache } from "@/lib/publicDataCache";

const PUBLIC_ESTATE_CACHE_KEY = "public-estates";
const readEstateCache = (): Property[] => readPublicDataCache<Property[]>(PUBLIC_ESTATE_CACHE_KEY) || [];
const writeEstateCache = (properties: Property[]) => writePublicDataCache(PUBLIC_ESTATE_CACHE_KEY, properties);

// Handles public estate data with instant browser hydration and table-scoped refresh.
export function usePropertyFetch(searchQuery: string, filters: Filters) {
  const [properties, setProperties] = useState<Property[]>(readEstateCache);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(() =>
    applyFilters(readEstateCache(), searchQuery, filters)
  );
  const [loading, setLoading] = useState(() => readEstateCache().length === 0);

  const fetchProperties = useCallback(async () => {
    try {
      const propertyData = await refreshPublicDataCache(PUBLIC_ESTATE_CACHE_KEY, async () => {
        const { data: estates, error } = await supabase
          .from("estate")
          .select("*");

        if (error) throw error;

        const result: Property[] = (estates || []).map((estate: any) => {
          let price = "Price on Request";
          let pricePerPlot = 0;

          if (estate.promo_price) {
            price = `₦${Number(estate.promo_price).toLocaleString()}`;
            pricePerPlot = Number(estate.promo_price);
          } else if (estate.prelaunch_price && estate.actual_price) {
            price = `Pre-Launch: ₦${Number(estate.prelaunch_price).toLocaleString()} | Actual: ₦${Number(estate.actual_price).toLocaleString()}`;
            pricePerPlot = Number(estate.prelaunch_price);
          } else if (estate.actual_price) {
            price = `₦${Number(estate.actual_price).toLocaleString()}`;
            pricePerPlot = Number(estate.actual_price);
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
        writeEstateCache(result);
        return result;
      });
      setProperties(propertyData);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Keep the last successful public snapshot visible when the database is unavailable.
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep the derived list current when a visitor changes filters/search without
  // re-reading the estate table.
  useEffect(() => {
    setFilteredProperties(applyFilters(properties, searchQuery, filters));
  }, [properties, searchQuery, filters]);

  const channelId = useId().replace(/[^a-zA-Z0-9]/g, "");
  useEffect(() => {
    const channel = supabase
      .channel(`public_estates_${channelId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "estate" }, () => {
        void fetchProperties();
      })
      .subscribe();
    const stopRevalidation = listenForPublicDataRevalidation(() => void fetchProperties());
    const stopCacheSync = subscribePublicDataCache<Property[]>(PUBLIC_ESTATE_CACHE_KEY, setProperties);
    return () => {
      stopRevalidation();
      stopCacheSync();
      void supabase.removeChannel(channel);
    };
  }, [channelId, fetchProperties]);

  return {
    properties,
    filteredProperties,
    loading,
    setProperties,
    setFilteredProperties,
    fetchProperties,
  };
}
