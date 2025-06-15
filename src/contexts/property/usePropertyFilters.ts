
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Filters } from "./types";

// Handles filter/search state and synchronizes with URL
export function usePropertyFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    type: "all",
    minPrice: "",
    maxPrice: "",
  });
  const location = useLocation();

  const toggleFilters = () => setShowFilters((prev) => !prev);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlQuery = searchParams.get("q") || "";
    const urlType = searchParams.get("type") || "";
    const urlPriceRange = searchParams.get("priceRange") || "";

    setSearchQuery(urlQuery);

    const filtersFromUrl: Filters = {
      category: "all",
      type: urlType || "all",
      minPrice: urlPriceRange ? urlPriceRange.split("-")[0] : "",
      maxPrice: urlPriceRange
        ? urlPriceRange.split("-")[1]?.replace("+", "") || ""
        : "",
    };
    setFilters(filtersFromUrl);
  }, [location.search]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    showFilters,
    toggleFilters,
  };
}
