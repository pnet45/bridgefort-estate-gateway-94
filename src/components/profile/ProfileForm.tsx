import React, { useState, useRef, useEffect } from 'react';
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
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ReCaptcha from '@/components/ui/ReCaptcha';

const ProfileForm = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

  // Calculate profile completion percentage
  const calculateCompletionPercentage = () => {
    const allFields = [
      // Personal Info
      formData.firstName, formData.lastName, formData.dateOfBirth, formData.gender,
      formData.maritalStatus, formData.nationality, formData.phoneNumber,
      formData.stateOfOrigin, formData.localGovernment, formData.address,
      formData.currentResidence, formData.languagesSpoken.length > 0,
      // Next of Kin
      formData.nextOfKinName, formData.nextOfKinPhone, formData.nextOfKinEmail,
      formData.nextOfKinRelationship, formData.nextOfKinAddress,
      // Employment
      formData.occupation, formData.employerName, formData.employerAddress,
      formData.roleStatus, formData.businessNature,
      // KYC/AML
      amlData.idType, amlData.idNumber, amlData.countryOfIssue,
      amlData.dateOfIssue, amlData.idExpiry, amlData.issuingAuthority,
      amlData.sourceOfFunds, amlData.annualIncomeBracket, amlData.taxId,
      amlData.nin, amlData.bankUsed, amlData.accountNumber, amlData.accountName,
      // KYC Docs
      kycDocs["passport_photo"]?.url, kycDocs["passport"]?.url || kycDocs["nin_card"]?.url || kycDocs["drivers_license"]?.url
    ];

    const filledFields = allFields.filter(field => {
      if (typeof field === 'boolean') return field;
      if (typeof field === 'string') return field.trim().length > 0;
      return !!field;
    }).length;

    return Math.round((filledFields / allFields.length) * 100);
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

      // Calculate completion percentage
      const completionPercentage = calculateCompletionPercentage();
      const isProfileComplete = completionPercentage >= 70;

      // Prepare banking details string
      const bankingDetailsStr = `${amlData.bankUsed || ''} - ${amlData.accountNumber || ''} - ${amlData.accountName || ''}`;

      // Save all profile data to Supabase
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
          employment_status: amlData.employmentStatus || null,
          employer_country: amlData.employerCountry || null,
          next_of_kin_name: formData.nextOfKinName,
          next_of_kin_relationship: formData.nextOfKinRelationship || null,
          next_of_kin_address: formData.nextOfKinAddress || null,
          next_of_kin_phone: formData.nextOfKinPhone,
          next_of_kin_email: formData.nextOfKinEmail,
          kyc_docs: kycDocs,
          id_type: amlData.idType,
          id_number: amlData.idNumber,
          id_expiry: amlData.idExpiry || null,
          source_of_income: amlData.sourceOfFunds || null,
          monthly_income: amlData.monthlyIncome || null,
          banking_details: bankingDetailsStr || null,
          is_foreigner: amlData.isForeigner || false,
          residence_permit: amlData.residencePermit || null,
          visa_status: amlData.visaStatus || null,
          aml_risk_rating: amlData.amlRiskRating || null,
          aml_notes: amlData.amlNotes || null,
          terms_accepted: termsAccepted,
          profile_completed: isProfileComplete,
          profile_completion_percentage: completionPercentage,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // Send welcome email only on first profile completion
      if (isProfileComplete && completionPercentage >= 70) {
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: user.email,
              firstName: formData.firstName,
              lastName: formData.lastName
            }
          });
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
        }
      }

      if (isProfileComplete) {
        toast({
          title: "Profile Updated Successfully!",
          description: `Your profile is ${completionPercentage}% complete. You can now purchase properties and access documentation services.`
        });
      } else {
        toast({
          title: "Profile Saved!",
          description: `Your profile is ${completionPercentage}% complete. Complete at least 70% to unlock property purchases and documentation services.`,
          variant: "default"
        });
      }

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

  // Load existing profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData && !error) {
          // Load personal information
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
            nextOfKinEmail: profileData.next_of_kin_email || ''
          }));

          // Load AML data
          setAmlData(prev => ({
            ...prev,
            idType: profileData.id_type || '',
            idNumber: profileData.id_number || '',
            idExpiry: profileData.id_expiry || '',
            employmentStatus: profileData.employment_status || '',
            employerCountry: profileData.employer_country || '',
            sourceOfIncome: profileData.source_of_income || '',
            monthlyIncome: profileData.monthly_income || '',
            bankingDetails: profileData.banking_details || '',
            isForeigner: profileData.is_foreigner || false,
            residencePermit: profileData.residence_permit || '',
            visaStatus: profileData.visa_status || '',
            amlRiskRating: profileData.aml_risk_rating || '',
            amlNotes: profileData.aml_notes || ''
          }));

          // Load KYC documents
          if (profileData.kyc_docs) {
            setKycDocs(profileData.kyc_docs);
          }

          // Load terms acceptance
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
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCompletionPercentage = calculateCompletionPercentage();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <p className="text-center text-muted-foreground">
            Please fill out the following KYC & AML information to verify your account.
          </p>
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm font-medium">{currentCompletionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-estate-blue h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${currentCompletionPercentage}%` }}
              ></div>
            </div>
            {currentCompletionPercentage < 70 && (
              <p className="text-xs text-muted-foreground mt-2">
                Complete at least 70% to unlock property purchases and documentation services
              </p>
            )}
          </div>
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

            {/* Placeholder for other tabs - keeping the rest of the component structure */}
            <TabsContent value="employment">
              <p>Employment form content here...</p>
            </TabsContent>
            
            <TabsContent value="kyc">
              <p>KYC form content here...</p>
            </TabsContent>
            
            <TabsContent value="aml">
              <p>AML form content here...</p>
            </TabsContent>
            
            <TabsContent value="review">
              <div className="space-y-6">
                <h3>Review your information</h3>
                <ReCaptcha ref={recaptchaRef} onChange={setRecaptchaToken} />
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