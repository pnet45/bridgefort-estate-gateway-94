import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useIsSuperAdmin = () => {
  const { user, userRole } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) { setIsSuperAdmin(false); setLoading(false); return; }
    (async () => {
      const { data } = await supabase.rpc('is_global_admin', { _user_id: user.id });
      if (active) { setIsSuperAdmin(!!data || ['admin_dir', 'super_admin'].includes(String(userRole || '').trim().toLowerCase())); setLoading(false); }
    })();
    return () => { active = false; };
  }, [user, userRole]);

  return { isSuperAdmin, loading };
};
