
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "./FileUpload";

interface CareerFormValues {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  coverLetter: string;
}

const CareerForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CareerFormValues>();
  
  const onSubmit = async (data: CareerFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Handle file upload if a resume is provided
      let resumeUrl = null;
      
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${Date.now().toString()}.${fileExt}`;
        const filePath = `applications/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, resumeFile);
          
        if (uploadError) {
          throw new Error('Error uploading file');
        }
        
        const { data: urlData } = supabase.storage
          .from('public')
          .getPublicUrl(filePath);
          
        resumeUrl = urlData.publicUrl;
      }
      
      // Submit form data to your database
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            position: data.position,
            experience: data.experience,
            cover_letter: data.coverLetter,
            resume_url: resumeUrl,
            submitted_at: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: "Application submitted",
        description: "Thank you! We'll review your application and get back to you soon.",
      });
      
      // Reset form
      reset();
      setResumeFile(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your application. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div id="application-form" className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-6">Job Application</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              {...register("fullName", { required: "Name is required" })}
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              {...register("phone", { required: "Phone number is required" })}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="position">Position You're Applying For *</Label>
            <Input
              id="position"
              {...register("position", { required: "Position is required" })}
              className={errors.position ? "border-red-500" : ""}
            />
            {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>}
          </div>
        </div>
        
        <div>
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            id="experience"
            {...register("experience")}
          />
        </div>
        
        <div>
          <Label htmlFor="coverLetter">Cover Letter / Additional Information</Label>
          <Textarea
            id="coverLetter"
            rows={5}
            {...register("coverLetter")}
            placeholder="Tell us why you're interested in this position and what makes you a good fit..."
          />
        </div>
        
        <FileUpload 
          label="Upload Resume (PDF, DOC, DOCX)"
          onFileSelect={setResumeFile}
          file={resumeFile}
          acceptedTypes=".pdf,.doc,.docx"
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-estate-blue hover:bg-estate-darkBlue"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CareerForm;
