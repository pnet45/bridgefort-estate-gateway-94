import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export function usePropertyAnalytics() {
  const { user } = useAuth();

  const trackView = useCallback(async (propertyId: string, metadata?: Record<string, any>) => {
    try {
      await supabase.from('property_analytics').insert({
        property_id: propertyId,
        event_type: 'view',
        user_id: user?.id || null,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error tracking property view:', error);
    }
  }, [user]);

  const trackInquiry = useCallback(async (propertyId: string, metadata?: Record<string, any>) => {
    try {
      await supabase.from('property_analytics').insert({
        property_id: propertyId,
        event_type: 'inquiry',
        user_id: user?.id || null,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error tracking property inquiry:', error);
    }
  }, [user]);

  const trackSale = useCallback(async (propertyId: string, metadata?: Record<string, any>) => {
    try {
      await supabase.from('property_analytics').insert({
        property_id: propertyId,
        event_type: 'sale',
        user_id: user?.id || null,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error('Error tracking property sale:', error);
    }
  }, [user]);

  return {
    trackView,
    trackInquiry,
    trackSale,
  };
}
