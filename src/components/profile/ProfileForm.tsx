
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

const ProfileForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    spouseName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: '',
    languages: ''
  });

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would save to your database
      // For now, just show success message
      toast({
        title: "Profile Updated",
        description: "Your personal information has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-6">
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="spouseName">Name of Spouse *</Label>
                    <Input
                      id="spouseName"
                      value={personalInfo.spouseName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, spouseName: e.target.value }))}
                      placeholder="Enter spouse's name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={personalInfo.gender}
                      onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status *</Label>
                    <Select
                      value={personalInfo.maritalStatus}
                      onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, maritalStatus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={personalInfo.nationality}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, nationality: e.target.value }))}
                      placeholder="Enter your nationality"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languages">Language(s) Spoken *</Label>
                    <Select
                      value={personalInfo.languages}
                      onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, languages: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="yoruba">Yoruba</SelectItem>
                        <SelectItem value="hausa">Hausa</SelectItem>
                        <SelectItem value="igbo">Igbo</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="multiple">Multiple Languages</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button type="button" variant="outline">
                    Skip for Now
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-estate-blue hover:bg-estate-darkBlue">
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;
