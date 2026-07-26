import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import type { Property } from '@/contexts/property/types';

const MAX_COMPARE = 3;

interface ComparisonContextValue {
  items: Property[];
  isSelected: (id: string) => boolean;
  toggle: (property: Property) => void;
  remove: (id: string) => void;
  clear: () => void;
  isFull: boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | undefined>(undefined);

/**
 * Feature: property comparison tool. Deliberately kept in-memory (no
 * persistence/DB) — a comparison tray is a session-scoped browsing aid, not
 * data worth saving across visits, so plain React state is the right
 * amount of infrastructure for it.
 */
export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Property[]>([]);

  const isSelected = useCallback((id: string) => items.some((p) => p.id === id), [items]);

  const toggle = useCallback((property: Property) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === property.id)) {
        return prev.filter((p) => p.id !== property.id);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev; // caller should check isFull before calling toggle to add
      }
      return [...prev, property];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, isSelected, toggle, remove, clear, isFull: items.length >= MAX_COMPARE }),
    [items, isSelected, toggle, remove, clear]
  );

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return ctx;
}

export { MAX_COMPARE };
