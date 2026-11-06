import { useState, useCallback, useEffect, useId } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Property, Filters } from "./types";
import { applyFilters } from "./propertyUtils";

const PUBLIC_ESTATE_CACHE_KEY = "bridgefort:public-estates:v1";

const readEstateCache = (): Property[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PUBLIC_ESTATE_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.properties) ? parsed.properties as Property[] : [];
  } catch {
    return [];
  }
};

const writeEstateCache = (properties: Property[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PUBLIC_ESTATE_CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      properties,
    }));
  } catch {
    // Storage may be unavailable/full; the live database response still renders.
  }
};

// Handles public estate data with instant browser hydration and table-scoped refresh.
export function usePropertyFetch(searchQuery: string, filters: Filters) {
  const [properties, setProperties] = useState<Property[]>(readEstateCache);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(() =>
    applyFilters(readEstateCache(), searchQuery, filters)
  );
  const [loading, setLoading] = useState(() => readEstateCache().length === 0);

  const fetchProperties = useCallback(async () => {
    try {
      const { data: estates, error } = await supabase
        .from("estate")
        .select("*");

      if (error) throw error;

      const propertyData: Property[] = (estates || []).map((estate: any) => {
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

      setProperties(propertyData);
      setFilteredProperties(applyFilters(propertyData, searchQuery, filters));
      writeEstateCache(propertyData);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Keep the last successful public snapshot visible when the database is unavailable.
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

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
    return () => { supabase.removeChannel(channel); };
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
