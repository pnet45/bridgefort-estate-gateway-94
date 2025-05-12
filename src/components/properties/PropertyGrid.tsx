
import PropertyCard from '../PropertyCard';

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
}

const PropertyGrid = ({ properties }: PropertyGridProps) => {
  // Add the new property to the list if it doesn't exist yet
  const enhancedProperties = [...properties];
  
  // Check if the Bridgefort County property already exists
  const bridgefortExists = enhancedProperties.some(prop => prop.title === "Bridgefort County - Lagoon Front Estate");
  
  if (!bridgefortExists && enhancedProperties.length > 0) {
    // Add Bridgefort County to the properties list at the beginning
    enhancedProperties.unshift({
      id: "bridgefort-county",
      title: "Bridgefort County - Lagoon Front Estate",
      location: "Ibeju-Lekki, Lagos",
      price: "₦19,500,000",
      imageUrl: "/lovable-uploads/5ec8d74e-628c-4efc-8322-f98d4138140d.png",
      sqm: 500,
      propertyType: "Land",
      phase: 1
    });
  }

  if (enhancedProperties.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-xl text-gray-500">No properties match your search criteria.</p>
        <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {enhancedProperties.map(property => {
        const { scheme, phase, ...rest } = property;
        return (
          <PropertyCard 
            key={property.id} 
            {...rest}
            phase={phase}
          />
        );
      })}
    </div>
  );
};

export default PropertyGrid;
