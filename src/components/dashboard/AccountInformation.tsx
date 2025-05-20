
import React from 'react';
import { useAuth } from '@/contexts/auth';

const AccountInformation = () => {
  const { user, profile, userRole } = useAuth();
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">Account Information</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-gray-600">Name</p>
          <p className="font-medium">
            {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Role</p>
          <p className="font-medium capitalize">
            {userRole || 'User'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountInformation;
