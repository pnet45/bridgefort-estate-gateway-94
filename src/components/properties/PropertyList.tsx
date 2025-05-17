
import React, { useState } from 'react';
import PropertyGrid from './PropertyGrid';
import { usePropertyContext } from '../../contexts/PropertyContext';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PropertyList: React.FC = () => {
  const { filteredProperties } = usePropertyContext();
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6; // Show exactly 6 properties per page
  
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
        <div className="mt-10">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                </PaginationItem>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};

export default PropertyList;
