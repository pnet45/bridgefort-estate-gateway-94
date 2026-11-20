import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, Building2, Plane, Sprout, ShieldCheck, Clock, ArrowRight, Copy, ExternalLink } from 'lucide-react';

type Division = 'homes' | 'travels' | 'agrovest';
type DivisionReferralCode = { division: 'travels' | 'agrovest'; referral_code: string; created_at: string; };

type DivisionApplication = {
  id: string;
  division: Division;
  application_status: 'pending_review' | 'legacy_existing' | 'approved' | 'rejected' | 'suspended' | 'withdrawn';
  requested_at: string;
  reviewed_at: string | null;
};

const divisionDetails: Record<Division, { title: string; description: string; icon: React.ReactNode }> = {
  homes: { title: 'Bridgefort Homes', description: 'Real estate and property services', icon: <Building2 className="h-5 w-5" /> },
  travels: { title: 'Bridgefort Travels', description: 'Travel, flights, accommodation and tours', icon: <Plane className="h-5 w-5" /> },
  agrovest: { title: 'Bridgefort Agrovest', description: 'Agriculture and agribusiness', icon: <Sprout className="h-5 w-5" /> },
};

const statusLabels: Record<DivisionApplication['application_status'], string> = {
  pending_review: 'Pending review',
  legacy_existing: 'Existing BH-Realtors account',
  approved: 'Approved',
  rejected: 'Not approved',
  suspended: 'Temporarily suspended',
  withdrawn: 'Withdrawn',
};

const statusStyles: Record<DivisionApplication['application_status'], string> = {
  pending_review: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200',
  legacy_existing: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500/40 dark:bg-slate-800 dark:text-slate-200',
  approved: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200',
  rejected: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200',
  suspended: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-200',
  withdrawn: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-500/40 dark:bg-slate-800 dark:text-slate-300',
};

export default function BMCPartnerHub() {
  const { user, profile, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<DivisionApplication[]>([]);
  const [divisionReferralCodes, setDivisionReferralCodes] = useState<DivisionReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [selectedAdditionalDivisions, setSelectedAdditionalDivisions] = useState<Division[]>([]);
  const [agreedToBmcTerms, setAgreedToBmcTerms] = useState(false);
  const [acknowledgedBmcPrivacy, setAcknowledgedBmcPrivacy] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submittingApplications, setSubmittingApplications] = useState(false);

  const loadApplications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('bmc_partner_divisions')
      .select('id,division,application_status,requested_at,reviewed_at')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: true });
    if (error) {
      console.warn('BMC division status is not available yet:', error.message);
      setUnavailable(true);
      setApplications([]);
    } else {
      setUnavailable(false);
      setApplications(Array.isArray(data) ? data as DivisionApplication[] : []);
    }
    const { data: referralData, error: referralError } = await supabase.rpc('get_my_bmc_division_referral_codes' as never, {} as never) as unknown as { data: DivisionReferralCode[] | null; error: { message: string } | null };
    if (referralError) {
      console.info('Division referral links are not active in this environment yet.');
      setDivisionReferralCodes([]);
    } else {
      setDivisionReferralCodes(Array.isArray(referralData) ? referralData : []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) void loadApplications();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading, loadApplications]);

  const referralCode = profile?.pbo_referral_code || '';
  const referralLinkFor = (division: 'travels' | 'agrovest', code: string) => `${window.location.origin}/${division === 'travels' ? 'travels' : 'agrovest'}?bmc_ref=${encodeURIComponent(code)}`;
  const copyReferralLink = async (division: 'travels' | 'agrovest', code: string) => {
    const link = referralLinkFor(division, code);
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Referral link copied', description: `Your approved ${divisionDetails[division].title} referral link is ready to share.` });
    } catch {
      toast({ title: 'Unable to copy link', description: 'Please copy the referral link from the address field manually.', variant: 'destructive' });
    }
  };

  const existingDivisions = applications.map((application) => application.division);
  const availableDivisions = (['homes', 'travels', 'agrovest'] as Division[]).filter((division) => !existingDivisions.includes(division));

  const submitAdditionalApplications = async () => {
    if (selectedAdditionalDivisions.length === 0 || !agreedToBmcTerms || !acknowledgedBmcPrivacy) return;
    setSubmittingApplications(true);
    const results = await Promise.all(selectedAdditionalDivisions.map((division) =>
      supabase.rpc('request_bmc_division_application' as never, {
        _division: division,
        _agree_to_bmc_terms: true,
        _acknowledge_bmc_privacy: true,
        _marketing_consent: marketingConsent,
      } as never) as unknown as Promise<{ error: { message: string } | null }>
    ));
    const succeeded = results.filter((result) => !result.error).length;
    if (succeeded > 0) {
      toast({ title: 'BMC applications submitted', description: `${succeeded} division application(s) have been sent for separate review.` });
      setSelectedAdditionalDivisions([]);
      setAgreedToBmcTerms(false);
      setAcknowledgedBmcPrivacy(false);
      setMarketingConsent(false);
      await loadApplications();
    }
    if (succeeded < results.length) {
      toast({ title: 'Some applications could not be submitted', description: 'Please refresh and retry the remaining division applications.', variant: 'destructive' });
    }
    setSubmittingApplications(false);
  };

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-estate-blue" /></div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="container-custom flex-1 pt-32">
          <h1 className="text-3xl font-bold text-foreground">BMC Partner Hub</h1>
          <p className="mt-3 text-muted-foreground">Sign in to view your Bridgefort partner account and division applications.</p>
          <Link to="/bridgefort-realtors-login"><Button className="mt-5">Sign in to BMC</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-custom space-y-8 pb-16 pt-28">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-estate-blue">Bridgefort Multi-Business Consultants</p>
              <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">BMC Partner Hub</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">One Bridgefort partner identity across multiple business divisions. Each division has its own application review and approval status.</p>
            </div>
            <Button variant="outline" onClick={() => void loadApplications()} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Partner account</p>
              <p className="mt-1 font-semibold text-foreground">{profile?.first_name || user.email?.split('@')[0] || 'BMC Partner'}</p>
              <p className="mt-1 text-xs text-muted-foreground">Your authenticated Bridgefort account is your unified partner identity across selected divisions.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">BMC account reference</p>
              <p className="mt-1 font-mono text-lg font-semibold text-foreground">{referralCode || 'Not yet assigned'}</p>
              <p className="mt-1 text-xs text-muted-foreground">This reference identifies your account; it is not a shareable referral link. Division-specific referral links will be displayed only after the relevant division is approved and its referral workflow is activated. Your existing BH-Realtors referral identity remains preserved.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Your division applications</h2>
              <p className="mt-1 text-sm text-muted-foreground">Approval in one division does not automatically approve another.</p>
            </div>
            <Badge variant="outline">{applications.length} division {applications.length === 1 ? 'record' : 'records'}</Badge>
          </div>

          {unavailable && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
              Division status is not available yet because the BMC application records have not been enabled in this environment. Your existing Bridgefort account and referral information remain unchanged.
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-3 rounded-xl border border-border p-6 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading division applications…</div>
          ) : applications.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {applications.map((application) => {
                const details = divisionDetails[application.division];
                return (
                  <article key={application.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-estate-blue">
                      <span className="rounded-xl bg-estate-blue/10 p-3">{details.icon}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{details.title}</h3>
                        <p className="text-xs text-muted-foreground">{details.description}</p>
                      </div>
                    </div>
                    <div className="mt-5">
                      <Badge className={statusStyles[application.application_status]}>{statusLabels[application.application_status]}</Badge>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">Application recorded {new Date(application.requested_at).toLocaleDateString()}</p>
                    {application.application_status === 'pending_review' && <p className="mt-2 text-sm leading-5 text-muted-foreground">Your application is awaiting review. Division access and commission eligibility are not active until approval.</p>}
                    {application.application_status === 'legacy_existing' && <p className="mt-2 text-sm leading-5 text-muted-foreground">Your previous BH-Realtors account has been retained. This legacy status does not change your existing membership or independently approve other divisions.</p>}
                    {application.application_status === 'approved' && <p className="mt-2 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><ShieldCheck className="h-4 w-4" /> Division approval recorded.</p>}
                    {application.application_status === 'rejected' && <p className="mt-2 text-sm text-muted-foreground">Contact Bridgefort support if you need clarification about this decision.</p>}
                    {application.application_status === 'suspended' && <p className="mt-2 text-sm text-muted-foreground">Contact Bridgefort support for information about this restriction.</p>}
                    {application.application_status === 'withdrawn' && <p className="mt-2 text-sm text-muted-foreground">This application is no longer active.</p>}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">No division applications recorded</h3>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">When you submit a BMC application and select your business divisions, the requested divisions will appear here separately. You can continue using your existing Bridgefort services in the meantime.</p>
              <Link to="/bridgefort-realtors-login" className="mt-4 inline-flex items-center text-sm font-semibold text-estate-blue hover:underline">BMC registration <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </div>
          )}
        </section>

        {!unavailable && availableDivisions.length > 0 && (Boolean(profile?.is_pbo) || applications.length > 0) && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-foreground">Apply for additional divisions</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Your existing BMC identity can request access to other Bridgefort businesses. Every selected division is reviewed independently. Your current approval and referral history will not be changed.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {availableDivisions.map((division) => {
                const details = divisionDetails[division];
                return (
                  <label key={division} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
                    <input type="checkbox" checked={selectedAdditionalDivisions.includes(division)} onChange={(event) => setSelectedAdditionalDivisions((current) => event.target.checked ? [...current, division] : current.filter((item) => item !== division))} className="mt-1 h-4 w-4 rounded border-gray-300 text-estate-blue focus:ring-estate-blue" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">{details.icon}{details.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{details.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <label className="flex items-start gap-3 text-sm text-foreground">
                <input type="checkbox" checked={agreedToBmcTerms} onChange={(event) => setAgreedToBmcTerms(event.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-estate-blue focus:ring-estate-blue" />
                <span>I have read and agree to the separate <Link to="/bmc-partner-agreement" target="_blank" className="font-semibold text-estate-blue hover:underline">BMC Partner Agreement</Link>.</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-foreground">
                <input type="checkbox" checked={acknowledgedBmcPrivacy} onChange={(event) => setAcknowledgedBmcPrivacy(event.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-estate-blue focus:ring-estate-blue" />
                <span>I acknowledge that I have read the separate <Link to="/bmc-privacy-notice" target="_blank" className="font-semibold text-estate-blue hover:underline">BMC Privacy Notice</Link>.</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-estate-blue focus:ring-estate-blue" />
                <span>I would like to receive optional Bridgefort marketing communications. This choice is not required for partner applications.</span>
              </label>
              <Button onClick={() => void submitAdditionalApplications()} disabled={submittingApplications || selectedAdditionalDivisions.length === 0 || !agreedToBmcTerms || !acknowledgedBmcPrivacy}>
                {submittingApplications ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Submit division application(s)
              </Button>
            </div>
          </section>
        )}

        <section className="flex flex-wrap gap-3">
          <Link to="/bh-realtors"><Button variant="outline">Existing BH-Realtors workspace</Button></Link>
          <Link to="/bmc-partner-agreement"><Button variant="outline">BMC Partner Agreement</Button></Link>
          <Link to="/bmc-privacy-notice"><Button variant="outline">BMC Privacy Notice</Button></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
