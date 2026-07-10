
import React, { createContext, useContext } from "react";
import { PropertyContextType } from "./types";

// Create the context only.
export const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Custom hook to use property context
export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("usePropertyContext must be used within a PropertyProvider");
  }
  return context;
};
