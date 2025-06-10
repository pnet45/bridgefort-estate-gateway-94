
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
          terms_accepted: termsAccepted,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been completed successfully!"
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
            Please fill out the following information to complete your account setup.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="nextofkin">Next of Kin</TabsTrigger>
              <TabsTrigger value="review">Review & Submit</TabsTrigger>
            </TabsList>
            
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
                          onCheckedChange={(checked) => handleLanguageChange(language, checked as boolean)}
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
            </TabsContent>

            <TabsContent value="nextofkin" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nextOfKinName">Next of Kin Name *</Label>
                  <Input
                    id="nextOfKinName"
                    value={formData.nextOfKinName}
                    onChange={(e) => handleInputChange('nextOfKinName', e.target.value)}
                    placeholder="Enter next of kin's name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextOfKinRelationship">Next of Kin Relationship *</Label>
                  <Select value={formData.nextOfKinRelationship} onValueChange={(value) => handleInputChange('nextOfKinRelationship', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nextOfKinAddress">Next of Kin Address *</Label>
                  <Textarea
                    id="nextOfKinAddress"
                    value={formData.nextOfKinAddress}
                    onChange={(e) => handleInputChange('nextOfKinAddress', e.target.value)}
                    placeholder="Enter next of kin's address"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextOfKinPhone">Next of Kin Phone Number *</Label>
                  <Input
                    id="nextOfKinPhone"
                    value={formData.nextOfKinPhone}
                    onChange={(e) => handleInputChange('nextOfKinPhone', e.target.value)}
                    placeholder="Enter next of kin's phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextOfKinEmail">Next of Kin Email Address</Label>
                  <Input
                    id="nextOfKinEmail"
                    type="email"
                    value={formData.nextOfKinEmail}
                    onChange={(e) => handleInputChange('nextOfKinEmail', e.target.value)}
                    placeholder="Enter next of kin's email address"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review Your Information</h3>
                <p className="text-muted-foreground">
                  Please review all the information you've entered before submitting.
                </p>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={setTermsAccepted}
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
                  {loading ? 'Submitting...' : 'Submit Profile'}
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
