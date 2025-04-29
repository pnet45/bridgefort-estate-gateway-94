
import React from 'react';
import PropertyGrid from './PropertyGrid';
import PropertyPagination from './PropertyPagination';
import { usePropertyContext } from '../../contexts/PropertyContext';

const PropertyList: React.FC = () => {
  const { filteredProperties } = usePropertyContext();

  return (
    <>
      <div className="mb-6">
        <p className="text-gray-600">Showing {filteredProperties.length} properties</p>
      </div>

      <PropertyGrid properties={filteredProperties} />

      {filteredProperties.length > 0 && <PropertyPagination />}
    </>
  );
};

export default PropertyList;
