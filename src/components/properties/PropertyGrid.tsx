
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
  // Convert Bridgefort County property to a regular property in the list
  let allProperties = [...properties];
  
  // Check if Bridgefort already exists in the properties list
  const bridgefortExists = allProperties.some(prop => prop.id === "bridgefort-county");
  
  // Add Bridgefort County if it doesn't exist yet
  if (!bridgefortExists) {
    const bridgefortProperty = {
      id: "bridgefort-county",
      title: "Bridgefort County - Lagoon Front Estate",
      location: "Ibeju-Lekki, Lagos",
      price: "₦19,500,000",
      imageUrl: "/lovable-uploads/5ec8d74e-628c-4efc-8322-f98d4138140d.png", // Updated image
      sqm: 500,
      propertyType: "Land",
      phase: 1
    };
    
    // Add to the list (it will be shuffled later)
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

  // Shuffle the properties array to get a random order
  const shuffleProperties = (array: Property[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const shuffledProperties = shuffleProperties(allProperties);

  if (shuffledProperties.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-xl text-gray-500">No properties match your search criteria.</p>
        <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {shuffledProperties.map(property => {
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
