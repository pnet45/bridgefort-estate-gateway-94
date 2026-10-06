import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { notifyProfileUpdated } from '@/lib/profileEvents';
import { ChevronLeft, ChevronRight, Check, Loader2, Save, ShieldCheck } from 'lucide-react';
import KYCUploadField from './KYCUploadField';

const steps = [
  { key: 'personal', label: 'Personal', description: 'Your basic information' },
  { key: 'identity', label: 'Identity', description: 'Identification & KYC' },
  { key: 'employment', label: 'Employment', description: 'Work & organisation' },
  { key: 'financial', label: 'Financial', description: 'Income & banking' },
  { key: 'aml', label: 'AML / CFT', description: 'Compliance information' },
  { key: 'referrer', label: 'Referrer', description: 'Referral information' },
  { key: 'review', label: 'Review', description: 'Confirm & submit' },
] as const;

type StepKey = typeof steps[number]['key'];
type FormState = Record<string, any>;

const initialForm: FormState = {
  firstName: '', lastName: '', dateOfBirth: '', gender: '', maritalStatus: '', spouseName: '', nationality: '', languagesSpoken: [], phoneNumber: '', stateOfOrigin: '', localGovernment: '', address: '', currentResidence: '',
  occupation: '', employerName: '', employerAddress: '', employmentStatus: '', employerCountry: '', employmentRole: '', natureOfBusiness: '',
  isOrganization: false, companyName: '', companyAddress: '', companyRegistrationNumber: '', incorporationCountry: '', incorporationDate: '', natureOfCorporateBusiness: '', salesStatus: '',
  nextOfKinName: '', nextOfKinRelationship: '', nextOfKinAddress: '', nextOfKinPhone: '', nextOfKinEmail: '',
  sourceOfIncome: '', annualIncome: '', tinNumber: '', ninNumber: '', bankName: '', accountNumber: '', accountName: '', isForeigner: false, residencePermit: '', visaStatus: '',
  isPoliticallyExposed: false, politicalExposureDetails: '', hasFinancialCrimesHistory: false, financialCrimesDetails: '', referrerName: '', referrerPhone: '', referrerEmail: '',
  idType: '', idNumber: '', idCountryOfIssue: '', idDateOfIssue: '', idExpiry: '', idIssuingAuthority: '',
};

const incomeValue = (value: string) => ({ 'Below ₦1M': 500000, '₦1M - ₦5M': 3000000, '₦6M - ₦20M': 13000000, 'Above ₦20M': 25000000 }[value] ?? null);

const NewProfileForm = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [kycDocs, setKycDocs] = useState<Record<string, { url: string; name: string; type: string }>>({});
  const [activeStep, setActiveStep] = useState<StepKey>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedStep, setSavedStep] = useState<StepKey | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const index = steps.findIndex(s => s.key === activeStep);
  const isLast = index === steps.length - 1;
  const progress = Math.round(((index + 1) / steps.length) * 100);
  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (error) throw error;
        if (data) {
          const banking = (data.banking_details || '').split(' - ');
          setForm(prev => ({ ...prev,
            firstName: data.first_name || '', lastName: data.last_name || '', dateOfBirth: data.date_of_birth || '', gender: data.gender || '', maritalStatus: data.marital_status || '', spouseName: data.spouse_name || '', nationality: data.nationality || '', languagesSpoken: data.languages_spoken || [], phoneNumber: data.phone_number || '', stateOfOrigin: data.state_of_origin || '', localGovernment: data.local_government || '', address: data.address || '', currentResidence: data.current_residence || '',
            occupation: data.occupation || '', employerName: data.employer_name || '', employerAddress: data.employer_address || '', employmentStatus: data.employment_status || '', employerCountry: data.employer_country || '', employmentRole: data.employment_role || '', natureOfBusiness: data.nature_of_business || '', isOrganization: !!data.is_organization, companyName: data.company_name || '', companyAddress: data.company_address || '', companyRegistrationNumber: data.company_registration_number || '', incorporationCountry: data.incorporation_country || '', incorporationDate: data.incorporation_date || '', natureOfCorporateBusiness: data.nature_of_corporate_business || '', salesStatus: data.sales_status || '',
            nextOfKinName: data.next_of_kin_name || '', nextOfKinRelationship: data.next_of_kin_relationship || '', nextOfKinAddress: data.next_of_kin_address || '', nextOfKinPhone: data.next_of_kin_phone || '', nextOfKinEmail: data.next_of_kin_email || '', sourceOfIncome: data.source_of_income || '', bankName: banking[0] || '', accountNumber: banking[1] || '', accountName: banking.slice(2).join(' - ') || '', isForeigner: !!data.is_foreigner, residencePermit: data.residence_permit || '', visaStatus: data.visa_status || '', isPoliticallyExposed: !!data.is_politically_exposed, politicalExposureDetails: data.political_exposure_details || '', hasFinancialCrimesHistory: !!data.has_financial_crimes_history, financialCrimesDetails: data.financial_crimes_details || '', referrerName: data.referrer_name || '', referrerPhone: data.referrer_phone || '', referrerEmail: data.referrer_email || '', idType: data.id_type || '', idNumber: data.id_number || '', idCountryOfIssue: data.id_country_of_issue || '', idDateOfIssue: data.id_date_of_issue || '', idExpiry: data.id_expiry || '', idIssuingAuthority: data.id_issuing_authority || '', annualIncome: data.monthly_income ? (data.monthly_income <= 500000 ? 'Below ₦1M' : data.monthly_income <= 5000000 ? '₦1M - ₦5M' : data.monthly_income <= 20000000 ? '₦6M - ₦20M' : 'Above ₦20M') : '',
          }));
          setKycDocs((data.kyc_docs as any) || {}); setTermsAccepted(!!data.terms_accepted);
        }
      } catch (error) { console.error('Profile load error:', error); toast({ title: 'Could not load profile', description: 'Please refresh and try again.', variant: 'destructive' }); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const payload = useMemo(() => ({
    id: user?.id || '', first_name: form.firstName || null, last_name: form.lastName || null, date_of_birth: form.dateOfBirth || null, gender: form.gender || null, marital_status: form.maritalStatus || null, spouse_name: form.spouseName || null, nationality: form.nationality || null, languages_spoken: form.languagesSpoken || [], phone_number: form.phoneNumber || null, state_of_origin: form.stateOfOrigin || null, local_government: form.localGovernment || null, address: form.address || null, current_residence: form.currentResidence || null,
    occupation: form.occupation || null, employer_name: form.employerName || null, employer_address: form.employerAddress || null, employment_status: form.employmentStatus || null, employer_country: form.employerCountry || null, employment_role: form.employmentRole || null, nature_of_business: form.natureOfBusiness || null, is_organization: !!form.isOrganization, company_name: form.companyName || null, company_address: form.companyAddress || null, company_registration_number: form.companyRegistrationNumber || null, incorporation_country: form.incorporationCountry || null, incorporation_date: form.incorporationDate || null, nature_of_corporate_business: form.natureOfCorporateBusiness || null, sales_status: form.salesStatus || null,
    next_of_kin_name: form.nextOfKinName || null, next_of_kin_relationship: form.nextOfKinRelationship || null, next_of_kin_address: form.nextOfKinAddress || null, next_of_kin_phone: form.nextOfKinPhone || null, next_of_kin_email: form.nextOfKinEmail || null, source_of_income: form.sourceOfIncome || null, monthly_income: incomeValue(form.annualIncome), banking_details: form.bankName ? `${form.bankName} - ${form.accountNumber} - ${form.accountName}` : null, is_foreigner: !!form.isForeigner, residence_permit: form.residencePermit || null, visa_status: form.visaStatus || null, is_politically_exposed: !!form.isPoliticallyExposed, political_exposure_details: form.politicalExposureDetails || null, has_financial_crimes_history: !!form.hasFinancialCrimesHistory, financial_crimes_details: form.financialCrimesDetails || null, referrer_name: form.referrerName || null, referrer_phone: form.referrerPhone || null, referrer_email: form.referrerEmail || null, id_type: form.idType || null, id_number: form.idNumber || null, id_country_of_issue: form.idCountryOfIssue || null, id_date_of_issue: form.idDateOfIssue || null, id_expiry: form.idExpiry || null, id_issuing_authority: form.idIssuingAuthority || null, kyc_docs: kycDocs, profile_picture_url: kycDocs.passport_photo?.url || null, terms_accepted: termsAccepted, profile_status: 'IN_PROGRESS', updated_at: new Date().toISOString(),
  }), [form, kycDocs, termsAccepted, user?.id]);

  const validateStep = (step: StepKey) => {
    const required: Record<StepKey, string[]> = { personal: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber'], identity: ['idType', 'idNumber'], employment: ['occupation'], financial: ['sourceOfIncome', 'annualIncome'], aml: [], referrer: [], review: [] };
    const missing = required[step].filter(key => !String(form[key] ?? '').trim());
    if (missing.length) { toast({ title: 'Complete this section', description: 'Please provide all required fields before continuing.', variant: 'destructive' }); return false; }
    if (step === 'review' && !termsAccepted) { toast({ title: 'Terms required', description: 'Please accept the declaration before submitting your profile.', variant: 'destructive' }); return false; }
    return true;
  };

  const resolveReferralBeforeSave = useCallback(async () => {
    const code = String(form.referrerCode || '').trim().toUpperCase();
    if (!code) { setReferralLookup(null); return null; }
    if (referralLookup && referralLookup.realtor_id && String(form.referrerCode || '').trim().toUpperCase() === code) return referralLookup.realtor_id;
    setReferralLookupLoading(true);
    try {
      const { data, error } = await supabase.rpc('lookup_bhrealtor_referral' as any, { _code: code });
      if (error) throw error;
      const match = Array.isArray(data) ? data[0] : data;
      if (!match) throw new Error('That referral code does not belong to an active BHRealtor.');
      setReferralLookup(match);
      return match.realtor_id as string;
    } catch (error: any) {
      toast({ title: 'Invalid Realtor referral code', description: error?.message || 'Verify the code before saving.', variant: 'destructive' });
      return null;
    } finally {
      setReferralLookupLoading(false);
    }
  }, [form.referrerCode, referralLookup]);
  const saveCurrentStep = async () => {
    if (!user || saving || !validateStep(activeStep)) return;
    setSaving(true); setSavedStep(null);
    try {
      const referralId = activeStep === 'referrer' || form.referrerCode ? await resolveReferralBeforeSave() : referralLookup?.realtor_id || null;
      if (form.referrerCode && !referralId) { setSaving(false); return; }
      const { error } = await supabase.from('profiles').upsert({ ...payload, id: user.id, referred_by_id: referralId, referred_by_code: form.referrerCode ? String(form.referrerCode).trim().toUpperCase() : null }, { onConflict: 'id' });
      if (error) throw error;
      setSavedStep(activeStep); notifyProfileUpdated(); toast({ title: 'Saved successfully', description: `${steps[index].label} information has been saved.` });
      if (!isLast) setActiveStep(steps[index + 1].key);
    } catch (error: any) { console.error('Profile save error:', error); toast({ title: 'Save failed', description: error?.message || 'Your information was not saved. Please try again.', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const submitProfile = async () => {
    if (!termsAccepted || !user || saving || !validateStep('review')) return;
    setSaving(true);
    try { const referralId = form.referrerCode ? await resolveReferralBeforeSave() : referralLookup?.realtor_id || null; if (form.referrerCode && !referralId) { setSaving(false); return; } const { error } = await supabase.from('profiles').upsert({ ...payload, id: user.id, referred_by_id: referralId, referred_by_code: form.referrerCode ? String(form.referrerCode).trim().toUpperCase() : null, profile_status: 'IN_PROGRESS', terms_accepted: true }, { onConflict: 'id' }); if (error) throw error; notifyProfileUpdated(); toast({ title: 'Profile submitted', description: 'Your profile and KYC information have been securely saved.' }); }
    catch (error: any) { console.error('Profile submission error:', error); toast({ title: 'Submission failed', description: error?.message || 'Please try again.', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const Field = ({ label, name, type = 'text', placeholder, required = false }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) => <div className="space-y-2"><Label htmlFor={name}>{label}{required && <span className="text-destructive"> *</span>}</Label><Input id={name} type={type} value={form[name] || ''} placeholder={placeholder} onChange={e => update(name, e.target.value)} className="h-11" /></div>;
  const SelectField = ({ label, name, options, required = false }: { label: string; name: string; options: string[]; required?: boolean }) => <div className="space-y-2"><Label htmlFor={name}>{label}{required && <span className="text-destructive"> *</span>}</Label><select id={name} value={form[name] || ''} onChange={e => update(name, e.target.value)} className="h-11 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select {label}</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select></div>;
  const TextAreaField = ({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) => <div className="space-y-2 md:col-span-2"><Label htmlFor={name}>{label}</Label><Textarea id={name} value={form[name] || ''} placeholder={placeholder} onChange={e => update(name, e.target.value)} rows={3} /></div>;

  const section = () => {
    switch (activeStep) {
      case 'personal': return <div className="grid gap-5 md:grid-cols-2"><Field label="First name" name="firstName" required /><Field label="Last name" name="lastName" required /><Field label="Date of birth" name="dateOfBirth" type="date" required /><SelectField label="Gender" name="gender" options={['Male', 'Female', 'Other']} required /><SelectField label="Marital status" name="maritalStatus" options={['Single', 'Married', 'Divorced', 'Widowed']} /><Field label="Spouse name" name="spouseName" /><Field label="Nationality" name="nationality" /><Field label="Phone number" name="phoneNumber" required /><Field label="State of origin" name="stateOfOrigin" /><Field label="Local government" name="localGovernment" /><TextAreaField label="Residential address" name="address" /><TextAreaField label="Current residence" name="currentResidence" /></div>;
      case 'identity': return <div className="grid gap-5 md:grid-cols-2"><SelectField label="ID type" name="idType" options={['International Passport', 'National ID Card', 'NIN Slip', "Voter's Card", "Driver's Licence", 'Work Permit', 'Resident Permit', 'Others']} required /><Field label="ID number" name="idNumber" required /><Field label="Country of issue" name="idCountryOfIssue" /><Field label="Date of issue" name="idDateOfIssue" type="date" /><Field label="Expiry date" name="idExpiry" type="date" /><Field label="Issuing authority" name="idIssuingAuthority" /><div className="md:col-span-2 grid gap-4 md:grid-cols-2"><KYCUploadField label="Passport photograph" bucket="kyc-documents" userId={user?.id || ''} docKey="passport_photo" existingUrl={kycDocs.passport_photo?.url} onUploaded={(url, name, type) => setKycDocs(p => ({ ...p, passport_photo: { url, name, type } }))} /><KYCUploadField label="Identification document" bucket="kyc-documents" userId={user?.id || ''} docKey="identity_document" existingUrl={kycDocs.identity_document?.url} onUploaded={(url, name, type) => setKycDocs(p => ({ ...p, identity_document: { url, name, type } }))} /></div></div>;
      case 'employment': return <div className="grid gap-5 md:grid-cols-2"><Field label="Occupation" name="occupation" required /><SelectField label="Employment status" name="employmentStatus" options={['Employed', 'Self-employed', 'Business owner', 'Student', 'Retired', 'Unemployed']} /><Field label="Employer / business name" name="employerName" /><Field label="Role / position" name="employmentRole" /><Field label="Employer country" name="employerCountry" /><TextAreaField label="Employer / business address" name="employerAddress" /><TextAreaField label="Nature of business" name="natureOfBusiness" /><div className="md:col-span-2 flex items-center gap-3 rounded-lg border p-4"><Checkbox checked={!!form.isOrganization} onCheckedChange={v => update('isOrganization', !!v)} /><Label>Buying / registering as an organisation</Label></div>{form.isOrganization && <><Field label="Company name" name="companyName" /><Field label="Company registration number" name="companyRegistrationNumber" /><TextAreaField label="Company address" name="companyAddress" /><Field label="Country of incorporation" name="incorporationCountry" /><Field label="Date of incorporation" name="incorporationDate" type="date" /><TextAreaField label="Nature of corporate business" name="natureOfCorporateBusiness" /><Field label="Sales status" name="salesStatus" /></>}<div className="md:col-span-2 border-t pt-5"><h3 className="font-semibold mb-4">Next of kin</h3><div className="grid gap-5 md:grid-cols-2"><Field label="Full name" name="nextOfKinName" /><Field label="Relationship" name="nextOfKinRelationship" /><Field label="Phone" name="nextOfKinPhone" /><Field label="Email" name="nextOfKinEmail" /><TextAreaField label="Address" name="nextOfKinAddress" /></div></div></div>;
      case 'financial': return <div className="grid gap-5 md:grid-cols-2"><SelectField label="Source of income / funds" name="sourceOfIncome" options={['Salary', 'Business Income', 'Gift', 'Bank Loan', 'Other Loan', 'Inheritance', 'Investment Return', 'Others']} required /><SelectField label="Annual income range" name="annualIncome" options={['Below ₦1M', '₦1M - ₦5M', '₦6M - ₦20M', 'Above ₦20M']} required /><Field label="TIN number" name="tinNumber" /><Field label="NIN number" name="ninNumber" /><Field label="Bank name" name="bankName" /><Field label="Account number" name="accountNumber" /><Field label="Account name" name="accountName" /><div className="md:col-span-2 flex items-center gap-3 rounded-lg border p-4"><Checkbox checked={!!form.isForeigner} onCheckedChange={v => update('isForeigner', !!v)} /><Label>I am a foreign national</Label></div>{form.isForeigner && <><Field label="Residence permit" name="residencePermit" /><Field label="Visa status" name="visaStatus" /></>}</div>;
      case 'aml': return <div className="space-y-5"><div className="rounded-xl border p-5 space-y-4"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /><div><h3 className="font-semibold">AML / CFT declaration</h3><p className="text-sm text-muted-foreground">Provide accurate compliance information.</p></div></div><div className="flex items-center gap-3"><Checkbox checked={!!form.isPoliticallyExposed} onCheckedChange={v => update('isPoliticallyExposed', !!v)} /><Label>I am a politically exposed person (PEP)</Label></div>{form.isPoliticallyExposed && <TextAreaField label="PEP details" name="politicalExposureDetails" placeholder="Provide relevant position, country and relationship details." />}<div className="flex items-center gap-3"><Checkbox checked={!!form.hasFinancialCrimesHistory} onCheckedChange={v => update('hasFinancialCrimesHistory', !!v)} /><Label>I have a financial crimes history</Label></div>{form.hasFinancialCrimesHistory && <TextAreaField label="Financial crimes details" name="financialCrimesDetails" />}</div></div>;
      case 'referrer': return <div className="grid gap-5 md:grid-cols-2"><Field label="Referrer name" name="referrerName" /><Field label="Referrer phone" name="referrerPhone" /><Field label="Referrer email" name="referrerEmail" /></div>;
      case 'review': return <div className="space-y-5"><div className="rounded-xl bg-muted/50 p-5"><h3 className="font-semibold mb-4">Profile summary</h3><div className="grid gap-3 md:grid-cols-2 text-sm"><p><span className="text-muted-foreground">Name:</span> {form.firstName} {form.lastName}</p><p><span className="text-muted-foreground">Phone:</span> {form.phoneNumber || '—'}</p><p><span className="text-muted-foreground">Occupation:</span> {form.occupation || '—'}</p><p><span className="text-muted-foreground">ID:</span> {form.idType ? `${form.idType} • ${form.idNumber}` : '—'}</p><p><span className="text-muted-foreground">Income:</span> {form.annualIncome || '—'}</p><p><span className="text-muted-foreground">Source:</span> {form.sourceOfIncome || '—'}</p></div></div><div className="flex items-start gap-3 rounded-xl border p-5"><Checkbox id="terms" checked={termsAccepted} onCheckedChange={v => setTermsAccepted(!!v)} /><Label htmlFor="terms" className="leading-6">I confirm that the information supplied is accurate and complete, and I agree to Bridgefort's applicable subscription, KYC and compliance requirements.</Label></div></div>;
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto p-6"><Card><CardContent className="py-16 flex items-center justify-center gap-3"><Loader2 className="h-6 w-6 animate-spin" /> Loading your profile…</CardContent></Card></div>;
  return <div className="mx-auto max-w-5xl p-4 md:p-6"><Card className="overflow-hidden shadow-sm"><CardHeader className="border-b bg-muted/20 p-5 md:p-7"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><CardTitle className="text-xl md:text-2xl">Property Subscription / KYC Profile</CardTitle><p className="mt-1 text-sm text-muted-foreground">Save each section as you go. Your information is retained when you return later.</p></div><div className="text-right"><div className="text-2xl font-bold">{progress}%</div><div className="text-xs text-muted-foreground">Step {index + 1} of {steps.length}</div></div></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-estate-blue transition-all" style={{ width: `${progress}%` }} /></div><div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4 lg:grid-cols-7">{steps.map((s, i) => <button key={s.key} type="button" onClick={() => i <= index ? setActiveStep(s.key) : undefined} className={`rounded-lg px-2 py-2 text-left text-xs transition ${s.key === activeStep ? 'bg-estate-blue text-white' : i < index ? 'bg-muted text-foreground' : 'text-muted-foreground'} ${i <= index ? 'cursor-pointer' : 'cursor-default'}`}><div className="font-medium">{i + 1}. {s.label}</div><div className="hidden opacity-80 sm:block">{s.description}</div></button>)}</div></CardHeader><CardContent className="p-5 md:p-7"><div className="mb-6"><h2 className="text-lg font-semibold">{steps[index].label}</h2><p className="text-sm text-muted-foreground">{steps[index].description}</p></div>{section()}<div className="mt-8 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"><Button type="button" variant="outline" onClick={() => index > 0 && setActiveStep(steps[index - 1].key)} disabled={index === 0 || saving} className="h-11"> <ChevronLeft className="mr-2 h-4 w-4" />Previous</Button><div className="flex flex-col gap-2 sm:flex-row">{savedStep === activeStep && <div className="flex items-center justify-center gap-2 px-3 text-sm text-emerald-600"><Check className="h-4 w-4" />Saved</div>}{!isLast ? <Button type="button" onClick={saveCurrentStep} disabled={saving} className="h-11 min-w-52 bg-estate-blue hover:bg-estate-darkBlue text-white font-semibold shadow-sm"><Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save and Continue'}<ChevronRight className="ml-2 h-4 w-4" /></Button> : <Button type="button" onClick={submitProfile} disabled={saving || !termsAccepted} className="h-11 min-w-52 bg-estate-blue hover:bg-estate-darkBlue text-white font-semibold">{saving ? 'Submitting…' : 'Submit Profile & KYC'}</Button>}</div></div></CardContent></Card></div>;
};

export default NewProfileForm;
