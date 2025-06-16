
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Eye } from 'lucide-react';
import PropertyCard from '../PropertyCard';
import { Button } from '@/components/ui/button';

interface Property {
  plotNumber: number;
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  sqm: number;
  propertyType: string;
  phase?: number;
  totalPlots?: number;
  availablePlots?: number;
  pricePerPlot?: number;
}

interface HiddenPropertiesSectionProps {
  hiddenProperties: Property[];
  user: User | null;
  onUnhideProperty: (propertyId: string) => void;
}

const HiddenPropertiesSection = ({ hiddenProperties, user, onUnhideProperty }: HiddenPropertiesSectionProps) => {
  if (!user || hiddenProperties.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Hidden Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hiddenProperties.map((property, index) => (
          <div 
            key={property.id} 
            className="relative animate-fade-in hover:scale-105 transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="opacity-50">
              <PropertyCard 
                propertyName={property.name || property.title}
                plotNumber={property.plotNumber || 0}
                size={property.size || property.sqm} id={''} location={''} imageUrl={''} pricePerPlot={0} propertyType={''}/>
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105"
              onClick={() => onUnhideProperty(property.id)}
            >
              <Eye size={16} className="mr-1" />
              <span className="text-xs">Unhide</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiddenPropertiesSection;
