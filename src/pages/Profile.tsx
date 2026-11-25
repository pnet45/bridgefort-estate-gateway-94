
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewProfileForm from '@/components/profile/NewProfileForm';
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const lastAuthenticatedUserIdRef = useRef<string | null>(user?.id ?? null);
  if (user?.id) lastAuthenticatedUserIdRef.current = user.id;
  // Retain the authenticated ID during a temporary auth hydration window so
  // the profile route does not unmount while the mobile file picker is open.
  const userId = user?.id ?? (authLoading ? lastAuthenticatedUserIdRef.current : null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [profileStatus, setProfileStatus] = useState('DRAFT');
  const [kycStatus, setKycStatus] = useState('NOT_STARTED');
  const [isBmcPartner, setIsBmcPartner] = useState(Boolean(profile?.is_pbo));

  useEffect(() => {
    if (!userId) { setIsBmcPartner(false); return; }
    if (profile?.is_pbo) { setIsBmcPartner(true); return; }
    let active = true;
    void (supabase as any).from('bmc_partner_divisions').select('id').eq('user_id', userId).limit(1).maybeSingle()
      .then(({ data, error }) => { if (active) setIsBmcPartner(!error && Boolean(data)); });
    return () => { active = false; };
  }, [userId, profile?.is_pbo]);

  // Redirect only when the initial auth check has completed without a user.
  useEffect(() => {
    if (!userId && !authLoading) navigate('/auth');
  }, [userId, authLoading, navigate]);

  // Load profile readiness only when the authenticated identity changes.
  // Do not rerun this request on background auth-loading transitions: setting
  // loading=true would replace NewProfileForm and discard its in-memory file.
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const checkProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id,profile_completion_percentage,profile_status,kyc_status')
          .eq('id', userId)
          .maybeSingle();

        if (active && !error) {
          setProfileExists(!!data);
          setCompletion(data?.profile_completion_percentage ?? 0);
          setProfileStatus(data?.profile_status ?? 'DRAFT');
          setKycStatus(data?.kyc_status ?? 'NOT_STARTED');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    checkProfile();
    return () => { active = false; };
  }, [userId]);

  if (!userId || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-28 pb-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-estate-blue" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12">
        <div className="container-custom px-4 sm:px-6">
          <div className="mb-6">
            <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm mb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-estate-blue"><ShieldCheck className="h-4 w-4" />Profile readiness</div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Your completion is calculated from the information required by Bridgefort.</p>{isBmcPartner && <Link to="/bmc-partner-hub" className="mt-2 inline-block text-xs font-semibold text-estate-blue underline">Manage your central BMC identity verification</Link>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{profileStatus.replace(/_/g, ' ')}</span>
                  {!isBmcPartner && kycStatus === 'VERIFIED' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1"><span>Profile completion</span><span>{completion}%</span></div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-estate-blue transition-all" style={{ width: `${completion}%` }} /></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-estate-blue mb-2">
              {profileExists ? 'Update Your Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600">
              {profileExists 
                ? 'Keep your information up to date' 
                : 'Please complete your profile to access all features including property purchases and documentation services'}
            </p>
          </div>
          <NewProfileForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
