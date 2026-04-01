
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientDashboard from '@/components/dashboard/ClientDashboard';
import { Toaster } from '@/components/ui/toaster';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingPic(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: urlData.publicUrl + '?t=' + Date.now() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated!');
      fetchProfile();
    } catch (err: any) {
      toast.error('Failed to update profile picture');
      console.error(err);
    } finally {
      setUploadingPic(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 lg:pt-20 container mx-auto px-4 py-8">
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
      <div className="pt-16 lg:pt-20">
        {/* User Info Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Clickable profile picture */}
                <div
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden border-2 border-primary/30 bg-muted flex items-center justify-center">
                    {profile?.profile_picture_url ? (
                      <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {(profile?.first_name || user.email || 'U')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  {uploadingPic && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </div>

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

