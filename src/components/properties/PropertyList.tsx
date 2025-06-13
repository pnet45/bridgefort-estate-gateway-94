
import React, { useState, useEffect } from 'react';
import PropertyGrid from './PropertyGrid';
import HiddenPropertiesSection from './HiddenPropertiesSection';
import { usePropertyContext } from '../../contexts/property';
import { useAuth } from '@/contexts/auth';
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
  const { user, userRole } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenProperties, setHiddenProperties] = useState<string[]>([]);
  const propertiesPerPage = 6;
  
  useEffect(() => {
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
          console.error('Error fetching hidden properties:', error);
        }
      }
    };
    
    fetchHiddenProperties();
  }, [user]);
  
  const visibleProperties = filteredProperties.filter(
    prop => !hiddenProperties.includes(prop.id)
  );
  
  const hiddenPropertiesData = filteredProperties.filter(
    prop => hiddenProperties.includes(prop.id)
  );
  
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = visibleProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  
  const totalPages = Math.ceil(visibleProperties.length / propertiesPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const togglePropertyVisibility = async (propertyId: string) => {
    if (!user || userRole !== 'admin') return;
    
    try {
      let newHiddenProperties;
      if (hiddenProperties.includes(propertyId)) {
        newHiddenProperties = hiddenProperties.filter(id => id !== propertyId);
        toast({
          title: "Property shown",
          description: "This property is now visible"
        });
      } else {
        newHiddenProperties = [...hiddenProperties, propertyId];
        toast({
          title: "Property hidden",
          description: "This property is now hidden"
        });
      }
      
      setHiddenProperties(newHiddenProperties);
      
      const { error } = await supabase
        .from('hidden_properties')
        .upsert(
          { 
            user_id: user.id, 
            property_ids: newHiddenProperties
          },
          { onConflict: 'user_id' }
        );
      
      if (error) throw error;
      
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

  const handleUnhideProperty = async (propertyId: string) => {
    if (!user) return;
    
    try {
      const newHiddenProperties = hiddenProperties.filter(id => id !== propertyId);
      setHiddenProperties(newHiddenProperties);
      
      const { error } = await supabase
        .from('hidden_properties')
        .upsert(
          { 
            user_id: user.id, 
            property_ids: newHiddenProperties
          },
          { onConflict: 'user_id' }
        );
      
      if (error) throw error;
      
      toast({
        title: "Property unhidden",
        description: "This property is now visible again"
      });
      
    } catch (error) {
      console.error('Error unhiding property:', error);
      toast({
        title: "Error",
        description: "Could not unhide property",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="mb-6 animate-fade-in">
        <p className="text-gray-600">
          Showing {currentProperties.length} of {visibleProperties.length} properties
        </p>
      </div>

      <PropertyGrid />

      {visibleProperties.length > propertiesPerPage && (
        <div className="mt-10 animate-fade-in">
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

      <HiddenPropertiesSection
        hiddenProperties={hiddenPropertiesData}
        user={user}
        onUnhideProperty={handleUnhideProperty}
      />
    </>
  );
};

export default PropertyList;
