import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useIsSuperAdmin = () => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) { setIsSuperAdmin(false); setLoading(false); return; }
    (async () => {
      const { data } = await supabase.rpc('is_super_admin', { _user_id: user.id });
      if (active) { setIsSuperAdmin(!!data); setLoading(false); }
    })();
    return () => { active = false; };
  }, [user]);

  return { isSuperAdmin, loading };
};
