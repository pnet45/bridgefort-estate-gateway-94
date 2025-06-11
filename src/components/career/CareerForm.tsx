
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FileUpload } from './FileUpload';

const positions = [
  'Real Estate Agent',
  'Sales Executive',
  'Property Consultant',
  'Marketing Executive',
  'Customer Service Representative',
  'Admin Officer',
  'Accountant',
  'Legal Officer',
  'IT Support',
  'Human Resources',
  'Other'
];

const CareerForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    address: '',
    state: '',
    local_government: '',
    gender: '',
    date_of_birth: '',
    cover_letter: '',
    resume_url: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('applications')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Application submitted successfully!",
        description: "Thank you for your interest. We'll review your application and get back to you soon."
      });

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        address: '',
        state: '',
        local_government: '',
        gender: '',
        date_of_birth: '',
        cover_letter: '',
        resume_url: ''
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      resume_url: url
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Career Application</CardTitle>
        <CardDescription className="text-center">
          Fill out the form below to apply for a position with PWAN Bridgefort
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-gray-900">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="text-gray-900">Position Applied For *</Label>
              <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-gray-900">Gender</Label>
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
              <Label htmlFor="date_of_birth" className="text-gray-900">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-gray-900">Years of Experience</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="e.g., 2 years"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-900">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Your full address"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state" className="text-gray-900">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Your state"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="local_government" className="text-gray-900">Local Government</Label>
              <Input
                id="local_government"
                value={formData.local_government}
                onChange={(e) => handleInputChange('local_government', e.target.value)}
                placeholder="Your LGA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter" className="text-gray-900">Cover Letter</Label>
            <Textarea
              id="cover_letter"
              value={formData.cover_letter}
              onChange={(e) => handleInputChange('cover_letter', e.target.value)}
              rows={4}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900">Resume/CV</Label>
            <FileUpload
              label="Upload Resume"
              onFileSelect={(file: File | null) => {
                if (file) {
                  // Upload the file to Supabase storage
                  supabase.storage
                    .from('resumes')
                    .upload(`${formData.full_name}-${file.name}`, file, {
                      cacheControl: '3600',
                      upsert: false
                    })
                    .then(({ data, error }) => {
                      if (error) {
                        console.error('Error uploading file:', error);
                        toast({
                          title: "Upload failed",
                          description: "There was an error uploading your resume. Please try again.",
                          variant: "destructive"
                        });
                      } else if (data) {
                        console.log('File uploaded successfully:', data);
                        const resumeURL = `https://xyvspvtdaacqfmfocvhw.supabase.co/storage/v1/object/public/resumes/${data.path}`;
                        handleFileUpload(resumeURL);
                        toast({
                          title: "Resume uploaded successfully!",
                          description: "Your resume has been uploaded."
                        });
                      }
                    });
                } else {
                  handleFileUpload('');
                }
              }}
              file={formData.resume_url ? new File([], formData.resume_url.split('/').pop() || 'resume') : null}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-estate-blue hover:bg-estate-darkBlue"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CareerForm;
