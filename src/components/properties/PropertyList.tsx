
import React, { useState, useEffect } from 'react';
import PropertyGrid from './PropertyGrid';
import { usePropertyContext } from '../../contexts/PropertyContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PropertyList: React.FC = () => {
  const { filteredProperties, refreshProperties } = usePropertyContext();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenProperties, setHiddenProperties] = useState<string[]>([]);
  const propertiesPerPage = 6; // Show exactly 6 properties per page
  
  useEffect(() => {
    // Fetch hidden properties list from Supabase when user is logged in
    const fetchHiddenProperties = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('hidden_properties')
          .select('property_ids')
          .eq('user_id', user.id)
          .single();
          
        if (data && !error) {
          setHiddenProperties(data.property_ids || []);
        } else if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" - normal for new users
          console.error('Error fetching hidden properties:', error);
        }
      }
    };
    
    fetchHiddenProperties();
  }, [user]);
  
  // Filter out hidden properties for display
  const visibleProperties = filteredProperties.filter(
    prop => !hiddenProperties.includes(prop.id)
  );
  
  // Calculate pagination
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = visibleProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  
  // Calculate total pages
  const totalPages = Math.ceil(visibleProperties.length / propertiesPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const togglePropertyVisibility = async (propertyId: string) => {
    if (!user) return;
    
    try {
      // Update local state first for immediate UI feedback
      let newHiddenProperties;
      if (hiddenProperties.includes(propertyId)) {
        // Show the property
        newHiddenProperties = hiddenProperties.filter(id => id !== propertyId);
        toast({
          title: "Property shown",
          description: "This property is now visible"
        });
      } else {
        // Hide the property
        newHiddenProperties = [...hiddenProperties, propertyId];
        toast({
          title: "Property hidden",
          description: "This property is now hidden"
        });
      }
      
      setHiddenProperties(newHiddenProperties);
      
      // Update in database
      const { error } = await supabase
        .from('hidden_properties')
        .upsert(
          { 
            user_id: user.id, 
            property_ids: newHiddenProperties
          },
          { onConflict: 'user_id' }
        );
      
      if (error) {
        throw error;
      }
      
      // Adjust current page if necessary after hiding
      const remainingOnCurrentPage = visibleProperties.slice(
        indexOfFirstProperty, 
        indexOfLastProperty
      ).length;
      
      if (remainingOnCurrentPage === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
    } catch (error) {
      console.error('Error toggling property visibility:', error);
      toast({
        title: "Error",
        description: "Could not update property visibility",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {currentProperties.length} of {visibleProperties.length} properties
        </p>
      </div>

      <PropertyGrid 
        properties={currentProperties}
        hiddenProperties={hiddenProperties}
        user={user}
        onToggleVisibility={togglePropertyVisibility}
      />

      {visibleProperties.length > propertiesPerPage && (
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
