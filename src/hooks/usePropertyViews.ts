import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const usePropertyView = (propertyId: string, propertyType: 'estate' | 'listing' = 'estate') => {
  const { user } = useAuth();

  useEffect(() => {
    if (!propertyId) return;

    const trackView = async () => {
      await supabase.from('property_views').insert({
        property_id: propertyId,
        property_type: propertyType,
        viewer_id: user?.id || null,
      });
    };

    trackView();
  }, [propertyId, propertyType, user?.id]);
};
