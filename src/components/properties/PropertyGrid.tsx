
import React from 'react';
import AnimatedPropertyGrid from './AnimatedPropertyGrid';
import { Property } from '@/contexts/property/types';

interface PropertyGridProps {
  properties: Property[];
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Found</h3>
        <p className="text-gray-500">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return <AnimatedPropertyGrid properties={properties} />;
};

export default PropertyGrid;
