
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
  if (properties.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-xl text-gray-500">No properties match your search criteria.</p>
        <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map(property => (
        <PropertyCard 
          key={property.id} 
          id={property.id}
          title={property.title}
          location={property.location}
          price={property.price}
          imageUrl={property.imageUrl}
          sqm={property.sqm}
          propertyType={property.propertyType}
          phase={property.phase}
          scheme={property.scheme}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;
