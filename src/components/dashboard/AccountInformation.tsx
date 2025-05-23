
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

const AccountInformation = () => {
  const { user, profile, userRole } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  
  useEffect(() => {
    if (user?.id) {
      fetchUserRoles();
    }
  }, [user?.id]);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setUserRoles(data?.map(r => r.role) || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const displayName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
    : 'Loading...';

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8 hover:shadow-xl transition-all duration-300 hover:scale-105 focus-within:scale-105 focus-within:ring-2 focus-within:ring-purple-500">
      <h2 className="text-xl font-semibold mb-4 text-estate-blue">Account Information</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg hover:scale-105 transition-all duration-300">
          <p className="text-gray-600 font-medium">Email</p>
          <p className="font-semibold text-black">{user?.email}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg hover:scale-105 transition-all duration-300">
          <p className="text-gray-600 font-medium">Name</p>
          <p className="font-semibold text-black">
            {displayName || 'No name provided'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg hover:scale-105 transition-all duration-300">
          <p className="text-gray-600 font-medium">Primary Role</p>
          <p className="font-semibold capitalize text-black">
            {userRole || 'User'}
          </p>
        </div>
        {userRoles.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg hover:scale-105 transition-all duration-300">
            <p className="text-gray-600 font-medium">All Roles</p>
            <div className="flex flex-wrap gap-2">
              {userRoles.map((role, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-estate-blue text-white text-xs rounded-full capitalize"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountInformation;
