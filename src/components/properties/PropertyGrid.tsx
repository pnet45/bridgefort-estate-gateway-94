
import { User } from '@supabase/supabase-js';
import { EyeOff } from 'lucide-react';
import PropertyCard from '../PropertyCard';
import { Button } from '@/components/ui/button';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  sqm: number;
  propertyType: string;
  phase?: number;
}

interface PropertyGridProps {
  properties: Property[];
  hiddenProperties?: string[];
  user: User | null;
  userRole: string | null;
  onToggleVisibility?: (propertyId: string) => void;
}

const PropertyGrid = ({ properties, hiddenProperties = [], user, userRole, onToggleVisibility }: PropertyGridProps) => {
  const isAdmin = userRole === 'admin';

  if (properties.length === 0) {
    return (
      <div className="col-span-full text-center py-12 animate-fade-in">
        <p className="text-xl text-gray-500 animate-scale-in">No properties match your search criteria.</p>
        <p className="text-gray-500 mt-2 animate-fade-in">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property, index) => {
        const isHidden = hiddenProperties.includes(property.id);
        
        return (
          <div 
            key={property.id} 
            className="relative animate-fade-in hover:scale-105 transition-all duration-300 group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PropertyCard {...property} />
            
            {user && isAdmin && onToggleVisibility && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 opacity-0 group-hover:opacity-100"
                onClick={() => onToggleVisibility(property.id)}
              >
                <EyeOff size={16} className="mr-1 transition-transform duration-300" />
                <span className="text-xs">Hide</span>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PropertyGrid;
