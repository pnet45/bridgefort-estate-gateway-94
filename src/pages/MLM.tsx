import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clipboard, Share2, Users } from 'lucide-react';

const MLM = () => {
  const { user, profile, loading } = useAuth();
  const [shareLink, setShareLink] = useState('');
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [pboCount, setPboCount] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = profile?.pbo_referral_code || (user ? user.id.slice(0, 8).toUpperCase() : '');
    if (user) {
      setShareLink(`${window.location.origin}/auth?ref=${code}`);
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        const { count: totalCount, error: totalError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        if (!totalError && typeof totalCount === 'number') {
          setMemberCount(totalCount);
        }

        const { count: pboCountResult, error: pboError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('is_pbo', true);

        if (!pboError && typeof pboCountResult === 'number') {
          setPboCount(pboCountResult);
        }
      } catch (error) {
        console.error('Error loading MLM stats:', error);
        setErrorMessage('Unable to load MLM statistics right now.');
      }
    };

    loadStats();
  }, [user]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopyStatus('Referral link copied!');
      window.setTimeout(() => setCopyStatus(''), 2500);
    } catch (error) {
      console.error('Copy failed', error);
      setCopyStatus('Unable to copy link.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-28 pb-12 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-estate-blue" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-estate-blue">MLM Dashboard</h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  This MLM app page is connected to the same Supabase database used by the website. It reads shared
                  membership and PBO data from the existing `profiles` table and gives you a referral link you can share.
                </p>
              </div>

              {user ? (
                <>
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Your referral code</p>
                      <p className="mt-2 text-2xl font-semibold text-estate-blue">
                        {profile?.pbo_referral_code || user.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">Share this code with new members and partners.</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Referral link</p>
                          <p className="mt-2 break-all text-sm text-slate-700">{shareLink}</p>
                        </div>
                        <Button type="button" onClick={handleCopyLink} className="inline-flex items-center gap-2">
                          <Clipboard size={16} /> Copy link
                        </Button>
                      </div>
                      {copyStatus && <p className="mt-3 text-sm text-emerald-600">{copyStatus}</p>}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center gap-3">
                          <Users size={20} className="text-estate-blue" />
                          <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total members</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900">
                              {memberCount !== null ? memberCount : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center gap-3">
                          <Share2 size={20} className="text-estate-blue" />
                          <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active PBOs</p>
                            <p className="mt-2 text-3xl font-semibold text-slate-900">
                              {pboCount !== null ? pboCount : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <h2 className="text-xl font-semibold text-estate-blue">How this app shares the same database</h2>
                      <ul className="mt-4 space-y-3 text-slate-600">
                        <li>• All members are stored in the shared `profiles` table.</li>
                        <li>• The page uses the existing Supabase client from `src/integrations/supabase/client.ts`.</li>
                        <li>• Referral code and PBO membership read the same database records used by the website.</li>
                        <li>• When authenticated, this page displays shared stats directly from Supabase.</li>
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                  <p className="text-gray-700 mb-6">
                    Sign in or register to access your MLM referral dashboard. This page will still use the same shared
                    Supabase database as the rest of the app.
                  </p>
                  <Link to="/auth">
                    <Button className="inline-flex items-center gap-2">Go to Auth</Button>
                  </Link>
                </div>
              )}

              {errorMessage && (
                <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {errorMessage}
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-estate-blue">Fast start</h2>
                <p className="mt-3 text-slate-600">
                  Use your referral code on the sign-up page to track new partners. The page reads the same database
                  connection used across the site, so your affiliation stays synced automatically.
                </p>
                <Badge className="mt-4 bg-estate-blue/10 text-estate-blue">Shared database: Supabase</Badge>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-estate-blue">Next steps</h2>
                <ol className="mt-3 space-y-3 text-slate-600 list-decimal list-inside">
                  <li>Complete your profile under Profile.</li>
                  <li>Share your referral link with new members.</li>
                  <li>Ask new signups to enter your code on registration.</li>
                  <li>View shared metrics from the same Supabase DB.</li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MLM;
