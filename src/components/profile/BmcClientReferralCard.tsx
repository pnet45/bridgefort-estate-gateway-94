import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Lock, Link2, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type ReferralState =
  | { status: 'not_linked' }
  | { status: 'review_required' }
  | { status: 'linked'; referral_code?: string; referrer_name?: string | null; linked_at?: string };

const BmcClientReferralCard: React.FC = () => {
  const [code, setCode] = useState('');
  const [referral, setReferral] = useState<ReferralState>({ status: 'not_linked' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadReferral = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_my_bmc_client_referral' as any);
      if (error) throw error;
      const result = (data || { status: 'not_linked' }) as ReferralState;
      setReferral(result);
      if (result.status === 'linked' && result.referral_code) setCode(result.referral_code);
    } catch (error: any) {
      console.error('BMC referral lookup failed:', error);
      toast({ title: 'Could not load BMC referral details', description: error?.message || 'Please refresh and try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadReferral(); }, [loadReferral]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      toast({ title: 'Enter a BMC referral code', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('attach_my_bmc_referral_code' as any, { _code: normalized });
      if (error) throw error;
      setReferral(data as ReferralState);
      toast({ title: 'BMC referral linked', description: 'This direct referral is now saved to your Bridgefort profile for eligible Homes, Travels and Agrovest purchases.' });
    } catch (error: any) {
      toast({ title: 'Referral could not be linked', description: error?.message || 'Verify the code or contact support.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-5 border-estate-purple/20 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-estate-blue">
          <Link2 className="h-5 w-5" /> BMC Referral Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Were you referred by a Bridgefort Multi-Business Consultant? Add their code once to connect your profile across Bridgefort Homes, Travels and Agrovest.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking referral details…</div>
        ) : referral.status === 'linked' ? (
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Referral linked</div>
            <div className="mt-2 grid gap-1 text-sm">
              <p><span className="text-muted-foreground">BMC code:</span> <strong>{referral.referral_code || code}</strong></p>
              {referral.referrer_name && <p><span className="text-muted-foreground">Referred by:</span> <strong>{referral.referrer_name}</strong></p>}
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> This referral is locked to protect accurate attribution. Contact Bridgefort support if a correction is required.</p>
          </div>
        ) : referral.status === 'review_required' ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> Referral review required</p>
            <p className="mt-1 text-muted-foreground">Your account has more than one recorded BMC referral source. Please contact Bridgefort support so the correct direct referrer can be verified before a new link is added.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bmc-client-referral-code">BMC referral code</Label>
              <Input id="bmc-client-referral-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Enter the referring BMC code" autoComplete="off" maxLength={64} />
              <p className="text-xs text-muted-foreground">The code is checked against Bridgefort’s active BMC referral records. Once linked, it cannot be changed online.</p>
            </div>
            <Button type="submit" disabled={saving || !code.trim()} className="w-full sm:w-auto">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Linking referral…</> : 'Save BMC referral'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default BmcClientReferralCard;
