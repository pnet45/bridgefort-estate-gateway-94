import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, UserRound, BriefcaseBusiness, ShieldCheck, UsersRound } from 'lucide-react';

const ProfileForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '', maritalStatus: '', spouseName: '', nationality: '',
    phoneNumber: '', stateOfOrigin: '', localGovernment: '', address: '', currentResidence: '', languagesSpoken: '',
    occupation: '', employerName: '', employerAddress: '',
    nextOfKinName: '', nextOfKinRelationship: '', nextOfKinAddress: '', nextOfKinPhone: '', nextOfKinEmail: '',
    idType: '', idNumber: '', idExpiry: '', sourceOfFunds: '', annualIncomeBracket: '', taxId: '', nin: '',
    bankUsed: '', accountNumber: '', accountName: '', employmentStatus: '', employerCountry: '',
    isForeigner: false, residencePermit: '', visaStatus: '', amlRiskRating: '', amlNotes: '',
  });

  const update = (field: string, value: string | boolean) => setFormData((prev) => ({ ...prev, [field]: value }));
  const completion = useMemo(() => {
    const fields = [formData.firstName, formData.lastName, formData.phoneNumber, formData.dateOfBirth, formData.gender, formData.address, formData.occupation, formData.employerName, formData.nextOfKinName, formData.nextOfKinPhone, formData.nextOfKinEmail, formData.idType, formData.idNumber, formData.sourceOfFunds, formData.nin, formData.bankUsed, formData.accountNumber, formData.accountName];
    return Math.round(fields.filter(Boolean).length / fields.length * 100);
  }, [formData]);

  useEffect(() => {
    const load = async () => {
      if (!user) { setInitialLoading(false); return; }
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (error) throw error;
        if (data) {
          setFormData({
            firstName: data.first_name || '', lastName: data.last_name || '', dateOfBirth: data.date_of_birth || '', gender: data.gender || '', maritalStatus: data.marital_status || '', spouseName: data.spouse_name || '', nationality: data.nationality || '',
            phoneNumber: data.phone_number || '', stateOfOrigin: data.state_of_origin || '', localGovernment: data.local_government || '', address: data.address || '', currentResidence: data.current_residence || '', languagesSpoken: Array.isArray(data.languages_spoken) ? data.languages_spoken.join(', ') : data.languages_spoken || '',
            occupation: data.occupation || '', employerName: data.employer_name || '', employerAddress: data.employer_address || '',
            nextOfKinName: data.next_of_kin_name || '', nextOfKinRelationship: data.next_of_kin_relationship || '', nextOfKinAddress: data.next_of_kin_address || '', nextOfKinPhone: data.next_of_kin_phone || '', nextOfKinEmail: data.next_of_kin_email || '',
            idType: data.id_type || '', idNumber: data.id_number || '', idExpiry: data.id_expiry || '', sourceOfFunds: data.source_of_income || '', annualIncomeBracket: '', taxId: '', nin: '',
            bankUsed: '', accountNumber: '', accountName: '', employmentStatus: data.employment_status || '', employerCountry: data.employer_country || '',
            isForeigner: Boolean(data.is_foreigner), residencePermit: data.residence_permit || '', visaStatus: data.visa_status || '', amlRiskRating: data.aml_risk_rating || '', amlNotes: data.aml_notes || '',
          });
        }
      } catch (error) { console.error('Error loading profile:', error); toast({ title: 'Could not load profile', description: 'Please try again.', variant: 'destructive' }); }
      finally { setInitialLoading(false); }
    };
    load();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const languages = formData.languagesSpoken.split(',').map((v) => v.trim()).filter(Boolean);
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, first_name: formData.firstName, last_name: formData.lastName, date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null, marital_status: formData.maritalStatus || null, spouse_name: formData.spouseName || null,
        nationality: formData.nationality || null, languages_spoken: languages, phone_number: formData.phoneNumber || null,
        state_of_origin: formData.stateOfOrigin || null, local_government: formData.localGovernment || null, address: formData.address || null,
        current_residence: formData.currentResidence || null, occupation: formData.occupation || null, employer_name: formData.employerName || null,
        employer_address: formData.employerAddress || null, employment_status: formData.employmentStatus || null, employer_country: formData.employerCountry || null,
        next_of_kin_name: formData.nextOfKinName || null, next_of_kin_relationship: formData.nextOfKinRelationship || null, next_of_kin_address: formData.nextOfKinAddress || null,
        next_of_kin_phone: formData.nextOfKinPhone || null, next_of_kin_email: formData.nextOfKinEmail || null,
        id_type: formData.idType || null, id_number: formData.idNumber || null, id_expiry: formData.idExpiry || null,
        source_of_income: formData.sourceOfFunds || null, monthly_income: null, banking_details: formData.bankUsed ? `${formData.bankUsed} - ${formData.accountNumber} - ${formData.accountName}` : null,
        is_foreigner: formData.isForeigner, residence_permit: formData.residencePermit || null, visa_status: formData.visaStatus || null,
        aml_risk_rating: formData.amlRiskRating || null, aml_notes: formData.amlNotes || null,
        profile_completed: completion >= 50, profile_completion_percentage: completion, updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      if (error) throw error;
      toast({ title: 'Profile saved successfully', description: `Your profile is ${completion}% complete.` });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({ title: 'Could not save profile', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  if (initialLoading) return <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin" /></div>;

  const tabs = [
    { key: 'personal', label: 'Personal', icon: UserRound },
    { key: 'employment', label: 'Employment', icon: BriefcaseBusiness },
    { key: 'kin', label: 'Next of Kin', icon: UsersRound },
    { key: 'compliance', label: 'Compliance', icon: ShieldCheck },
  ];
  const Field = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => <div className="space-y-2"><Label>{label}</Label><Input type={type} value={(formData as any)[field]} onChange={(e) => update(field, e.target.value)} placeholder={placeholder} /></div>;

  return <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl space-y-4 px-2 sm:px-4">
    <Card><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Complete Your Profile</CardTitle><div className="text-sm font-semibold text-primary">{completion}% complete</div></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} /></div></CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{tabs.map(({ key, label: tabLabel, icon: Icon }) => <Button key={key} type="button" variant={activeTab === key ? 'default' : 'outline'} onClick={() => setActiveTab(key)} className="h-11"><Icon className="mr-2 h-4 w-4" />{tabLabel}</Button>)}</div>
        {activeTab === 'personal' && <div className="grid gap-4 sm:grid-cols-2"><Field label="First Name *" field="firstName" /><Field label="Last Name *" field="lastName" /><Field label="Date of Birth" field="dateOfBirth" type="date" /><Field label="Gender" field="gender" /><Field label="Marital Status" field="maritalStatus" /><Field label="Spouse Name" field="spouseName" /><Field label="Nationality" field="nationality" /><Field label="Phone Number *" field="phoneNumber" /><Field label="State of Origin" field="stateOfOrigin" /><Field label="Local Government" field="localGovernment" /><Field label="Languages Spoken" field="languagesSpoken" placeholder="English, Yoruba" /><div className="space-y-2 sm:col-span-2"><Label>Address</Label><Textarea value={formData.address} onChange={(e) => update('address', e.target.value)} /></div><div className="space-y-2 sm:col-span-2"><Label>Current Residence</Label><Textarea value={formData.currentResidence} onChange={(e) => update('currentResidence', e.target.value)} /></div></div>}
        {activeTab === 'employment' && <div className="grid gap-4 sm:grid-cols-2"><Field label="Occupation" field="occupation" /><Field label="Employer / Business Name" field="employerName" /><Field label="Employment Status" field="employmentStatus" /><Field label="Employer Country" field="employerCountry" /><div className="space-y-2 sm:col-span-2"><Label>Employer Address</Label><Textarea value={formData.employerAddress} onChange={(e) => update('employerAddress', e.target.value)} /></div></div>}
        {activeTab === 'kin' && <div className="grid gap-4 sm:grid-cols-2"><Field label="Next of Kin Name" field="nextOfKinName" /><Field label="Relationship" field="nextOfKinRelationship" /><Field label="Phone" field="nextOfKinPhone" /><Field label="Email" field="nextOfKinEmail" type="email" /><div className="space-y-2 sm:col-span-2"><Label>Address</Label><Textarea value={formData.nextOfKinAddress} onChange={(e) => update('nextOfKinAddress', e.target.value)} /></div></div>}
        {activeTab === 'compliance' && <div className="grid gap-4 sm:grid-cols-2"><Field label="ID Type" field="idType" /><Field label="ID Number" field="idNumber" /><Field label="ID Expiry" field="idExpiry" type="date" /><Field label="Source of Funds" field="sourceOfFunds" /><Field label="Annual Income Bracket" field="annualIncomeBracket" /><Field label="Tax ID" field="taxId" /><Field label="NIN" field="nin" /><Field label="Bank Used" field="bankUsed" /><Field label="Account Number" field="accountNumber" /><Field label="Account Name" field="accountName" /><Field label="AML Risk Rating" field="amlRiskRating" /><div className="space-y-2 sm:col-span-2"><Label>AML Notes</Label><Textarea value={formData.amlNotes} onChange={(e) => update('amlNotes', e.target.value)} /></div></div>}
        <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Profile</Button></div>
      </CardContent>
    </Card>
  </form>;
};

export default ProfileForm;
