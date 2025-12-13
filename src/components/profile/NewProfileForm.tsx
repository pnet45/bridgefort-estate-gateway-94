import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import KYCUploadField from './KYCUploadField';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ReCaptcha from '@/components/ui/ReCaptcha';

const NewProfileForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);

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
    email: '',
    stateOfOrigin: '',
    localGovernment: '',
    address: '',
    currentResidence: '',
    
    // Employment Details
    occupation: '',
    employerName: '',
    employerAddress: '',
    role: '',
    natureOfBusiness: '',
    
    // Corporate Information
    isOrganization: false,
    companyName: '',
    companyAddress: '',
    registrationNumber: '',
    incorporationCountry: '',
    incorporationDate: '',
    natureOfCorporateBusiness: '',
    salesStatus: '',
    
    // Next of Kin
    nextOfKinName: '',
    nextOfKinRelationship: '',
    nextOfKinAddress: '',
    nextOfKinPhone: '',
    nextOfKinEmail: '',
    
    // Financial Details
    sourceOfFunds: '',
    annualIncome: '',
    tinNumber: '',
    ninNumber: '',
    
    // Banking Details
    bankName: '',
    accountNumber: '',
    accountName: '',
    
    // AML/CFT
    isPoliticallyExposed: false,
    politicalExposureDetails: '',
    hasFinancialCrimes: false,
    financialCrimesDetails: '',
    
    // Referrer Information
    referrerName: '',
    referrerPhone: '',
    referrerEmail: ''
  });

  const [kycDocs, setKycDocs] = useState<{[key: string]: { url: string; name: string; type: string }}>({});

  const [idDetails, setIdDetails] = useState({
    idType: '',
    idNumber: '',
    countryOfIssue: '',
    dateOfIssue: '',
    expiryDate: '',
    issuingAuthority: ''
  });

  const steps = [
    { key: "personal", label: "Personal Info" },
    { key: "identity", label: "Identity Verification" },
    { key: "employment", label: "Employment" },
    { key: "financial", label: "Financial Details" },
    { key: "aml", label: "AML/CFT" },
    { key: "referrer", label: "Referrer Info" },
    { key: "review", label: "Review & Submit" },
  ];

  const canProceed = {
    personal: !!formData.firstName && !!formData.lastName && !!formData.dateOfBirth && !!formData.gender && !!formData.phoneNumber,
    identity: !!idDetails.idType && !!idDetails.idNumber && !!kycDocs.passport?.url && !!kycDocs.national_id?.url && !!kycDocs.utility?.url,
    employment: !!formData.occupation,
    financial: !!formData.sourceOfFunds && !!formData.annualIncome,
    aml: true,
    referrer: true,
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIdDetailsChange = (field: string, value: string) => {
    setIdDetails(prev => ({ ...prev, [field]: value }));
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
        .upsert({
          id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          marital_status: formData.maritalStatus,
          spouse_name: formData.spouseName || null,
          nationality: formData.nationality,
          languages_spoken: formData.languagesSpoken,
          phone_number: formData.phoneNumber,
          state_of_origin: formData.stateOfOrigin || null,
          local_government: formData.localGovernment || null,
          address: formData.address || null,
          current_residence: formData.currentResidence || null,
          occupation: formData.occupation,
          employer_name: formData.employerName,
          employer_address: formData.employerAddress || null,
          next_of_kin_name: formData.nextOfKinName,
          next_of_kin_relationship: formData.nextOfKinRelationship || null,
          next_of_kin_address: formData.nextOfKinAddress || null,
          next_of_kin_phone: formData.nextOfKinPhone,
          next_of_kin_email: formData.nextOfKinEmail,
          kyc_docs: kycDocs,
          id_type: idDetails.idType,
          id_number: idDetails.idNumber,
          id_expiry: idDetails.expiryDate || null,
          source_of_income: formData.sourceOfFunds || null,
          monthly_income: formData.annualIncome ? parseFloat(formData.annualIncome.replace(/[^\d.]/g, '')) : null,
          banking_details: formData.bankName ? `${formData.bankName} - ${formData.accountNumber} - ${formData.accountName}` : null,
          terms_accepted: termsAccepted,
          profile_completed: true,
          profile_completion_percentage: 100,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your comprehensive profile & KYC were saved successfully!"
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
  const idTypes = ['International Passport', 'National ID Card', 'NIN Slip', 'Voter\'s Card', 'Driver\'s Licence', 'Work Permit', 'Resident Permit', 'Others'];
  const sourceOfFundsOptions = ['Salary', 'Business Income', 'Gift', 'Bank Loan', 'Other Loan', 'Inheritance', 'Investment Return', 'Others'];
  const incomeRanges = ['Below ₦1M', '₦1M - ₦5M', '₦6M - ₦20M', 'Above ₦20M'];

  // Load existing profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        setInitialLoading(false);
        return;
      }
      
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData && !error) {
          // Parse banking details
          const bankingParts = profileData.banking_details?.split(' - ') || [];
          
          setFormData(prev => ({
            ...prev,
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            dateOfBirth: profileData.date_of_birth || '',
            gender: profileData.gender || '',
            maritalStatus: profileData.marital_status || '',
            spouseName: profileData.spouse_name || '',
            nationality: profileData.nationality || '',
            languagesSpoken: profileData.languages_spoken || [],
            phoneNumber: profileData.phone_number || '',
            stateOfOrigin: profileData.state_of_origin || '',
            localGovernment: profileData.local_government || '',
            address: profileData.address || '',
            currentResidence: profileData.current_residence || '',
            occupation: profileData.occupation || '',
            employerName: profileData.employer_name || '',
            employerAddress: profileData.employer_address || '',
            nextOfKinName: profileData.next_of_kin_name || '',
            nextOfKinRelationship: profileData.next_of_kin_relationship || '',
            nextOfKinAddress: profileData.next_of_kin_address || '',
            nextOfKinPhone: profileData.next_of_kin_phone || '',
            nextOfKinEmail: profileData.next_of_kin_email || '',
            sourceOfFunds: profileData.source_of_income || '',
            bankName: bankingParts[0] || '',
            accountNumber: bankingParts[1] || '',
            accountName: bankingParts[2] || ''
          }));

          setIdDetails(prev => ({
            ...prev,
            idType: profileData.id_type || '',
            idNumber: profileData.id_number || '',
            expiryDate: profileData.id_expiry || ''
          }));

          if (profileData.kyc_docs) {
            setKycDocs(profileData.kyc_docs as {[key: string]: { url: string; name: string; type: string }});
          }

          setTermsAccepted(profileData.terms_accepted || false);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

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

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-estate-blue" />
            <span className="ml-2 text-muted-foreground">Loading profile data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Property Subscription/KYC Form</CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            (In line with the national regulations, kindly provide accurate data as requested herein)
          </p>
          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
            <strong>Important Notice:</strong> If the subscriber is a minor or buying for a minor, the parent/guardian must serve as the NOK and complete an attached form.
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              {steps.map(s => (
                <TabsTrigger
                  key={s.key}
                  value={s.key}
                  className="text-xs"
                >
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[600px] w-full pr-4" style={{ scrollbarWidth: 'thin' }}>
              <TabsContent value="personal" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Languages Spoken *</Label>
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
                </div>
                <NavigationButtons stepKey="personal" />
              </TabsContent>

              <TabsContent value="identity" className="space-y-6 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-estate-blue mb-4">IDENTITY VERIFICATION</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium">Upload Recent Passport Photo *</Label>
                      <KYCUploadField
                        label=""
                        bucket="kyc-documents"
                        userId={user?.id || ''}
                        docKey="passport_photo"
                        existingUrl={kycDocs["passport_photo"]?.url}
                        onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, passport_photo: { url, name, type } }))}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Valid Identity * (choose one to upload)</Label>
                      <div className="grid grid-cols-1 gap-4 mt-2">
                        <KYCUploadField
                          label="International Passport"
                          bucket="kyc-documents"
                          userId={user?.id || ''}
                          docKey="passport"
                          existingUrl={kycDocs["passport"]?.url}
                          onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, passport: { url, name, type } }))}
                        />
                        <KYCUploadField
                          label="National ID Card"
                          bucket="kyc-documents"
                          userId={user?.id || ''}
                          docKey="national_id"
                          existingUrl={kycDocs["national_id"]?.url}
                          onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, national_id: { url, name, type } }))}
                        />
                        <KYCUploadField
                          label="NIN Slip"
                          bucket="kyc-documents"
                          userId={user?.id || ''}
                          docKey="nin_slip"
                          existingUrl={kycDocs["nin_slip"]?.url}
                          onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, nin_slip: { url, name, type } }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">ID Number *</Label>
                        <Input
                          id="idNumber"
                          value={idDetails.idNumber}
                          onChange={(e) => handleIdDetailsChange('idNumber', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="countryOfIssue">Country of Issue *</Label>
                        <Input
                          id="countryOfIssue"
                          value={idDetails.countryOfIssue}
                          onChange={(e) => handleIdDetailsChange('countryOfIssue', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfIssue">Date of Issue *</Label>
                        <Input
                          id="dateOfIssue"
                          type="date"
                          value={idDetails.dateOfIssue}
                          onChange={(e) => handleIdDetailsChange('dateOfIssue', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={idDetails.expiryDate}
                          onChange={(e) => handleIdDetailsChange('expiryDate', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Proof of Address * (upload a recent copy NOT older than 3 months)</Label>
                      <KYCUploadField
                        label="Utility Bill / Electricity Bill / Waste Management Bill"
                        bucket="kyc-documents"
                        userId={user?.id || ''}
                        docKey="utility"
                        existingUrl={kycDocs["utility"]?.url}
                        onUploaded={(url, name, type) => setKycDocs(prev => ({ ...prev, utility: { url, name, type } }))}
                      />
                    </div>
                  </div>
                </div>
                <NavigationButtons stepKey="identity" />
              </TabsContent>

              <TabsContent value="employment" className="space-y-6 mt-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-estate-blue mb-4">WORK/EMPLOYMENT DETAILS</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation *</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employerName">Employer/Business Name *</Label>
                      <Input
                        id="employerName"
                        value={formData.employerName}
                        onChange={(e) => handleInputChange('employerName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="employerAddress">Employer/Business Address *</Label>
                      <Textarea
                        id="employerAddress"
                        value={formData.employerAddress}
                        onChange={(e) => handleInputChange('employerAddress', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role/Status *</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="natureOfBusiness">Nature of Business/Industry *</Label>
                      <Input
                        id="natureOfBusiness"
                        value={formData.natureOfBusiness}
                        onChange={(e) => handleInputChange('natureOfBusiness', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="isOrganization"
                        checked={formData.isOrganization}
                        onCheckedChange={(checked) => handleInputChange('isOrganization', !!checked)}
                      />
                      <Label htmlFor="isOrganization">For Organization or Company?</Label>
                    </div>

                    {formData.isOrganization && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-lg">
                        <h4 className="font-semibold text-estate-blue md:col-span-2">Company Representative for Corporate Entity</h4>
                        
                        <div className="space-y-2">
                          <Label htmlFor="registrationNumber">Registration No. *</Label>
                          <Input
                            id="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company's Name *</Label>
                          <Input
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="companyAddress">Company's Address *</Label>
                          <Textarea
                            id="companyAddress"
                            value={formData.companyAddress}
                            onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <NavigationButtons stepKey="employment" />
              </TabsContent>

              <TabsContent value="financial" className="space-y-6 mt-6">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-estate-blue mb-4">FINANCIAL DETAILS</h3>
                  <p className="text-sm text-gray-600 mb-4">(In line with the national regulations, kindly provide accurate data as requested herein)</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sourceOfFunds">Source of Funds for Purchase *</Label>
                      <Select value={formData.sourceOfFunds} onValueChange={(value) => handleInputChange('sourceOfFunds', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source of funds" />
                        </SelectTrigger>
                        <SelectContent>
                          {sourceOfFundsOptions.map(source => (
                            <SelectItem key={source} value={source}>{source}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="annualIncome">Estimated Annual Income Bracket *</Label>
                      <Select value={formData.annualIncome} onValueChange={(value) => handleInputChange('annualIncome', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select income range" />
                        </SelectTrigger>
                        <SelectContent>
                          {incomeRanges.map(range => (
                            <SelectItem key={range} value={range}>{range}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tinNumber">Tax ID. No. (TIN) *</Label>
                      <Input
                        id="tinNumber"
                        value={formData.tinNumber}
                        onChange={(e) => handleInputChange('tinNumber', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ninNumber">National Identity Number (NIN) *</Label>
                      <Input
                        id="ninNumber"
                        value={formData.ninNumber}
                        onChange={(e) => handleInputChange('ninNumber', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-estate-blue mb-4">Banking Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Used for Funds Transfer *</Label>
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={(e) => handleInputChange('bankName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account No *</Label>
                        <Input
                          id="accountNumber"
                          value={formData.accountNumber}
                          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountName">Account Name *</Label>
                        <Input
                          id="accountName"
                          value={formData.accountName}
                          onChange={(e) => handleInputChange('accountName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <NavigationButtons stepKey="financial" />
              </TabsContent>

              <TabsContent value="aml" className="space-y-6 mt-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-estate-blue mb-4">AML/CFT & RISK ASSESSMENT</h3>
                  <p className="text-sm text-gray-600 mb-4">(In line with national regulations, kindly provide accurate data as requested herein)</p>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium">1. Are you or any owner/director (for corporate firms) a Politically Exposed Person? *</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pepYes"
                            checked={formData.isPoliticallyExposed}
                            onCheckedChange={(checked) => handleInputChange('isPoliticallyExposed', !!checked)}
                          />
                          <Label htmlFor="pepYes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pepNo"
                            checked={!formData.isPoliticallyExposed}
                            onCheckedChange={(checked) => handleInputChange('isPoliticallyExposed', !checked)}
                          />
                          <Label htmlFor="pepNo">No</Label>
                        </div>
                      </div>
                      {formData.isPoliticallyExposed && (
                        <div className="mt-4">
                          <Label htmlFor="politicalExposureDetails">If 'YES', Specify:</Label>
                          <Textarea
                            id="politicalExposureDetails"
                            value={formData.politicalExposureDetails}
                            onChange={(e) => handleInputChange('politicalExposureDetails', e.target.value)}
                            placeholder="Please provide details"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">2. Have you or your immediate family or owner/director been investigated for financial crimes? *</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="crimesYes"
                            checked={formData.hasFinancialCrimes}
                            onCheckedChange={(checked) => handleInputChange('hasFinancialCrimes', !!checked)}
                          />
                          <Label htmlFor="crimesYes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="crimesNo"
                            checked={!formData.hasFinancialCrimes}
                            onCheckedChange={(checked) => handleInputChange('hasFinancialCrimes', !checked)}
                          />
                          <Label htmlFor="crimesNo">No</Label>
                        </div>
                      </div>
                      {formData.hasFinancialCrimes && (
                        <div className="mt-4">
                          <Label htmlFor="financialCrimesDetails">If 'YES', explain:</Label>
                          <Textarea
                            id="financialCrimesDetails"
                            value={formData.financialCrimesDetails}
                            onChange={(e) => handleInputChange('financialCrimesDetails', e.target.value)}
                            placeholder="Please provide explanation"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <h4 className="font-semibold text-estate-blue mb-2">Required Documents</h4>
                    <p className="text-sm text-gray-600 mb-2">Dear Client, kindly submit copies of the following along with this completed Subscription/KYC form:</p>
                    <div className="text-sm space-y-1">
                      <p><strong>For Individuals:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Recent Passport Photograph</li>
                        <li>Valid ID (As indicated above)</li>
                        <li>Utility Bill (As indicated above)</li>
                        <li>NIN Slip</li>
                        <li>Bank Proof of Payment</li>
                        <li>Work/Resident Permit (Non-Nigerian)</li>
                        <li>Accompanying Letter (Where applicable)</li>
                      </ul>
                      
                      <p className="pt-4"><strong>Corporate Entity:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Representative Passport Photograph</li>
                        <li>Representative Valid ID</li>
                        <li>Company's Utility Bill</li>
                        <li>Certificate of Incorporation/Business Name</li>
                        <li>CAC Status Report (Form 07)</li>
                        <li>Proof of Payment</li>
                        <li>Accompanying Board Resolution/Letter (Where applicable)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <NavigationButtons stepKey="aml" />
              </TabsContent>

              <TabsContent value="referrer" className="space-y-6 mt-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-estate-blue mb-4">REFERRER INFORMATION</h3>
                  <p className="text-sm text-gray-600 mb-4">Please provide details of the person who referred you (if applicable):</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="referrerName">Referrer Name</Label>
                      <Input
                        id="referrerName"
                        value={formData.referrerName}
                        onChange={(e) => handleInputChange('referrerName', e.target.value)}
                        placeholder="Enter referrer's full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referrerPhone">Referrer Phone Number</Label>
                      <Input
                        id="referrerPhone"
                        value={formData.referrerPhone}
                        onChange={(e) => handleInputChange('referrerPhone', e.target.value)}
                        placeholder="Enter referrer's phone number"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="referrerEmail">Referrer Email Address</Label>
                      <Input
                        id="referrerEmail"
                        type="email"
                        value={formData.referrerEmail}
                        onChange={(e) => handleInputChange('referrerEmail', e.target.value)}
                        placeholder="Enter referrer's email address"
                      />
                    </div>
                  </div>
                </div>
                <NavigationButtons stepKey="referrer" />
              </TabsContent>

              <TabsContent value="review" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Your Information</h3>
                  <p className="text-muted-foreground">
                    Please review all the information you've entered before submitting your comprehensive KYC form.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-estate-blue mb-2">Personal Information</h4>
                      <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                      <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Nationality:</strong> {formData.nationality}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-estate-blue mb-2">Employment</h4>
                      <p><strong>Occupation:</strong> {formData.occupation}</p>
                      <p><strong>Employer:</strong> {formData.employerName}</p>
                      <p><strong>Income Range:</strong> {formData.annualIncome}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I accept the terms and conditions and confirm that all information provided is accurate *
                    </Label>
                  </div>

                  <div className="flex justify-center">
                    <ReCaptcha
                      ref={recaptchaRef}
                      onChange={(token) => setRecaptchaToken(token)}
                      onExpired={() => setRecaptchaToken(null)}
                      onError={() => setRecaptchaToken(null)}
                    />
                  </div>
                </div>
                <NavigationButtons stepKey="review" />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProfileForm;