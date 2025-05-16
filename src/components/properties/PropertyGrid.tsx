
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
      imageUrl: "/lovable-uploads/",
      sqm: 500,
      propertyType: "Land",
      phase: 1
    });
  }

  // Update Precious Garden Estate image if it exists
  const updatedProperties = enhancedProperties.map(property => {
    if (property.title === "Precious Garden Estate") {
      return {
        ...property,
        imageUrl: "/lovable-uploads/5c033a2a-1e10-49b7-b7de-5b56e384b9d5.png",
        location: "Ode-Omi Via Ibeju-Lekki, Lagos"
      };
    }
    return property;
  });

  if (updatedProperties.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-xl text-gray-500">No properties match your search criteria.</p>
        <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {updatedProperties.map(property => {
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
