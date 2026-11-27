import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import KYCUploadField from '@/components/profile/KYCUploadField';
import { toast } from '@/hooks/use-toast';
import { notifyProfileUpdated } from '@/lib/profileEvents';
import { Loader2, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

type KycStatus = 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'REQUIRES_CORRECTION' | 'VERIFIED' | 'REJECTED';
type DocumentRef = { path: string; name: string; type: string };

const statusLabel: Record<KycStatus, string> = {
  NOT_STARTED: 'Not submitted',
  PENDING: 'Awaiting review',
  UNDER_REVIEW: 'Under review',
  REQUIRES_CORRECTION: 'Correction required',
  VERIFIED: 'Identity verified',
  REJECTED: 'Not approved',
};

export default function BMCIdentityKYC() {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<KycStatus>('NOT_STARTED');
  const [reviewNote, setReviewNote] = useState('');
  const [documents, setDocuments] = useState<Record<string, DocumentRef>>({});
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', nationality: '',
    phone_number: '', address: '', id_type: '', id_number: '',
    id_country_of_issue: '', id_date_of_issue: '', id_expiry: '',
    id_issuing_authority: '', spouse_name: '', spouse_phone: '', spouse_email: '', spouse_address: '', is_joint_purchase: false, joint_purchaser_name: '', joint_purchaser_phone: '', joint_purchaser_email: '', joint_purchaser_relationship: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: statusData, error: statusError }, { data: existing, error: existingError }] = await Promise.all([
      supabase.rpc('get_my_bmc_identity_kyc_status' as never, {} as never) as unknown as Promise<{ data: Array<{ status: KycStatus; review_note: string | null }> | null; error: { message: string } | null }>,
      (supabase as any).from('bmc_identity_kyc').select('identity_data,documents').eq('user_id', user.id).maybeSingle(),
    ]);
    if (statusError) {
      console.warn('Central BMC KYC status is unavailable:', statusError.message);
      toast({ title: 'KYC service is not available yet', description: 'The central BMC KYC database migration must be applied before submitting.', variant: 'destructive' });
    } else {
      const row = Array.isArray(statusData) ? statusData[0] : null;
      setStatus(row?.status || 'NOT_STARTED');
      setReviewNote(row?.review_note || '');
    }
    if (!existingError && existing) {
      const savedIdentity = (existing.identity_data || {}) as Record<string, any>;
      setForm(current => ({
        ...current,
        ...savedIdentity,
        first_name: savedIdentity.first_name || current.first_name || profile?.first_name || '',
        last_name: savedIdentity.last_name || current.last_name || profile?.last_name || '',
        phone_number: savedIdentity.phone_number || current.phone_number || profile?.phone_number || '',
        address: savedIdentity.address || current.address || profile?.current_residence || profile?.address || '',
        spouse_name: savedIdentity.spouse_name || current.spouse_name || (profile as any)?.spouse_name || '',
        spouse_phone: savedIdentity.spouse_phone || current.spouse_phone || (profile as any)?.spouse_phone || '',
        spouse_email: savedIdentity.spouse_email || current.spouse_email || (profile as any)?.spouse_email || '',
        spouse_address: savedIdentity.spouse_address || current.spouse_address || (profile as any)?.spouse_address || '',
        is_joint_purchase: savedIdentity.is_joint_purchase ?? (profile as any)?.is_joint_purchase ?? false,
        joint_purchaser_name: savedIdentity.joint_purchaser_name || (profile as any)?.joint_purchaser_name || '',
        joint_purchaser_phone: savedIdentity.joint_purchaser_phone || (profile as any)?.joint_purchaser_phone || '',
        joint_purchaser_email: savedIdentity.joint_purchaser_email || (profile as any)?.joint_purchaser_email || '',
        joint_purchaser_relationship: savedIdentity.joint_purchaser_relationship || (profile as any)?.joint_purchaser_relationship || '',
      }));
      const saved = existing.documents || {};
      setDocuments(Object.fromEntries(Object.entries(saved).map(([key, value]) => {
        const item = value as Record<string, string>;
        return [key, { path: item.path || item.url || item, name: item.name || key, type: item.type || '' }];
      })));
    } else {
      setForm(current => ({
        ...current,
        first_name: current.first_name || profile?.first_name || '',
        last_name: current.last_name || profile?.last_name || '',
        date_of_birth: current.date_of_birth || profile?.date_of_birth || '',
        nationality: current.nationality || profile?.nationality || '',
        phone_number: current.phone_number || profile?.phone_number || '',
        address: current.address || profile?.current_residence || profile?.address || '',
        id_type: current.id_type || profile?.id_type || '',
        id_number: current.id_number || profile?.id_number || '',
        id_country_of_issue: current.id_country_of_issue || profile?.id_country_of_issue || '',
        id_date_of_issue: current.id_date_of_issue || profile?.id_date_of_issue || '',
        id_expiry: current.id_expiry || profile?.id_expiry || '',
        id_issuing_authority: current.id_issuing_authority || profile?.id_issuing_authority || '',
        spouse_name: current.spouse_name || (profile as any)?.spouse_name || '',
        spouse_phone: current.spouse_phone || (profile as any)?.spouse_phone || '',
        spouse_email: current.spouse_email || (profile as any)?.spouse_email || '',
        spouse_address: current.spouse_address || (profile as any)?.spouse_address || '',
        is_joint_purchase: current.is_joint_purchase ?? (profile as any)?.is_joint_purchase ?? false,
        joint_purchaser_name: current.joint_purchaser_name || (profile as any)?.joint_purchaser_name || '',
        joint_purchaser_phone: current.joint_purchaser_phone || (profile as any)?.joint_purchaser_phone || '',
        joint_purchaser_email: current.joint_purchaser_email || (profile as any)?.joint_purchaser_email || '',
        joint_purchaser_relationship: current.joint_purchaser_relationship || (profile as any)?.joint_purchaser_relationship || '',
      }));
    }
    setLoading(false);
  }, [user, profile]);

  useEffect(() => { void load(); }, [load]);

  const setField = (key: string, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));
  const upload = (key: string) => (path: string, name: string, type: string) => {
    setDocuments(current => ({ ...current, [key]: { path, name, type } }));
  };

  const submit = async () => {
    if (!user || saving) return;
    if (!documents.passport_photo?.path || !documents.identity_document?.path) {
      toast({ title: 'Identity documents required', description: 'Upload both your passport photograph and a valid identity document.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('submit_my_bmc_identity_kyc' as never, {
      _identity_data: form,
      _documents: documents,
    } as never);
    if (error) {
      toast({ title: 'KYC submission failed', description: error.message, variant: 'destructive' });
    } else {
      const { error: profileSyncError } = await supabase.from('profiles').update({
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        date_of_birth: form.date_of_birth || null,
        nationality: form.nationality || null,
        phone_number: form.phone_number || null,
        address: form.address || null,
        current_residence: form.address || null,
        id_type: form.id_type || null,
        id_number: form.id_number || null,
        id_country_of_issue: form.id_country_of_issue || null,
        id_date_of_issue: form.id_date_of_issue || null,
        id_expiry: form.id_expiry || null,
        id_issuing_authority: form.id_issuing_authority || null,
        spouse_name: form.spouse_name || null,
        spouse_phone: form.spouse_phone || null,
        spouse_email: form.spouse_email || null,
        spouse_address: form.spouse_address || null,
        is_joint_purchase: Boolean(form.is_joint_purchase),
        joint_purchaser_name: form.is_joint_purchase ? (form.joint_purchaser_name || null) : null,
        joint_purchaser_phone: form.is_joint_purchase ? (form.joint_purchaser_phone || null) : null,
        joint_purchaser_email: form.is_joint_purchase ? (form.joint_purchaser_email || null) : null,
        joint_purchaser_relationship: form.is_joint_purchase ? (form.joint_purchaser_relationship || null) : null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      if (profileSyncError) {
        console.warn('BMC KYC was submitted, but profile details could not be synchronised:', profileSyncError);
        toast({ title: 'BMC identity submitted', description: 'Your KYC is awaiting review. Some profile fields could not be synchronised; please review your profile later.' });
      } else {
        notifyProfileUpdated();
        toast({ title: 'BMC identity submitted', description: 'Your central KYC is awaiting review and matching details have been synchronised to your Bridgefort profile.' });
      }
      await load();
    }
    setSaving(false);
  };

  if (loading) return <Card><CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading central identity verification…</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Central BMC Identity Verification</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Verify once for Bridgefort Homes, Travels and Agrovest. You do not need a separate BH-Realtors KYC submission.</p>
          </div>
          <Badge variant="outline">{statusLabel[status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {status === 'VERIFIED' ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
            <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> Your BMC identity is verified.</p>
            <p className="mt-1">This verification is shared across Bridgefort Homes, Bridgefort Travels and Bridgefort Agrovest, subject to each business’s separate participation and commission rules.</p>
          </div>
        ) : (
          <>
            {status === 'PENDING' || status === 'UNDER_REVIEW' ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"><Clock className="mr-2 inline h-4 w-4" /> Your documents have been submitted and are awaiting review.</div>
            ) : status === 'REQUIRES_CORRECTION' || status === 'REJECTED' ? (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100"><AlertCircle className="mr-2 inline h-4 w-4" /> {reviewNote || 'Please review your information and resubmit.'}</div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ['first_name','First name','text'],['last_name','Last name','text'],['date_of_birth','Date of birth','date'],
                ['nationality','Nationality','text'],['phone_number','Phone number','tel'],['address','Residential address','text'],
                ['id_type','ID type','text'],['id_number','ID number','text'],['id_country_of_issue','Country of issue','text'],
                ['id_date_of_issue','Date of issue','date'],['id_expiry','Expiry date','date'],['id_issuing_authority','Issuing authority','text'],
              ] as const).map(([key,label,type]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input id={key} type={type} value={form[key]} onChange={event => setField(key,event.target.value)} />
                </div>
              ))}
            </div>
            <section className="space-y-3 rounded-xl border p-4">
              <h3 className="font-semibold text-foreground">Spouse and joint-purchase details</h3>
              <p className="text-sm text-muted-foreground">These fields are prefilled from your Bridgefort profile where available. Review them and update any changes before submitting.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {([['spouse_name','Spouse full name','text'],['spouse_phone','Spouse phone','tel'],['spouse_email','Spouse email','email'],['spouse_address','Spouse address','text'],['joint_purchaser_name','Joint purchaser full name','text'],['joint_purchaser_phone','Joint purchaser phone','tel'],['joint_purchaser_email','Joint purchaser email','email'],['joint_purchaser_relationship','Relationship to primary purchaser','text']] as const).map(([key,label,type]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input id={key} type={type} value={String(form[key] || '')} onChange={event => setField(key,event.target.value)} />
                  </div>
                ))}
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" checked={Boolean(form.is_joint_purchase)} onChange={event => setField('is_joint_purchase', event.target.checked)} />
                  This purchase / subscription is intended to be jointly owned
                </label>
              </div>
            </section>
            <div className="grid gap-3 sm:grid-cols-2">
              <KYCUploadField label="Passport photograph" bucket="kyc-documents" userId={user?.id || ''} docKey="passport_photo" existingUrl={documents.passport_photo?.path} existingName={documents.passport_photo?.name} existingType={documents.passport_photo?.type} onUploaded={upload('passport_photo')} />
              <KYCUploadField label="Government-issued identity document" bucket="kyc-documents" userId={user?.id || ''} docKey="identity_document" existingUrl={documents.identity_document?.path} existingName={documents.identity_document?.name} existingType={documents.identity_document?.type} onUploaded={upload('identity_document')} />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => void submit()} disabled={saving || status === 'PENDING' || status === 'UNDER_REVIEW'}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Submit BMC KYC for review
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
