
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { captureEvent, captureException } from '@/lib/posthog';

import PersonalInfoFields from "./PersonalInfoFields";
import JobDetailFields from "./JobDetailFields";
import AddressFields from "./AddressFields";
import CoverLetterField from "./CoverLetterField";
import ResumeUploadField from "./ResumeUploadField";

// Add prop to accept defaultPosition
interface CareerFormProps {
  defaultPosition?: string;
}

const CareerForm: React.FC<CareerFormProps> = ({ defaultPosition }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => {
    const emptyDraft = {
      position: defaultPosition || '',
      full_name: '',
      email: '',
      phone: '',
      experience: '',
      address: '',
      state: '',
      local_government: '',
      gender: '',
      date_of_birth: '',
      cover_letter: '',
      resume_url: ''
    };
    try {
      const raw = window.sessionStorage.getItem('bridgefort:career-application-draft:v1');
      if (!raw) return emptyDraft;
      const saved = JSON.parse(raw);
      if (!saved.savedAt || Date.now() - saved.savedAt > 4 * 60 * 60 * 1000) {
        window.sessionStorage.removeItem('bridgefort:career-application-draft:v1');
        return emptyDraft;
      }
      return { ...emptyDraft, ...saved.form, position: defaultPosition || saved.form?.position || '' };
    } catch {
      return emptyDraft;
    }
  });

  useEffect(() => {
    if (defaultPosition) setFormData((prev) => ({ ...prev, position: defaultPosition }));
  }, [defaultPosition]);

  // Keep this application draft for the current tab session so a mobile
  // browser returning from the device file picker does not erase the form.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        'bridgefort:career-application-draft:v1',
        JSON.stringify({ savedAt: Date.now(), form: formData })
      );
    } catch (error) {
      console.warn('Unable to preserve career application draft.', error);
    }
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
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

      captureEvent('career_application_submitted', {
        position: formData.position,
        has_resume: Boolean(formData.resume_url),
        has_cover_letter: Boolean(formData.cover_letter),
      });

      toast({
        title: "Application submitted successfully!",
        description: "Thank you for your interest. We'll review your application and get back to you soon."
      });

      setFormData({
        position: defaultPosition || '',
        full_name: '',
        email: '',
        phone: '',
        experience: '',
        address: '',
        state: '',
        local_government: '',
        gender: '',
        date_of_birth: '',
        cover_letter: '',
        resume_url: ''
      });
      window.sessionStorage.removeItem('bridgefort:career-application-draft:v1');

    } catch (error) {
      captureException(error, { workflow: 'career_application' });
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

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Career Application</CardTitle>
        <CardDescription className="text-center">
          Fill out the form below to apply for a position with Bridgefort Homes Development Ltd
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfoFields
            fullName={formData.full_name}
            email={formData.email}
            phone={formData.phone}
            onChange={handleInputChange}
          />
          <JobDetailFields
            position={formData.position}
            gender={formData.gender}
            dateOfBirth={formData.date_of_birth}
            experience={formData.experience}
            onChange={handleInputChange}
          />
          <AddressFields
            address={formData.address}
            state={formData.state}
            localGovernment={formData.local_government}
            onChange={handleInputChange}
          />
          <CoverLetterField
            value={formData.cover_letter}
            onChange={(v) => handleInputChange('cover_letter', v)}
          />
          <ResumeUploadField
            resumeUrl={formData.resume_url}
            onFileChange={(url: string) => handleInputChange('resume_url', url)}
          />

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
