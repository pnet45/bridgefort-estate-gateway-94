import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, User, Users, Landmark, PartyPopper } from 'lucide-react';
import type { BhRealtorsPackage } from '@/data/bhRealtorsPackages';

// Same weighted fields/weights used by ProfileCompletionWidget, so the 50%
// threshold checked here always matches what the profile widget shows.
const COMPLETION_FIELDS: { key: string; weight: number }[] = [
  { key: 'first_name', weight: 10 },
  { key: 'last_name', weight: 10 },
  { key: 'phone_number', weight: 10 },
  { key: 'date_of_birth', weight: 10 },
  { key: 'gender', weight: 5 },
  { key: 'address', weight: 10 },
  { key: 'state_of_origin', weight: 5 },
  { key: 'local_government', weight: 5 },
  { key: 'marital_status', weight: 5 },
  { key: 'occupation', weight: 10 },
  { key: 'next_of_kin_name', weight: 5 },
  { key: 'next_of_kin_relationship', weight: 5 },
  { key: 'next_of_kin_phone', weight: 5 },
  { key: 'next_of_kin_email', weight: 5 },
];

export const calculateProfileCompletion = (profile: Record<string, any> | null) => {
  if (!profile) return 0;
  let total = 0;
  let done = 0;
  COMPLETION_FIELDS.forEach(({ key, weight }) => {
    total += weight;
    if (profile[key] && String(profile[key]).trim() !== '') done += weight;
  });
  return total > 0 ? Math.round((done / total) * 100) : 0;
};

interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface RealtorsRegistrationFormProps {
  open: boolean;
  onClose: () => void;
  selectedPackage: BhRealtorsPackage;
  onComplete: () => void;
}

const emptyBank: BankDetails = { bank_name: '', account_number: '', account_name: '' };

const RealtorsRegistrationForm: React.FC<RealtorsRegistrationFormProps> = ({
  open, onClose, selectedPackage, onComplete,
}) => {
  const { user, refreshProfile } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileRow, setProfileRow] = useState<Record<string, any> | null>(null);
  const [completion, setCompletion] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

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

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfileRow(data);
        setCompletion(calculateProfileCompletion(data));

        setFirstName(data?.first_name || '');
        setLastName(data?.last_name || '');
        setPhone(data?.phone_number || '');
        setDob(data?.date_of_birth || '');
        setGender(data?.gender || '');
        setAddress(data?.address || '');
        setStateOfOrigin(data?.state_of_origin || '');
        setLga(data?.local_government || '');
        setMaritalStatus(data?.marital_status || '');
        setOccupation(data?.occupation || '');
        setNokName(data?.next_of_kin_name || '');
        setNokRelationship(data?.next_of_kin_relationship || '');
        setNokPhone(data?.next_of_kin_phone || '');
        setNokEmail(data?.next_of_kin_email || '');
        setNokAddress(data?.next_of_kin_address || '');

        if (data?.banking_details) {
          try {
            const parsed = JSON.parse(data.banking_details);
            setBank({
              bank_name: parsed.bank_name || '',
              account_number: parsed.account_number || '',
              account_name: parsed.account_name || '',
            });
          } catch {
            setBank(emptyBank);
          }
        } else {
          setBank(emptyBank);
        }
      } catch (error) {
        console.error('Error loading profile for registration form:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [open, user]);

  const isFullMode = completion < 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!bank.bank_name.trim() || !bank.account_number.trim() || !bank.account_name.trim()) {
      toast({
        title: 'Bank details required',
        description: 'Please provide your bank name, account number and account name so we can pay your commissions.',
        variant: 'destructive',
      });
      return;
    }

    if (isFullMode) {
      if (!firstName.trim() || !lastName.trim() || !phone.trim() || !address.trim()) {
        toast({
          title: 'Missing information',
          description: 'Please fill in your first name, last name, phone number and address.',
          variant: 'destructive',
        });
        return;
      }
      if (!nokName.trim() || !nokRelationship.trim() || !nokPhone.trim()) {
        toast({
          title: 'Next of Kin required',
          description: "Please provide your Next of Kin's name, relationship and phone number.",
          variant: 'destructive',
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const update: Record<string, any> = {
        banking_details: JSON.stringify(bank),
        current_package: selectedPackage.package_code,
        is_pbo: true,
        updated_at: new Date().toISOString(),
      };

      const now = new Date();
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      Object.assign(update, {
        registration_date: now.toISOString(),
        registration_expires_at: oneYearLater.toISOString(),
        renewal_reminder_sent_at: null,
      });

      if (isFullMode) {
        Object.assign(update, {
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          date_of_birth: dob || null,
          gender: gender || null,
          address,
          state_of_origin: stateOfOrigin || null,
          local_government: lga || null,
          marital_status: maritalStatus || null,
          occupation: occupation || null,
          next_of_kin_name: nokName,
          next_of_kin_relationship: nokRelationship,
          next_of_kin_phone: nokPhone,
          next_of_kin_email: nokEmail || null,
          next_of_kin_address: nokAddress || null,
        });
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', user.id);
      if (updateError) throw updateError;

      // Record a zero-cost registration for bookkeeping, consistent with the
      // existing free-upgrade flow elsewhere on this page. plan_type must be
      // one of the values allowed by the payments table's check constraint
      // ('outright' | '1-3' | '4-6' | '7-12' | 'daily' | 'weekly' | 'monthly')
      // — the package tier itself (associate/gold/classic_gold) isn't a
      // valid plan_type, so it's encoded in property_id instead. Passing the
      // package code directly here was the second bug behind "does not
      // submit": even once the schema-cache error was resolved, this insert
      // would still have failed a check constraint violation.
      await supabase.from('payments').insert({
        user_id: user.id,
        property_id: `bh-realtors-${selectedPackage.package_code}`,
        plan_type: 'outright',
        months: 0,
        principal_amount: selectedPackage.price,
        interest_percent: 0,
        interest_amount: 0,
        total_amount: 0,
        amount_paid: 0,
        balance: 0,
        status: 'completed',
      });

      await refreshProfile();
      setExpiryDate(oneYearLater);
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Realtors registration error:', error);
      toast({
        title: 'Registration failed',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    setShowSuccess(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && (showSuccess ? handleContinue() : onClose())}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <PartyPopper className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Congratulations!</h2>
            <p className="text-slate-700 mb-1">
              Thank you for registering with BHRealtors on the <span className="font-semibold">{selectedPackage.package_name}</span> package — at no cost to you.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Your registration is valid for 1 year
              {expiryDate && (
                <> and will expire on <span className="font-semibold text-slate-700">{expiryDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></>
              )}
              . We'll remind you to renew a month before it expires.
            </p>
            <Button onClick={handleContinue} className="bg-estate-blue hover:bg-estate-darkBlue px-8">
              Continue
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-estate-blue">
                <ShieldCheck className="h-5 w-5" /> Realtors Registration Form
              </DialogTitle>
              <DialogDescription>
                {loadingProfile
                  ? 'Loading your details…'
                  : isFullMode
                    ? `Complete the form below to register on the ${selectedPackage.package_name} package — free of charge.`
                    : `We already have your personal details on file. Just add your bank account details to complete your ${selectedPackage.package_name} registration — free of charge.`}
              </DialogDescription>
            </DialogHeader>

            {loadingProfile ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-estate-blue" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isFullMode && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" /> Your details on file
                </p>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                  <p><span className="text-slate-400">Name:</span> {firstName} {lastName}</p>
                  <p><span className="text-slate-400">Phone:</span> {phone}</p>
                  <p className="sm:col-span-2"><span className="text-slate-400">Address:</span> {address}</p>
                  <p><span className="text-slate-400">Next of Kin:</span> {nokName} ({nokRelationship})</p>
                  <p><span className="text-slate-400">NOK Phone:</span> {nokPhone}</p>
                </div>
              </div>
            )}

            {isFullMode && (
              <>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" /> Basic Personal Details
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rf-first">First Name *</Label>
                      <Input id="rf-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="rf-last">Last Name *</Label>
                      <Input id="rf-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="rf-phone">Phone Number *</Label>
                      <Input id="rf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="rf-dob">Date of Birth</Label>
                      <Input id="rf-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="rf-gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger id="rf-gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rf-marital">Marital Status</Label>
                      <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                        <SelectTrigger id="rf-marital"><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="rf-address">Address *</Label>
                      <Input id="rf-address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="rf-state">State of Origin</Label>
                      <Input id="rf-state" value={stateOfOrigin} onChange={(e) => setStateOfOrigin(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="rf-lga">Local Government</Label>
                      <Input id="rf-lga" value={lga} onChange={(e) => setLga(e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="rf-occupation">Occupation</Label>
                      <Input id="rf-occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Next of Kin
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rf-nok-name">Full Name *</Label>
                      <Input id="rf-nok-name" value={nokName} onChange={(e) => setNokName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="rf-nok-rel">Relationship *</Label>
                      <Input id="rf-nok-rel" value={nokRelationship} onChange={(e) => setNokRelationship(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="rf-nok-phone">Phone Number *</Label>
                      <Input id="rf-nok-phone" value={nokPhone} onChange={(e) => setNokPhone(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="rf-nok-email">Email</Label>
                      <Input id="rf-nok-email" type="email" value={nokEmail} onChange={(e) => setNokEmail(e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="rf-nok-address">Address</Label>
                      <Input id="rf-nok-address" value={nokAddress} onChange={(e) => setNokAddress(e.target.value)} />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Landmark className="h-4 w-4" /> Bank Account Details <span className="font-normal text-slate-400">(for commission payments)</span>
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="rf-bank-name">Bank Name *</Label>
                  <Input
                    id="rf-bank-name"
                    value={bank.bank_name}
                    onChange={(e) => setBank((b) => ({ ...b, bank_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rf-bank-acct-no">Account Number *</Label>
                  <Input
                    id="rf-bank-acct-no"
                    value={bank.account_number}
                    onChange={(e) => setBank((b) => ({ ...b, account_number: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rf-bank-acct-name">Account Name *</Label>
                  <Input
                    id="rf-bank-acct-name"
                    value={bank.account_name}
                    onChange={(e) => setBank((b) => ({ ...b, account_name: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-estate-blue hover:bg-estate-darkBlue">
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</span>
              ) : (
                `Submit and Complete Registration with ₦0`
              )}
            </Button>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RealtorsRegistrationForm;
