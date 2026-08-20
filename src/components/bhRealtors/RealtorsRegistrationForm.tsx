import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, User, Landmark, CreditCard } from 'lucide-react';
import type { BhRealtorsPackage } from '@/data/bhRealtorsPackages';

const COMPLETION_FIELDS: { key: string; weight: number }[] = [
  { key: 'first_name', weight: 10 }, { key: 'last_name', weight: 10 }, { key: 'phone_number', weight: 10 },
  { key: 'date_of_birth', weight: 10 }, { key: 'gender', weight: 5 }, { key: 'address', weight: 10 },
  { key: 'state_of_origin', weight: 5 }, { key: 'local_government', weight: 5 }, { key: 'marital_status', weight: 5 },
  { key: 'occupation', weight: 10 }, { key: 'next_of_kin_name', weight: 5 }, { key: 'next_of_kin_relationship', weight: 5 },
  { key: 'next_of_kin_phone', weight: 5 }, { key: 'next_of_kin_email', weight: 5 },
];

export const calculateProfileCompletion = (profile: Record<string, any> | null) => {
  if (!profile) return 0;
  const total = COMPLETION_FIELDS.reduce((sum, item) => sum + item.weight, 0);
  const done = COMPLETION_FIELDS.reduce((sum, item) => sum + (profile[item.key] && String(profile[item.key]).trim() ? item.weight : 0), 0);
  return total ? Math.round((done / total) * 100) : 0;
};

interface BankDetails { bank_name: string; account_number: string; account_name: string; }
interface RealtorsRegistrationFormProps { open: boolean; onClose: () => void; selectedPackage: BhRealtorsPackage; onComplete: () => void; }
const emptyBank: BankDetails = { bank_name: '', account_number: '', account_name: '' };

const RealtorsRegistrationForm: React.FC<RealtorsRegistrationFormProps> = ({ open, onClose, selectedPackage }) => {
  const { user } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [lga, setLga] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [occupation, setOccupation] = useState('');
  const [nokName, setNokName] = useState('');
  const [nokRelationship, setNokRelationship] = useState('');
  const [nokPhone, setNokPhone] = useState('');
  const [nokEmail, setNokEmail] = useState('');
  const [nokAddress, setNokAddress] = useState('');
  const [bank, setBank] = useState<BankDetails>(emptyBank);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      setLoadingProfile(true);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (cancelled) return;
      if (!error && data) {
        setCompletion(calculateProfileCompletion(data));
        setFirstName(data.first_name || ''); setLastName(data.last_name || ''); setPhone(data.phone_number || '');
        setDob(data.date_of_birth || ''); setGender(data.gender || ''); setAddress(data.address || '');
        setStateOfOrigin(data.state_of_origin || ''); setLga(data.local_government || '');
        setMaritalStatus(data.marital_status || ''); setOccupation(data.occupation || '');
        setNokName(data.next_of_kin_name || ''); setNokRelationship(data.next_of_kin_relationship || '');
        setNokPhone(data.next_of_kin_phone || ''); setNokEmail(data.next_of_kin_email || ''); setNokAddress(data.next_of_kin_address || '');
        try { setBank(data.banking_details ? { ...emptyBank, ...JSON.parse(data.banking_details) } : emptyBank); } catch { setBank(emptyBank); }
      }
      setLoadingProfile(false);
    })();
    return () => { cancelled = true; };
  }, [open, user]);

  const isFullMode = completion < 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!bank.bank_name.trim() || !bank.account_number.trim() || !bank.account_name.trim()) {
      toast({ title: 'Bank details required', description: 'Please provide your bank details so commissions can be paid to you.', variant: 'destructive' });
      return;
    }
    if (isFullMode && (!firstName.trim() || !lastName.trim() || !phone.trim() || !address.trim() || !nokName.trim() || !nokRelationship.trim() || !nokPhone.trim())) {
      toast({ title: 'Missing information', description: 'Please complete your required personal and Next of Kin details.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      // Save profile/bank details first, but DO NOT activate the Realtor yet.
      // Activation happens only after Paystack confirms successful payment.
      const profileUpdate: Record<string, any> = {
        banking_details: JSON.stringify(bank),
        updated_at: new Date().toISOString(),
      };
      if (isFullMode) Object.assign(profileUpdate, {
        first_name: firstName, last_name: lastName, phone_number: phone, date_of_birth: dob || null,
        gender: gender || null, address, state_of_origin: stateOfOrigin || null, local_government: lga || null,
        marital_status: maritalStatus || null, occupation: occupation || null, next_of_kin_name: nokName,
        next_of_kin_relationship: nokRelationship, next_of_kin_phone: nokPhone, next_of_kin_email: nokEmail || null,
        next_of_kin_address: nokAddress || null,
      });
      const { error: profileError } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id);
      if (profileError) throw profileError;

      const reference = `BHREALTOR_${user.id.replace(/-/g, '').slice(0, 12)}_${Date.now()}`;
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        body: {
          email: user.email,
          reference,
          amount: selectedPackage.price,
          metadata: {
            purchase_type: 'membership',
            package_code: selectedPackage.package_code,
            package_name: selectedPackage.package_name,
            user_id: user.id,
          },
        },
      });
      if (error) throw error;
      const authorizationUrl = data?.data?.authorization_url;
      if (!authorizationUrl) throw new Error(data?.error || 'Unable to initialize membership payment.');

      toast({ title: 'Redirecting to payment', description: `Complete your ${selectedPackage.package_name} membership payment securely with Paystack.` });
      window.location.assign(authorizationUrl);
    } catch (error: any) {
      console.error('BHRealtors membership registration error:', error);
      toast({ title: 'Registration failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const packagePrice = Number(selectedPackage.price || 0);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-estate-blue"><ShieldCheck className="h-5 w-5" /> BHRealtors Registration</DialogTitle>
          <DialogDescription>
            Join the <strong>{selectedPackage.package_name}</strong> package. Membership becomes active only after successful payment.
          </DialogDescription>
        </DialogHeader>

        {loadingProfile ? <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-estate-blue" /></div> : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-white/40 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Selected package</p><p className="text-xl font-bold">{selectedPackage.package_name}</p></div>
                <div className="text-right"><p className="text-xs text-muted-foreground">Membership fee</p><p className="text-2xl font-bold text-estate-purple">₦{packagePrice.toLocaleString('en-NG')}</p></div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Membership referral income is earned only when the successful payment is above ₦5,000.</p>
            </div>

            {!isFullMode ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><User className="inline h-4 w-4 mr-1" /> Your profile is already more than 50% complete. Only bank details are required below.</div>
            ) : (
              <section>
                <p className="font-semibold mb-3 flex items-center gap-2"><User className="h-4 w-4" /> Personal details</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>First Name *</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                  <div><Label>Last Name *</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                  <div><Label>Phone *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                  <div><Label>Date of Birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
                  <div><Label>Gender</Label><Select value={gender} onValueChange={setGender}><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div>
                  <div><Label>Marital Status</Label><Select value={maritalStatus} onValueChange={setMaritalStatus}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem><SelectItem value="divorced">Divorced</SelectItem></SelectContent></Select></div>
                  <div className="sm:col-span-2"><Label>Address *</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
                  <div><Label>State of Origin</Label><Input value={stateOfOrigin} onChange={(e) => setStateOfOrigin(e.target.value)} /></div>
                  <div><Label>Local Government</Label><Input value={lga} onChange={(e) => setLga(e.target.value)} /></div>
                  <div className="sm:col-span-2"><Label>Occupation</Label><Input value={occupation} onChange={(e) => setOccupation(e.target.value)} /></div>
                </div>
              </section>
            )}

            <section>
              <p className="font-semibold mb-3 flex items-center gap-2"><User className="h-4 w-4" /> Next of Kin</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Name *</Label><Input value={nokName} onChange={(e) => setNokName(e.target.value)} /></div>
                <div><Label>Relationship *</Label><Input value={nokRelationship} onChange={(e) => setNokRelationship(e.target.value)} /></div>
                <div><Label>Phone *</Label><Input value={nokPhone} onChange={(e) => setNokPhone(e.target.value)} /></div>
                <div><Label>Email</Label><Input type="email" value={nokEmail} onChange={(e) => setNokEmail(e.target.value)} /></div>
                <div className="sm:col-span-2"><Label>Address</Label><Input value={nokAddress} onChange={(e) => setNokAddress(e.target.value)} /></div>
              </div>
            </section>

            <section>
              <p className="font-semibold mb-3 flex items-center gap-2"><Landmark className="h-4 w-4" /> Commission bank account</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><Label>Bank Name *</Label><Input value={bank.bank_name} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} /></div>
                <div><Label>Account Number *</Label><Input inputMode="numeric" value={bank.account_number} onChange={(e) => setBank({ ...bank, account_number: e.target.value.replace(/\D/g, '') })} /></div>
                <div><Label>Account Name *</Label><Input value={bank.account_name} onChange={(e) => setBank({ ...bank, account_name: e.target.value })} /></div>
              </div>
            </section>

            <Button type="submit" disabled={submitting} className="w-full h-12 bg-estate-blue hover:bg-estate-darkBlue">
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing secure payment…</> : <><CreditCard className="h-4 w-4 mr-2" /> Pay ₦{packagePrice.toLocaleString('en-NG')} & Register</>}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RealtorsRegistrationForm;
