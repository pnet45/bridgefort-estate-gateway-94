
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Property, Filters } from "./types";
import { applyFilters } from "./propertyUtils";

// Handles fetching properties from Supabase and fallback to sample data
export function usePropertyFetch(
  searchQuery: string,
  filters: Filters
) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
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
      }
    } catch (error) {
      const sampleProperties: Property[] = [
        {
          id: "1",
          name: "Bridgefort County",
          title: "Bridgefort County",
          location: "Ogun State",
          price: "₦2,500,000",
          imageUrl: "/lovable-uploads/Bridgefort County - Lagoon Front .jpg",
          size: 600,
          sqm: 600,
          propertyType: "Residential Land",
          phase: 1,
          totalPlots: 200,
          availablePlots: 150,
          pricePerPlot: 2500000,
          description: "Premium waterfront estate",
          features: [],
          amenities: [],
          paymentPlans: [],
        },
        {
          id: "2",
          name: "Precious Gardens Estate",
          title: "Precious Gardens Estate",
          location: "Lagos State",
          price: "₦3,200,000",
          imageUrl: "/lovable-uploads/Precious Gardens Estate.jpg",
          size: 500,
          sqm: 500,
          propertyType: "Residential Land",
          phase: 2,
          totalPlots: 150,
          availablePlots: 85,
          pricePerPlot: 3200000,
          description: "Luxury residential estate",
          features: [],
          amenities: [],
          paymentPlans: [],
        },
      ];
      setProperties(sampleProperties);
      setFilteredProperties(applyFilters(sampleProperties, searchQuery, filters));
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  return {
    properties,
    filteredProperties,
    loading,
    setProperties,
    setFilteredProperties,
    fetchProperties,
  };
}
