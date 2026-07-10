import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export type TravelType = 'all' | 'tourist' | 'business' | 'student' | 'medical' | 'pilgrimage' | 'luxury';

export interface TravelFiltersState {
  query: string;
  travelType: TravelType;
  priceRange: [number, number];
}

interface Props {
  value: TravelFiltersState;
  onChange: (next: TravelFiltersState) => void;
  min: number;
  max: number;
  resultCount: number;
}

const TravelsFilters: React.FC<Props> = ({ value, onChange, min, max, resultCount }) => {
  const reset = () =>
    onChange({ query: '', travelType: 'all', priceRange: [min, max] });

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <section className="section-padding pt-12 pb-6">
      <div className="container-custom">
        <div className="bg-card border rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="text-estate-blue" size={20} />
            <h2 className="font-display text-xl md:text-2xl font-bold">Find your perfect trip</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label htmlFor="travel-search" className="mb-2 block text-sm font-medium">Destination or keyword</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="travel-search"
                  value={value.query}
                  onChange={(e) => onChange({ ...value, query: e.target.value })}
                  placeholder="e.g. Dubai, London, Bali…"
                  className="pl-10 h-11"
                  maxLength={80}
                />
              </div>
            </div>

            {/* Travel type */}
            <div>
              <Label className="mb-2 block text-sm font-medium">Travel type</Label>
              <Select
                value={value.travelType}
                onValueChange={(v) => onChange({ ...value, travelType: v as TravelType })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="tourist">Tourist / Leisure</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="pilgrimage">Pilgrimage</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Price range
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  {fmt(value.priceRange[0])} – {fmt(value.priceRange[1])}
                </span>
              </Label>
              <div className="px-1 pt-3">
                <Slider
                  min={min}
                  max={max}
                  step={50000}
                  value={value.priceRange}
                  onValueChange={(v) => onChange({ ...value, priceRange: [v[0], v[1]] as [number, number] })}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{resultCount}</span>{' '}
              destination{resultCount === 1 ? '' : 's'} match your filters
            </p>
            <Button variant="ghost" size="sm" onClick={reset} className="gap-1">
              <X size={16} /> Reset filters
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelsFilters;
