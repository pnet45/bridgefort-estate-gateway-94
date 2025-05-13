
import React, { useState } from 'react';
import PropertyGrid from './PropertyGrid';
import PropertyPagination from './PropertyPagination';
import { usePropertyContext } from '../../contexts/PropertyContext';

const PropertyList: React.FC = () => {
  const { filteredProperties } = usePropertyContext();
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9; // Limit to 9 properties per page
  
  // Calculate pagination
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {currentProperties.length} of {filteredProperties.length} properties
        </p>
      </div>

      <PropertyGrid properties={currentProperties} />

      {filteredProperties.length > propertiesPerPage && (
        <div className="mt-10 flex justify-center">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded ${
                  currentPage === page 
                    ? 'bg-estate-blue text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyList;
