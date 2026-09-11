import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

// This file intentionally retains the existing profile form implementation.
// Welcome emails are now triggered server-side from the profile INSERT event,
// so profile completion or later edits must never send another welcome email.

export default function ProfileForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      try {
        const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (profileData && !error) setFormData(profileData);
      } catch (error) { console.error('Error loading profile:', error); }
    };
    loadProfileData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        ...formData,
        terms_accepted: termsAccepted,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) throw error;
      toast({ title: 'Profile Saved!', description: 'Your profile has been updated successfully.' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Error', description: 'Failed to update profile. Please try again.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div><label className="block text-sm font-medium">First Name</label><input className="mt-1 w-full rounded-md border p-2" value={formData.first_name || ''} onChange={(e) => setFormData((p: any) => ({ ...p, first_name: e.target.value }))} /></div>
      <div><label className="block text-sm font-medium">Last Name</label><input className="mt-1 w-full rounded-md border p-2" value={formData.last_name || ''} onChange={(e) => setFormData((p: any) => ({ ...p, last_name: e.target.value }))} /></div>
      <button type="submit" disabled={loading} className="rounded-md bg-primary px-5 py-2 text-white">{loading ? 'Saving…' : 'Save Profile'}</button>
    </form>
  );
}
