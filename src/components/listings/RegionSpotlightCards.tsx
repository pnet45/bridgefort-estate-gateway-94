import React from 'react';
import { REGIONS, ListingRegion } from '@/types/listing';
import { MapPin } from 'lucide-react';

interface RegionSpotlightCardsProps {
  selectedRegion: string;
  onSelect: (region: string) => void;
  counts: Record<string, number>;
}

const regionColors: Record<string, string> = {
  Lagos: 'from-estate-purple to-estate-red',           // brand gradient, within 60deg wedge
  Asaba: 'from-beauty-green to-beauty-greenLight',     // approved beautifying accent
  'Port Harcourt': 'from-beauty-orange to-beauty-coral', // approved beautifying accent
  Ogun: 'from-estate-red to-beauty-pink',              // stays within the purple/magenta wedge
};

const RegionSpotlightCards = ({ selectedRegion, onSelect, counts }: RegionSpotlightCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {REGIONS.map(r => {
        const isActive = selectedRegion === r.value;
        return (
          <button
            key={r.value}
            onClick={() => onSelect(isActive ? 'all' : r.value)}
            className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 border-2 ${
              isActive
                ? 'border-primary shadow-lg scale-[1.02]'
                : 'border-transparent hover:border-primary/30 hover:shadow-md'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${regionColors[r.value]} opacity-90`} />
            <div className="relative z-10 text-white">
              <MapPin className="w-5 h-5 mb-2 opacity-80" />
              <h3 className="font-bold text-lg">{r.label}</h3>
              <p className="text-xs opacity-80 mt-1">{r.description}</p>
              <p className="text-sm font-semibold mt-2">{counts[r.value] || 0} listings</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RegionSpotlightCards;
