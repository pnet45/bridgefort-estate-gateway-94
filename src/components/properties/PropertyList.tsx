
import React, { useState, useEffect } from 'react';
import PropertyGrid from './PropertyGrid';
import PropertyPagination from './PropertyPagination';
import HiddenPropertiesSection from './HiddenPropertiesSection';
import { usePropertyContext } from '../../contexts/property';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isAdminRole } from '@/lib/rbac';

const propertiesPerPage = 6;

const PropertyList: React.FC = () => {
  const { filteredProperties, loading } = usePropertyContext();
  const { user, userRole } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenProperties, setHiddenProperties] = useState<string[]>([]);

  useEffect(() => {
    const fetchHiddenProperties = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('hidden_properties')
          .select('property_ids')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data && !error) {
          setHiddenProperties(data.property_ids || []);
        } else if (error && error.code !== 'PGRST116') {
          console.error('Error fetching hidden properties:', error);
        }
      }
    };
    fetchHiddenProperties();
  }, [user]);

  // Do filtering before paginating:
  const visibleProperties = filteredProperties.filter(
    prop => !hiddenProperties.includes(prop.id)
  );
  const hiddenPropertiesData = filteredProperties.filter(
    prop => hiddenProperties.includes(prop.id)
  );

  const totalPages = Math.ceil(visibleProperties.length / propertiesPerPage);
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = visibleProperties.slice(indexOfFirstProperty, indexOfLastProperty);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle property visibility for admins
  const togglePropertyVisibility = async (propertyId: string) => {
    if (!user || !isAdminRole(userRole)) return;
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
          { user_id: user.id, property_ids: newHiddenProperties },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      // If removing a property results in empty current page, go back a page:
      const remainingOnCurrentPage = visibleProperties.slice(
        indexOfFirstProperty, indexOfLastProperty
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

  // Unhide property for current user
  const handleUnhideProperty = async (propertyId: string) => {
    if (!user) return;
    try {
      const newHiddenProperties = hiddenProperties.filter(id => id !== propertyId);
      setHiddenProperties(newHiddenProperties);

      const { error } = await supabase
        .from('hidden_properties')
        .upsert(
          { user_id: user.id, property_ids: newHiddenProperties },
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

  if (loading && filteredProperties.length === 0) {
    return (
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading properties">
        {Array.from({ length: propertiesPerPage }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="aspect-[16/10] animate-pulse bg-muted" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <>
      <div className="mb-6 animate-fade-in">
        <p className="text-gray-600">
          Showing {currentProperties.length} of {visibleProperties.length} properties
        </p>
      </div>

      <PropertyGrid properties={currentProperties} />

      <div className="mt-10 animate-fade-in">
        <PropertyPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <HiddenPropertiesSection
        hiddenProperties={hiddenPropertiesData}
        user={user}
        onUnhideProperty={handleUnhideProperty}
      />
    </>
  );
};

export default PropertyList;
