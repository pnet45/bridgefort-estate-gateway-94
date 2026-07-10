import React from 'react';
import { ListingRegion, ListingPropertyType, REGIONS, PROPERTY_TYPES } from '@/types/listing';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export interface ListingFilterState {
  region: string;
  propertyType: string;
  pricePeriod: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  search: string;
}

interface ListingFiltersProps {
  filters: ListingFilterState;
  onChange: (filters: ListingFilterState) => void;
  onReset: () => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

const ListingFilters = ({ filters, onChange, onReset, showAdvanced, onToggleAdvanced }: ListingFiltersProps) => {
  const update = (key: keyof ListingFilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActive = Object.values(filters).some(v => v && v !== 'all');

  return (
    <div className="space-y-4">
      {/* Primary filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, location, estate..."
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filters.region} onValueChange={v => update('region', v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.propertyType} onValueChange={v => update('propertyType', v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={onToggleAdvanced} className="flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-lg border border-border">
          <Select value={filters.pricePeriod} onValueChange={v => update('pricePeriod', v)}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Sale/Rent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
              <SelectItem value="lease">For Lease</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={e => update('minPrice', e.target.value)}
            className="w-full sm:w-36"
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={e => update('maxPrice', e.target.value)}
            className="w-full sm:w-36"
          />
          <Select value={filters.minBeds} onValueChange={v => update('minBeds', v)}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Beds</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
          {hasActive && (
            <Button variant="ghost" size="sm" onClick={onReset} className="flex items-center gap-1 text-destructive">
              <X className="w-3.5 h-3.5" /> Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ListingFilters;
