
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

const AccountInformation = () => {
  const { user, profile } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]); // Keep for future, not used
  useEffect(() => {
    // Future: fetchUserRoles
  }, []);

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : 'Loading...';

  return (
    <div className="glass-card rounded-lg p-6 mt-8 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-estate-purple">
      <h2 className="text-xl font-semibold mb-4 text-estate-blue">Account Information</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-estate-purpleLight/40 to-estate-red/10 p-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5 border border-estate-purple/10">
          <p className="text-muted-foreground font-medium">Email</p>
          <p className="font-semibold text-foreground">{user?.email || 'N/A'}</p>
        </div>
        <div className="bg-gradient-to-br from-beauty-greenLight/30 to-estate-purpleLight/30 p-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5 border border-estate-purple/10">
          <p className="text-muted-foreground font-medium">Name</p>
          <p className="font-semibold text-foreground">{displayName || 'No name provided'}</p>
        </div>
        {profile?.phone_number && (
          <div className="bg-gradient-to-br from-estate-gold/15 to-estate-purpleLight/30 p-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5 border border-estate-purple/10">
            <p className="text-muted-foreground font-medium">Phone Number</p>
            <p className="font-semibold text-foreground">{profile.phone_number}</p>
          </div>
        )}
        {profile?.address && (
          <div className="bg-gradient-to-br from-estate-red/10 to-beauty-pink/15 p-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5 border border-estate-purple/10">
            <p className="text-muted-foreground font-medium">Address</p>
            <p className="font-semibold text-foreground">{profile.address}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountInformation;
