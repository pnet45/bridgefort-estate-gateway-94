
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "./FileUpload";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Create a schema for form validation
const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  position: z.string().optional(),
  experience: z.string().optional(),
  coverLetter: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  state: z.string().optional(),
  localGovernment: z.string().optional(),
  address: z.string().optional(),
});

type CareerFormValues = z.infer<typeof formSchema>;

const CareerForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  
  const form = useForm<CareerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      position: "",
      experience: "",
      coverLetter: "",
      gender: "",
      dateOfBirth: "",
      state: "",
      localGovernment: "",
      address: "",
    },
  });
  
  const onSubmit = async (data: CareerFormValues) => {
    // Validate resume file
    if (!resumeFile) {
      setResumeError("Resume is required");
      return;
    } else {
      setResumeError(null);
    }
    
    setIsSubmitting(true);
    
    try {
      // Handle file upload if a resume is provided
      let resumeUrl = null;
      
      // Upload the resume file
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
      
      // Submit form data to database
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
            submitted_at: new Date().toISOString(),
            gender: data.gender,
            date_of_birth: data.dateOfBirth,
            state: data.state,
            local_government: data.localGovernment,
            address: data.address
          }
        ]);
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: "Application submitted",
        description: "Thank you! We'll review your application and get back to you soon.",
      });
      
      // Reset form
      form.reset();
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
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position You're Applying For</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="estate_manager">Estate Manager</SelectItem>
                      <SelectItem value="marketing_executive">Marketing Executive</SelectItem>
                      <SelectItem value="customer_service">Customer Service</SelectItem>
                      <SelectItem value="admin_assistant">Administrative Assistant</SelectItem>
                      <SelectItem value="surveyor">Surveyor</SelectItem>
                      <SelectItem value="legal_adviser">Legal Adviser</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="localGovernment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local Government</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter / Additional Information</FormLabel>
                <FormControl>
                  <Textarea 
                    rows={5}
                    placeholder="Tell us why you're interested in this position and what makes you a good fit..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <Label>Upload Resume (PDF, DOC, DOCX) *</Label>
            <FileUpload 
              label=""
              onFileSelect={setResumeFile}
              file={resumeFile}
              acceptedTypes=".pdf,.doc,.docx"
            />
            {resumeError && <p className="text-sm font-medium text-destructive">{resumeError}</p>}
          </div>
          
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
      </Form>
    </div>
  );
};

export default CareerForm;
