
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientDashboard from '@/components/dashboard/ClientDashboard';
import { Toaster } from '@/components/ui/toaster';

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to access your dashboard.</p>
          </div>
        </div>
        <Footer />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20">
        {/* User Info Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-estate-blue">
                  Welcome, {profile?.first_name || user.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-gray-600">
                  Email: {user.email}
                </p>
                {profile?.first_name && profile?.last_name && (
                  <p className="text-gray-600">
                    Name: {profile.first_name} {profile.last_name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-semibold text-estate-blue capitalize">
                  {userRole || 'Client'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ClientDashboard />
      </div>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Dashboard;
