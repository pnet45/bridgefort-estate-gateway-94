import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useIsGlobalAdmin = () => {
  const { user } = useAuth();
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) { setIsGlobalAdmin(false); setLoading(false); return; }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.rpc('is_global_admin', { _user_id: user.id });
      if (active) {
        setIsGlobalAdmin(!error && !!data);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  return { isGlobalAdmin, loading };
};
