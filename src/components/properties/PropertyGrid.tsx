
import React from 'react';
import { usePropertyContext } from '@/contexts/property';
import AnimatedPropertyGrid from './AnimatedPropertyGrid';

const PropertyGrid = () => {
  const { filteredProperties } = usePropertyContext();

  if (!filteredProperties || filteredProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Found</h3>
        <p className="text-gray-500">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return <AnimatedPropertyGrid properties={filteredProperties} />;
};

export default PropertyGrid;
