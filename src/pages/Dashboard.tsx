
import React, { useRef, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientDashboard from '@/components/dashboard/ClientDashboard';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import { notifyProfileUpdated } from '@/lib/profileEvents';
import { isAdminRole } from '@/lib/rbac';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user, userRole, profile, loading, refreshProfile } = useAuth();
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      await refreshProfile();
      notifyProfileUpdated();
    } catch (err: any) {
      toast.error('Failed to update profile picture');
      console.error(err);
    } finally {
      setUploadingPic(false);
    }
  };

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-[88px] lg:pt-[104px] container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to access your dashboard.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const accountType = isAdminRole(userRole)
    ? (userRole === 'staff' ? 'Staff' : userRole === 'super_admin' ? 'Super Admin' : 'Admin')
    : profile?.is_pbo
      ? 'Realtor / PBO'
      : 'Client';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-[88px] lg:pt-[104px]">
        {/* User Info Header */}
        <div className="bg-white border-b">
          <div className="container-custom py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Clickable profile picture */}
                {loading ? (
                  <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-full" />
                ) : (
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden border-2 border-primary/30 bg-muted flex items-center justify-center">
                      {profile?.profile_picture_url ? (
                        <img src={profile.profile_picture_url} alt="Profile" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {(profile?.first_name || user?.email || 'U')[0].toUpperCase()}
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
                )}

                <div>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-7 w-56" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-estate-blue">
                        Welcome, {profile?.first_name || user?.email?.split('@')[0] || 'User'}!
                      </h1>
                      <p className="text-gray-600">
                        Email: {user?.email}
                      </p>
                      {profile?.first_name && profile?.last_name && (
                        <p className="text-gray-600">
                          Name: {profile.first_name} {profile.last_name}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Account Type</p>
                {loading ? (
                  <Skeleton className="h-5 w-24 ml-auto mt-1" />
                ) : (
                  <p className="font-semibold text-estate-blue capitalize">
                    {accountType}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <ClientDashboard />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;


