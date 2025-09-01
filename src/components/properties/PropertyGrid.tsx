
import { usePropertyContext } from '@/contexts/property';
import AnimatedPropertyGrid from './AnimatedPropertyGrid';

interface PropertyGridProps {
  filterCategory?: string;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ filterCategory }) => {
  const { filteredProperties, loading } = usePropertyContext();
  
  // Filter by category if specified
  const displayProperties = filterCategory 
    ? filteredProperties.filter(p => p.property_category === filterCategory)
    : filteredProperties;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-estate-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading properties...</p>
      </div>
    );
  }

  if (!displayProperties || displayProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Found</h3>
        <p className="text-gray-500">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return <AnimatedPropertyGrid properties={displayProperties} />;
};

export default PropertyGrid;
