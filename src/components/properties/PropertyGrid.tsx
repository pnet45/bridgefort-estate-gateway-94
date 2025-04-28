
import PropertyCard from '../PropertyCard';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
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
        <PropertyCard key={property.id} {...property} />
      ))}
    </div>
  );
};

export default PropertyGrid;
