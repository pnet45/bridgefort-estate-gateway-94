import React, { useState, useRef } from 'react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReCaptcha from '@/components/ui/ReCaptcha';

const ProfileForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);
  
  const [kycDocs, setKycDocs] = useState<{[key: string]: { url: string; name: string; type: string }}>({});

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
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
    roleStatus: '',
    businessNature: '',
    
    // Next of Kin
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinAddress: '',
    nextOfKinPhone: '',
    nextOfKinEmail: '',
    
    // Corporate Details (if applicable)
    isRepresentative: false,
    companyName: '',
    companyRegistrationNo: '',
    companyEmail: '',
    companyCountry: '',
    companyAddress: '',
    companyNature: '',
    dateOfIncorporation: '',
    salesStatus: ''
  });

  const [amlData, setAmlData] = useState({
    // Identity Verification
    idType: '',
    idNumber: '',
    countryOfIssue: '',
    dateOfIssue: '',
    idExpiry: '',
    issuingAuthority: '',
    
    // Financial Details
    sourceOfFunds: '',
    annualIncomeBracket: '',
    taxId: '',
    nin: '',
    
    // AML/CFT Risk Assessment
    isPoliticallyExposed: false,
    politicalExposureDetails: '',
    hasFinancialCrimesInvestigation: false,
    financialCrimesDetails: '',
    
    // Banking Details
    bankUsed: '',
    accountNumber: '',
    accountName: '',
    
    // Employment Status
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

  const steps = [
    { key: "personal", label: "Personal Info" },
    { key: "employment", label: "Employment" },
    { key: "kyc", label: "KYC Documents" },
    { key: "aml", label: "Compliance & AML" },
    { key: "review", label: "Review & Submit" },
  ];

  const canProceed = {
    personal: !!formData.firstName && !!formData.lastName && !!formData.dateOfBirth && !!formData.gender && !!formData.phoneNumber && !!formData.nextOfKinName && !!formData.nextOfKinPhone && !!formData.nextOfKinEmail,
    employment: !!formData.occupation && !!formData.employerName,
    kyc: !!amlData.idType && !!amlData.idNumber && !!amlData.countryOfIssue && !!amlData.dateOfIssue && !!amlData.idExpiry && !!amlData.issuingAuthority,
    aml: !!amlData.sourceOfFunds && !!amlData.annualIncomeBracket && !!amlData.taxId && !!amlData.nin && !!amlData.bankUsed && !!amlData.accountNumber && !!amlData.accountName,
    review: true,
  };

  const getCurrentStepIndex = () => steps.findIndex(step => step.key === activeTab);
  
  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1].key);
    }
  };
  
  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1].key);
    }
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

  const verifyRecaptcha = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token }
      });
      
      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!recaptchaToken) {
      toast({
        title: "reCAPTCHA Required",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Verify reCAPTCHA first
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        toast({
          title: "reCAPTCHA Failed",
          description: "Please complete the reCAPTCHA verification again",
          variant: "destructive"
        });
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        return;
      }
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

  const languages = ['English', 'Yoruba', 'Igbo', 'Efik', 'Hausa','Pidgin', 'French'];

  const NavigationButtons = ({ stepKey }: { stepKey: string }) => {
    const currentIndex = getCurrentStepIndex();
    const isFirstStep = currentIndex === 0;
    const isLastStep = currentIndex === steps.length - 1;
    const canProceedFromCurrent = canProceed[stepKey as keyof typeof canProceed];

    return (
      <div className="flex justify-between mt-6 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        
        {!isLastStep ? (
          <Button
            type="button"
            onClick={goToNextStep}
            disabled={!canProceedFromCurrent}
            className="flex items-center gap-2 bg-estate-blue hover:bg-estate-darkBlue"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={loading || !termsAccepted || !recaptchaToken}
            className="bg-estate-blue hover:bg-estate-darkBlue"
          >
            {loading ? 'Submitting...' : 'Submit Profile & KYC'}
          </Button>
        )}
      </div>
    );
  };

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

            <TabsContent value="personal" className="space-y-6 max-h-96 overflow-y-auto">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> In line with national regulations, kindly provide accurate data as requested herein. 
                  If the subscriber is a minor or buying for a minor, the parent/guardian must serve as the NOK and complete an attached form.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>

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

                {/* Next of Kin Section */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold mb-4">Next of Kin Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinName">Next of Kin Name *</Label>
                      <Input
                        id="nextOfKinName"
                        value={formData.nextOfKinName}
                        onChange={(e) => handleInputChange('nextOfKinName', e.target.value)}
                        placeholder="Enter next of kin name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinRelationship">Relationship *</Label>
                      <Select value={formData.nextOfKinRelationship} onValueChange={(value) => handleInputChange('nextOfKinRelationship', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinPhone">Next of Kin Phone *</Label>
                      <Input
                        id="nextOfKinPhone"
                        value={formData.nextOfKinPhone}
                        onChange={(e) => handleInputChange('nextOfKinPhone', e.target.value)}
                        placeholder="Enter next of kin phone"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinEmail">Next of Kin Email *</Label>
                      <Input
                        id="nextOfKinEmail"
                        type="email"
                        value={formData.nextOfKinEmail}
                        onChange={(e) => handleInputChange('nextOfKinEmail', e.target.value)}
                        placeholder="Enter next of kin email"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nextOfKinAddress">Next of Kin Address *</Label>
                      <Textarea
                        id="nextOfKinAddress"
                        value={formData.nextOfKinAddress}
                        onChange={(e) => handleInputChange('nextOfKinAddress', e.target.value)}
                        placeholder="Enter next of kin address"
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <NavigationButtons stepKey="personal" />
            </TabsContent>

            <TabsContent value="employment" className="space-y-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Work/Employment Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="Enter your occupation"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerName">Employer/Business Name/Address *</Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                    placeholder="Enter your employer's name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleStatus">Role/Status *</Label>
                  <Input
                    id="roleStatus"
                    value={formData.roleStatus}
                    onChange={(e) => handleInputChange('roleStatus', e.target.value)}
                    placeholder="Your role or status in the organization"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessNature">Nature of Business/Industry *</Label>
                  <Input
                    id="businessNature"
                    value={formData.businessNature}
                    onChange={(e) => handleInputChange('businessNature', e.target.value)}
                    placeholder="Industry or business nature"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="employerAddress">Address of Employer *</Label>
                  <Textarea
                    id="employerAddress"
                    value={formData.employerAddress}
                    onChange={(e) => handleInputChange('employerAddress', e.target.value)}
                    placeholder="Enter your employer's complete address"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Corporate/Company Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">For Organization or Company Representative</h4>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRepresentative"
                    checked={formData.isRepresentative}
                    onCheckedChange={(checked) => handleInputChange('isRepresentative', checked ? 'true' : 'false')}
                  />
                  <Label htmlFor="isRepresentative">I am a company representative for corporate entity</Label>
                </div>

                {formData.isRepresentative && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-2">
                      <Label htmlFor="companyRegistrationNo">Registration No. *</Label>
                      <Input
                        id="companyRegistrationNo"
                        value={formData.companyRegistrationNo}
                        onChange={(e) => handleInputChange('companyRegistrationNo', e.target.value)}
                        placeholder="Company registration number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Company Email Address *</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={formData.companyEmail}
                        onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                        placeholder="Company email address"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyCountry">Country of Incorporation *</Label>
                      <Input
                        id="companyCountry"
                        value={formData.companyCountry}
                        onChange={(e) => handleInputChange('companyCountry', e.target.value)}
                        placeholder="Country where company is incorporated"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company's Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Full company name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfIncorporation">Date of Incorporation *</Label>
                      <Input
                        id="dateOfIncorporation"
                        type="date"
                        value={formData.dateOfIncorporation}
                        onChange={(e) => handleInputChange('dateOfIncorporation', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesStatus">Sales Status *</Label>
                      <Select value={formData.salesStatus} onValueChange={(value) => handleInputChange('salesStatus', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sales status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="companyAddress">Company's Address *</Label>
                      <Textarea
                        id="companyAddress"
                        value={formData.companyAddress}
                        onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                        placeholder="Complete company address"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="companyNature">Nature of Business *</Label>
                      <Input
                        id="companyNature"
                        value={formData.companyNature}
                        onChange={(e) => handleInputChange('companyNature', e.target.value)}
                        placeholder="Describe the company's business nature"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
              <NavigationButtons stepKey="employment" />
            </TabsContent>

            <TabsContent value="kyc" className="space-y-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Identity Verification</h3>
              
              {/* Upload Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Upload Recent Passport Photo *</h4>
                <KYCUploadField
                  label="Recent Passport Photograph"
                  bucket="kyc-documents"
                  userId={user.id}
                  docKey="passport_photo"
                  existingUrl={kycDocs["passport_photo"]?.url}
                  onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, passport_photo: { url, name, type } }))}
                />

                <h4 className="font-medium">Valid Identity * (Choose one to upload)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    label="NIN Slip"
                    bucket="kyc-documents"
                    userId={user.id}
                    docKey="nin_slip"
                    existingUrl={kycDocs["nin_slip"]?.url}
                    onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, nin_slip: { url, name, type } }))}
                  />
                  <KYCUploadField
                    label="Voter's Card"
                    bucket="kyc-documents"
                    userId={user.id}
                    docKey="voters_card"
                    existingUrl={kycDocs["voters_card"]?.url}
                    onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, voters_card: { url, name, type } }))}
                  />
                  <KYCUploadField
                    label="Driver's License"
                    bucket="kyc-documents"
                    userId={user.id}
                    docKey="drivers_license"
                    existingUrl={kycDocs["drivers_license"]?.url}
                    onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, drivers_license: { url, name, type } }))}
                  />
                  <KYCUploadField
                    label="Work/Resident Permit"
                    bucket="kyc-documents"
                    userId={user.id}
                    docKey="work_permit"
                    existingUrl={kycDocs["work_permit"]?.url}
                    onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, work_permit: { url, name, type } }))}
                  />
                </div>

                <h4 className="font-medium">Proof of Address * (upload recent copy NOT older than 3 months)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <KYCUploadField
                    label="Utility Bill"
                    bucket="kyc-documents"
                    userId={user.id}
                    docKey="utility_bill"
                    existingUrl={kycDocs["utility_bill"]?.url}
                    onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, utility_bill: { url, name, type } }))}
                  />
                  <KYCUploadField
                    label="Electricity Bill"
                    bucket="kyc-documents"
                    userId={user.id}
                    docKey="electricity_bill"
                    existingUrl={kycDocs["electricity_bill"]?.url}
                    onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, electricity_bill: { url, name, type } }))}
                  />
                  <KYCUploadField
                    label="Waste Management Bill"
                    bucket="kyc-documents"
                    userId={user.id}
                    docKey="waste_bill"
                    existingUrl={kycDocs["waste_bill"]?.url}
                    onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, waste_bill: { url, name, type } }))}
                  />
                  <KYCUploadField
                    label="Other Proof of Address"
                    bucket="kyc-documents"
                    userId={user.id}
                    docKey="other_address_proof"
                    existingUrl={kycDocs["other_address_proof"]?.url}
                    onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, other_address_proof: { url, name, type } }))}
                  />
                </div>
              </div>

              {/* ID Details Section */}
              <div className="space-y-4">
                <h4 className="font-medium">ID Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idType">ID Type Provided *</Label>
                    <Select value={amlData.idType} onValueChange={(value) => handleAmlInput("idType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="international_passport">International Passport</SelectItem>
                        <SelectItem value="national_id">National ID Card</SelectItem>
                        <SelectItem value="nin_slip">NIN Slip</SelectItem>
                        <SelectItem value="voters_card">Voter's Card</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                        <SelectItem value="work_permit">Work Permit</SelectItem>
                        <SelectItem value="resident_permit">Resident Permit</SelectItem>
                        <SelectItem value="other">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number *</Label>
                    <Input 
                      id="idNumber" 
                      value={amlData.idNumber} 
                      onChange={e => handleAmlInput("idNumber", e.target.value)} 
                      placeholder="Document Number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="countryOfIssue">Country of Issue *</Label>
                    <Input 
                      id="countryOfIssue" 
                      value={amlData.countryOfIssue} 
                      onChange={e => handleAmlInput("countryOfIssue", e.target.value)} 
                      placeholder="Country that issued the ID"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfIssue">Date of Issue *</Label>
                    <Input 
                      type="date" 
                      id="dateOfIssue" 
                      value={amlData.dateOfIssue} 
                      onChange={e => handleAmlInput("dateOfIssue", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idExpiry">Expiry Date *</Label>
                    <Input 
                      type="date" 
                      id="idExpiry" 
                      value={amlData.idExpiry} 
                      onChange={e => handleAmlInput("idExpiry", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
                    <Input 
                      id="issuingAuthority" 
                      value={amlData.issuingAuthority} 
                      onChange={e => handleAmlInput("issuingAuthority", e.target.value)} 
                      placeholder="Authority that issued the document"
                      required
                    />
                  </div>
                </div>
              </div>
              <NavigationButtons stepKey="kyc" />
            </TabsContent>

            <TabsContent value="aml" className="space-y-6 max-h-96 overflow-y-auto">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> In line with national regulations, kindly provide accurate data as requested herein.
                </p>
              </div>

              {/* Financial Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceOfFunds">Source of Funds for Purchase *</Label>
                    <Select value={amlData.sourceOfFunds} onValueChange={(value) => handleAmlInput("sourceOfFunds", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source of funds" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="business_income">Business Income</SelectItem>
                        <SelectItem value="gift">Gift</SelectItem>
                        <SelectItem value="bank_loan">Bank Loan</SelectItem>
                        <SelectItem value="other_loan">Other Loan</SelectItem>
                        <SelectItem value="inheritance">Inheritance</SelectItem>
                        <SelectItem value="investment_return">Investment Return</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualIncomeBracket">Estimated Annual Income Bracket *</Label>
                    <Select value={amlData.annualIncomeBracket} onValueChange={(value) => handleAmlInput("annualIncomeBracket", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select income bracket" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below_1m">Below ₦1M</SelectItem>
                        <SelectItem value="1m_5m">₦1M - ₦5M</SelectItem>
                        <SelectItem value="6m_20m">₦6M - ₦20M</SelectItem>
                        <SelectItem value="above_20m">Above ₦20M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID. No. (TIN) *</Label>
                    <Input 
                      id="taxId" 
                      value={amlData.taxId} 
                      onChange={e => handleAmlInput("taxId", e.target.value)} 
                      placeholder="Enter your Tax Identification Number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nin">National Identity Number (NIN) *</Label>
                    <Input 
                      id="nin" 
                      value={amlData.nin} 
                      onChange={e => handleAmlInput("nin", e.target.value)} 
                      placeholder="Enter your NIN"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* AML/CFT Risk Assessment Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AML/CFT & Risk Assessment</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">1. Are you or any owner/director (for corporate firms) a Politically Exposed Person? *</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pepYes"
                          checked={amlData.isPoliticallyExposed === true}
                          onCheckedChange={(checked) => handleAmlInput("isPoliticallyExposed", checked)}
                        />
                        <Label htmlFor="pepYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pepNo"
                          checked={amlData.isPoliticallyExposed === false}
                          onCheckedChange={(checked) => handleAmlInput("isPoliticallyExposed", !checked)}
                        />
                        <Label htmlFor="pepNo">No</Label>
                      </div>
                    </div>
                    
                    {amlData.isPoliticallyExposed && (
                      <div className="space-y-2">
                        <Label htmlFor="politicalExposureDetails">If 'YES', Specify:</Label>
                        <Textarea
                          id="politicalExposureDetails"
                          value={amlData.politicalExposureDetails}
                          onChange={e => handleAmlInput("politicalExposureDetails", e.target.value)}
                          placeholder="Please provide details of political exposure"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">2. Have you or your immediate family or owner/director been investigated for financial crimes? *</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="crimeYes"
                          checked={amlData.hasFinancialCrimesInvestigation === true}
                          onCheckedChange={(checked) => handleAmlInput("hasFinancialCrimesInvestigation", checked)}
                        />
                        <Label htmlFor="crimeYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="crimeNo"
                          checked={amlData.hasFinancialCrimesInvestigation === false}
                          onCheckedChange={(checked) => handleAmlInput("hasFinancialCrimesInvestigation", !checked)}
                        />
                        <Label htmlFor="crimeNo">No</Label>
                      </div>
                    </div>
                    
                    {amlData.hasFinancialCrimesInvestigation && (
                      <div className="space-y-2">
                        <Label htmlFor="financialCrimesDetails">If 'YES', explain:</Label>
                        <Textarea
                          id="financialCrimesDetails"
                          value={amlData.financialCrimesDetails}
                          onChange={e => handleAmlInput("financialCrimesDetails", e.target.value)}
                          placeholder="Please provide details of the investigation"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Banking Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Banking Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankUsed">Bank Used for Funds Transfer *</Label>
                    <Input 
                      id="bankUsed" 
                      value={amlData.bankUsed} 
                      onChange={e => handleAmlInput("bankUsed", e.target.value)} 
                      placeholder="Name of your bank"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account No *</Label>
                    <Input 
                      id="accountNumber" 
                      value={amlData.accountNumber} 
                      onChange={e => handleAmlInput("accountNumber", e.target.value)} 
                      placeholder="Your account number"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="accountName">Account Name *</Label>
                    <Input 
                      id="accountName" 
                      value={amlData.accountName} 
                      onChange={e => handleAmlInput("accountName", e.target.value)} 
                      placeholder="Account holder name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Foreign National Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Additional Information</h4>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Are you a foreign national?</Label>
                  <Select value={amlData.isForeigner ? "yes" : "no"} onValueChange={value => handleAmlInput("isForeigner", value === "yes")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {amlData.isForeigner && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="residencePermit">Residence Permit Details</Label>
                      <Input 
                        id="residencePermit" 
                        value={amlData.residencePermit} 
                        onChange={e => handleAmlInput("residencePermit", e.target.value)}
                        placeholder="Residence permit information"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visaStatus">Visa Status</Label>
                      <Input 
                        id="visaStatus" 
                        value={amlData.visaStatus} 
                        onChange={e => handleAmlInput("visaStatus", e.target.value)}
                        placeholder="Current visa status"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <NavigationButtons stepKey="aml" />
            </TabsContent>

            <TabsContent value="review" className="space-y-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Review Your Information</h3>
                <p className="text-muted-foreground">
                  Please review all the information you've entered before submitting.
                </p>
                
                {/* Personal Information Review */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-estate-blue">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">First Name:</span> {formData.firstName || 'Not provided'}</div>
                    <div><span className="font-medium">Last Name:</span> {formData.lastName || 'Not provided'}</div>
                    <div><span className="font-medium">Date of Birth:</span> {formData.dateOfBirth || 'Not provided'}</div>
                    <div><span className="font-medium">Gender:</span> {formData.gender || 'Not provided'}</div>
                    <div><span className="font-medium">Marital Status:</span> {formData.maritalStatus || 'Not provided'}</div>
                    {formData.spouseName && <div><span className="font-medium">Spouse Name:</span> {formData.spouseName}</div>}
                    <div><span className="font-medium">Nationality:</span> {formData.nationality || 'Not provided'}</div>
                    <div><span className="font-medium">Phone Number:</span> {formData.phoneNumber || 'Not provided'}</div>
                    <div><span className="font-medium">State of Origin:</span> {formData.stateOfOrigin || 'Not provided'}</div>
                    <div><span className="font-medium">Local Government:</span> {formData.localGovernment || 'Not provided'}</div>
                    <div className="md:col-span-2"><span className="font-medium">Languages Spoken:</span> {formData.languagesSpoken.join(', ') || 'Not provided'}</div>
                    <div className="md:col-span-2"><span className="font-medium">Address:</span> {formData.address || 'Not provided'}</div>
                    <div className="md:col-span-2"><span className="font-medium">Current Residence:</span> {formData.currentResidence || 'Not provided'}</div>
                  </div>
                </div>

                {/* Next of Kin Review */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-estate-blue">Next of Kin Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Name:</span> {formData.nextOfKinName || 'Not provided'}</div>
                    <div><span className="font-medium">Relationship:</span> {formData.nextOfKinRelationship || 'Not provided'}</div>
                    <div><span className="font-medium">Phone:</span> {formData.nextOfKinPhone || 'Not provided'}</div>
                    <div><span className="font-medium">Email:</span> {formData.nextOfKinEmail || 'Not provided'}</div>
                    <div className="md:col-span-2"><span className="font-medium">Address:</span> {formData.nextOfKinAddress || 'Not provided'}</div>
                  </div>
                </div>

                {/* Employment Information Review */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-estate-blue">Employment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Occupation:</span> {formData.occupation || 'Not provided'}</div>
                    <div><span className="font-medium">Employer Name:</span> {formData.employerName || 'Not provided'}</div>
                    <div><span className="font-medium">Role/Status:</span> {formData.roleStatus || 'Not provided'}</div>
                    <div><span className="font-medium">Business Nature:</span> {formData.businessNature || 'Not provided'}</div>
                    <div className="md:col-span-2"><span className="font-medium">Employer Address:</span> {formData.employerAddress || 'Not provided'}</div>
                  </div>

                  {formData.isRepresentative && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <h5 className="font-medium mb-2">Corporate Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div><span className="font-medium">Company Name:</span> {formData.companyName || 'Not provided'}</div>
                        <div><span className="font-medium">Registration No:</span> {formData.companyRegistrationNo || 'Not provided'}</div>
                        <div><span className="font-medium">Company Email:</span> {formData.companyEmail || 'Not provided'}</div>
                        <div><span className="font-medium">Country:</span> {formData.companyCountry || 'Not provided'}</div>
                        <div><span className="font-medium">Date of Incorporation:</span> {formData.dateOfIncorporation || 'Not provided'}</div>
                        <div><span className="font-medium">Sales Status:</span> {formData.salesStatus || 'Not provided'}</div>
                        <div className="md:col-span-2"><span className="font-medium">Company Address:</span> {formData.companyAddress || 'Not provided'}</div>
                        <div className="md:col-span-2"><span className="font-medium">Business Nature:</span> {formData.companyNature || 'Not provided'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Identity Verification Review */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-estate-blue">Identity Verification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">ID Type:</span> {amlData.idType || 'Not provided'}</div>
                    <div><span className="font-medium">ID Number:</span> {amlData.idNumber || 'Not provided'}</div>
                    <div><span className="font-medium">Country of Issue:</span> {amlData.countryOfIssue || 'Not provided'}</div>
                    <div><span className="font-medium">Date of Issue:</span> {amlData.dateOfIssue || 'Not provided'}</div>
                    <div><span className="font-medium">Expiry Date:</span> {amlData.idExpiry || 'Not provided'}</div>
                    <div><span className="font-medium">Issuing Authority:</span> {amlData.issuingAuthority || 'Not provided'}</div>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="font-medium mb-2">Uploaded Documents:</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(kycDocs).map(([key, doc]) => (
                        doc?.url && (
                          <div key={key} className="p-2 bg-green-50 border border-green-200 rounded">
                            <span className="text-green-700 font-medium">{key.replace('_', ' ').toUpperCase()}</span>
                            <div className="text-green-600">✓ Uploaded</div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                {/* Financial Details Review */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-estate-blue">Financial Details & AML/CFT</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Source of Funds:</span> {amlData.sourceOfFunds || 'Not provided'}</div>
                    <div><span className="font-medium">Annual Income Bracket:</span> {amlData.annualIncomeBracket || 'Not provided'}</div>
                    <div><span className="font-medium">Tax ID (TIN):</span> {amlData.taxId || 'Not provided'}</div>
                    <div><span className="font-medium">NIN:</span> {amlData.nin || 'Not provided'}</div>
                    <div><span className="font-medium">Bank Used:</span> {amlData.bankUsed || 'Not provided'}</div>
                    <div><span className="font-medium">Account Number:</span> {amlData.accountNumber || 'Not provided'}</div>
                    <div className="md:col-span-2"><span className="font-medium">Account Name:</span> {amlData.accountName || 'Not provided'}</div>
                    <div><span className="font-medium">Politically Exposed:</span> {amlData.isPoliticallyExposed ? 'Yes' : 'No'}</div>
                    <div><span className="font-medium">Financial Crimes Investigation:</span> {amlData.hasFinancialCrimesInvestigation ? 'Yes' : 'No'}</div>
                    <div><span className="font-medium">Foreign National:</span> {amlData.isForeigner ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                {/* Corporate Documents Note for Companies */}
                {formData.isRepresentative && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Required Corporate Documents:</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>1. Representative Passport Photograph</li>
                      <li>2. Representative Valid ID</li>
                      <li>3. Company's Utility Bill</li>
                      <li>4. Certificate of Incorporation/Business Name</li>
                      <li>5. CAC Status Report (Form-07)</li>
                      <li>6. Proof of Payment</li>
                      <li>7. Accompanying Board Resolution/Letter (Where applicable)</li>
                    </ul>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I accept the terms and conditions and certify that all information provided is accurate *
                  </Label>
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  <ReCaptcha
                    ref={recaptchaRef}
                    onChange={(token) => setRecaptchaToken(token)}
                    onExpired={() => setRecaptchaToken(null)}
                    onError={() => setRecaptchaToken(null)}
                  />
                </div>
                
                <NavigationButtons stepKey="review" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;
