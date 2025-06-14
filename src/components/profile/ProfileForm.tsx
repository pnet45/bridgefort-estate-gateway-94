
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import KYCUploadField from './KYCUploadField';

const ProfileForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Information
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    spouseName: '',
    nationality: '',
    languagesSpoken: [] as string[],
    phoneNumber: '',
    stateOfOrigin: '',
    localGovernment: '',
    address: '',
    currentResidence: '',
    
    // Employment Details
    occupation: '',
    employerName: '',
    employerAddress: '',
    
    // Next of Kin
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinAddress: '',
    nextOfKinPhone: '',
    nextOfKinEmail: ''
  });

  const [kycDocs, setKycDocs] = useState<{[key: string]: { url: string; name: string; type: string }}>({});
  // New step flow config
  const steps = [
    { key: "personal", label: "Personal Info" },
    { key: "employment", label: "Employment" },
    { key: "kyc", label: "KYC Documents" },
    { key: "aml", label: "Compliance & AML" },
    { key: "review", label: "Review & Submit" },
  ];

  // Add new form fields for KYC/Compliance
  const [amlData, setAmlData] = useState({
    idType: '',
    idNumber: '',
    idExpiry: '',
    employmentStatus: '',
    employerCountry: '',
    sourceOfIncome: '',
    monthlyIncome: '',
    bankingDetails: '',
    isForeigner: false,
    residencePermit: '',
    visaStatus: '',
    amlRiskRating: '',
    amlNotes: '',
  });

  // Simple multi-step validation (crude for brevity)
  const canProceed = {
    personal: !!formData.dateOfBirth && !!formData.gender && !!formData.phoneNumber,
    employment: true,
    kyc: ["passport", "national_id", "utility"].every(doc => !!kycDocs[doc]?.url),
    aml: !!amlData.idType && !!amlData.idNumber,
    review: true,
  };

  const firstInvalidStep = steps.find(step => !canProceed[step.key as keyof typeof canProceed])?.key;

  const handleAmlInput = (field: string, value: string | boolean) => {
    setAmlData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languagesSpoken: checked 
        ? [...prev.languagesSpoken, language]
        : prev.languagesSpoken.filter(lang => lang !== language)
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          marital_status: formData.maritalStatus,
          spouse_name: formData.spouseName,
          nationality: formData.nationality,
          languages_spoken: formData.languagesSpoken,
          phone_number: formData.phoneNumber,
          state_of_origin: formData.stateOfOrigin,
          local_government: formData.localGovernment,
          address: formData.address,
          current_residence: formData.currentResidence,
          occupation: formData.occupation,
          employer_name: formData.employerName,
          employer_address: formData.employerAddress,
          next_of_kin_name: formData.nextOfKinName,
          next_of_kin_relationship: formData.nextOfKinRelationship,
          next_of_kin_address: formData.nextOfKinAddress,
          next_of_kin_phone: formData.nextOfKinPhone,
          next_of_kin_email: formData.nextOfKinEmail,
          kyc_docs: kycDocs,
          id_type: amlData.idType,
          id_number: amlData.idNumber,
          id_expiry: amlData.idExpiry,
          employment_status: amlData.employmentStatus,
          employer_country: amlData.employerCountry,
          source_of_income: amlData.sourceOfIncome,
          monthly_income: amlData.monthlyIncome,
          banking_details: amlData.bankingDetails,
          is_foreigner: amlData.isForeigner,
          residence_permit: amlData.residencePermit,
          visa_status: amlData.visaStatus,
          aml_risk_rating: amlData.amlRiskRating,
          aml_notes: amlData.amlNotes,
          terms_accepted: termsAccepted,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile & KYC were saved successfully!"
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const languages = ['English', 'Yoruba', 'Igbo', 'Efik', 'Hausa', 'French'];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <p className="text-center text-muted-foreground">
            Please fill out the following KYC & AML information to verify your account.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {steps.map(s => (
                <TabsTrigger
                  key={s.key}
                  value={s.key}
                  disabled={firstInvalidStep && steps.findIndex(st => st.key === s.key) > steps.findIndex(st => st.key === firstInvalidStep)}
                >
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Step 1: Personal Info */}
            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status *</Label>
                  <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange('maritalStatus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.maritalStatus === 'married' && (
                  <div className="space-y-2">
                    <Label htmlFor="spouseName">Name of Spouse</Label>
                    <Input
                      id="spouseName"
                      value={formData.spouseName}
                      onChange={(e) => handleInputChange('spouseName', e.target.value)}
                      placeholder="Enter spouse's name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    placeholder="Enter your nationality"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Language(s) Spoken *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={language}
                          checked={formData.languagesSpoken.includes(language)}
                          onCheckedChange={(checked) => handleLanguageChange(language, !!checked)}
                        />
                        <Label htmlFor={language}>{language}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stateOfOrigin">State of Origin</Label>
                  <Input
                    id="stateOfOrigin"
                    value={formData.stateOfOrigin}
                    onChange={(e) => handleInputChange('stateOfOrigin', e.target.value)}
                    placeholder="Enter your state of origin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localGovernment">Local Government</Label>
                  <Input
                    id="localGovernment"
                    value={formData.localGovernment}
                    onChange={(e) => handleInputChange('localGovernment', e.target.value)}
                    placeholder="Enter your local government"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="currentResidence">Current Place of Residence</Label>
                  <Textarea
                    id="currentResidence"
                    value={formData.currentResidence}
                    onChange={(e) => handleInputChange('currentResidence', e.target.value)}
                    placeholder="Enter your current place of residence"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Step 2: Employment */}
            <TabsContent value="employment" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="Enter your occupation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerName">Name of Employer</Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                    placeholder="Enter your employer's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerAddress">Address of Employer</Label>
                  <Textarea
                    id="employerAddress"
                    value={formData.employerAddress}
                    onChange={(e) => handleInputChange('employerAddress', e.target.value)}
                    placeholder="Enter your employer's address"
                    rows={3}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Input
                    id="employmentStatus"
                    value={amlData.employmentStatus}
                    onChange={e => handleAmlInput('employmentStatus', e.target.value)}
                    placeholder="Employed, Self-employed, Unemployed, Student, Retired"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sourceOfIncome">Source of Income</Label>
                  <Input
                    id="sourceOfIncome"
                    value={amlData.sourceOfIncome}
                    onChange={e => handleAmlInput('sourceOfIncome', e.target.value)}
                    placeholder="e.g. Salary, Business, Pension"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Estimated Monthly Income (₦)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={amlData.monthlyIncome}
                    onChange={e => handleAmlInput('monthlyIncome', e.target.value)}
                    placeholder="e.g. 500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankingDetails">Banking Details</Label>
                  <Input
                    id="bankingDetails"
                    value={amlData.bankingDetails}
                    onChange={e => handleAmlInput('bankingDetails', e.target.value)}
                    placeholder="Account number or details"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Step 3: KYC Documents */}
            <TabsContent value="kyc" className="space-y-6">
              <div className="space-y-2">
                <KYCUploadField
                  label="International Passport"
                  bucket="kyc-documents"
                  userId={user.id}
                  docKey="passport"
                  existingUrl={kycDocs["passport"]?.url}
                  onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, passport: { url, name, type } }))}
                />
                <KYCUploadField
                  label="National ID Card"
                  bucket="kyc-documents"
                  userId={user.id}
                  docKey="national_id"
                  existingUrl={kycDocs["national_id"]?.url}
                  onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, national_id: { url, name, type } }))}
                />
                <KYCUploadField
                  label="Proof of Address (Utility Bill)"
                  bucket="kyc-documents"
                  userId={user.id}
                  docKey="utility"
                  existingUrl={kycDocs["utility"]?.url}
                  onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, utility: { url, name, type } }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idType">ID Type Provided</Label>
                <Input id="idType" value={amlData.idType} onChange={e => handleAmlInput("idType", e.target.value)} placeholder="e.g. Passport" />
                <Label htmlFor="idNumber">ID Number</Label>
                <Input id="idNumber" value={amlData.idNumber} onChange={e => handleAmlInput("idNumber", e.target.value)} placeholder="Document Number" />
                <Label htmlFor="idExpiry">ID Expiry Date</Label>
                <Input type="date" id="idExpiry" value={amlData.idExpiry} onChange={e => handleAmlInput("idExpiry", e.target.value)} />
              </div>
            </TabsContent>

            {/* Step 4: Compliance & AML */}
            <TabsContent value="aml" className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Are you a foreign national?</label>
                <select value={amlData.isForeigner ? "yes" : "no"} onChange={e => handleAmlInput("isForeigner", e.target.value === "yes")}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              {amlData.isForeigner && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="residencePermit">Residence Permit Details</Label>
                    <Input id="residencePermit" value={amlData.residencePermit} onChange={e => handleAmlInput("residencePermit", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visaStatus">Visa Status</Label>
                    <Input id="visaStatus" value={amlData.visaStatus} onChange={e => handleAmlInput("visaStatus", e.target.value)} />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="amlRiskRating">AML Risk Assessment</Label>
                <Input id="amlRiskRating" value={amlData.amlRiskRating} onChange={e => handleAmlInput("amlRiskRating", e.target.value)} placeholder="Low, Medium, High" />
                <Label htmlFor="amlNotes">AML Remarks/Notes</Label>
                <Input id="amlNotes" value={amlData.amlNotes} onChange={e => handleAmlInput("amlNotes", e.target.value)} placeholder="Risk notes or compliance comments" />
              </div>
            </TabsContent>

            {/* Step 5: Review & Submit */}
            <TabsContent value="review" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review Your Information</h3>
                <p className="text-muted-foreground">
                  Please review all the information you've entered before submitting.
                </p>
                
                <div className="space-y-2 bg-blue-100 p-3 rounded">
                  <pre className="text-xs">{JSON.stringify({ ...formData, amlData, kycDocs }, null, 2)}</pre>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I accept the terms and conditions *
                  </Label>
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={loading || !termsAccepted}
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                >
                  {loading ? 'Submitting...' : 'Submit Profile & KYC'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;

