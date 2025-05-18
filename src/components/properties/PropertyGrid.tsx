
import { User } from '@supabase/supabase-js';
import { Eye, EyeOff } from 'lucide-react';
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
  scheme?: number;
}

interface PropertyGridProps {
  properties: Property[];
  hiddenProperties?: string[];
  user: User | null;
  onToggleVisibility?: (propertyId: string) => void;
}

const PropertyGrid = ({ properties, hiddenProperties = [], user, onToggleVisibility }: PropertyGridProps) => {
  // Check if Bridgefort already exists in the properties list
  const bridgefortExists = properties.some(prop => prop.id === "bridgefort-county");
  
  // Add Bridgefort County if it doesn't exist yet
  let allProperties = [...properties];
  if (!bridgefortExists) {
    const bridgefortProperty = {
      id: "bridgefort-county",
      title: "Bridgefort County - Lagoon Front Estate",
      location: "Ibeju-Lekki, Lagos",
      price: "₦19,500,000",
      imageUrl: "/lovable-uploads/5ec8d74e-628c-4efc-8322-f98d4138140d.png",
      sqm: 500,
      propertyType: "Land",
      phase: 1
    };
    
    allProperties.push(bridgefortProperty);
  }
  
  // Update Precious Garden Estate image if it exists
  allProperties = allProperties.map(property => {
    if (property.title === "Precious Garden Estate") {
      return {
        ...property,
        imageUrl: "/lovable-uploads/5c033a2a-1e10-49b7-b7de-5b56e384b9d5.png",
        location: "Ode-Omi Via Ibeju-Lekki, Lagos"
      };
    }
    return property;
  });

  if (allProperties.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-xl text-gray-500">No properties match your search criteria.</p>
        <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {allProperties.map(property => {
        const { scheme, phase, ...rest } = property;
        const isHidden = hiddenProperties.includes(property.id);
        
        return (
          <div key={property.id} className="relative">
            <PropertyCard 
              {...rest}
              phase={phase}
            />
            
            {user && onToggleVisibility && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={() => onToggleVisibility(property.id)}
              >
                {isHidden ? (
                  <>
                    <Eye size={16} className="mr-1" />
                    <span className="text-xs">Show</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={16} className="mr-1" />
                    <span className="text-xs">Hide</span>
                  </>
                )}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PropertyGrid;
