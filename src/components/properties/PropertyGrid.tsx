
import { usePropertyContext } from '@/contexts/property';
import AnimatedPropertyGrid from './AnimatedPropertyGrid';
import EnhancedPropertyCard from './EnhancedPropertyCard';
import { Property } from '@/contexts/property/types';

interface PropertyGridProps {
  filterCategory?: string;
  properties?: Property[]; // Optional properties prop
  enhanced?: boolean; // New prop for enhanced cards
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ filterCategory, properties, enhanced = false }) => {
  const { filteredProperties, loading } = usePropertyContext();
  
  // Use provided properties or get from context
  const sourceProperties = properties || filteredProperties;
  
  // Filter by category if specified
  const displayProperties = filterCategory 
    ? sourceProperties.filter(p => {
        if (filterCategory === 'land') {
          return p.property_category === 'land' || !p.property_category; // Default to land if not specified
        }
        return p.property_category === filterCategory;
      })
    : sourceProperties;

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

  // Use enhanced cards for homes and rentals or regular animated grid for others
  if (enhanced && (filterCategory === 'home' || filterCategory === 'rental')) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayProperties.map((property) => (
          <EnhancedPropertyCard key={property.id} property={property} />
        ))}
      </div>
    );
  }

  return <AnimatedPropertyGrid properties={displayProperties} />;
};

export default PropertyGrid;
