
import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RegistrationFormData } from './types';
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';
import AdditionalOptionsFields from './AdditionalOptionsFields';

const TrainingRegistrationForm = ({ eventTitle, eventDate }: { eventTitle?: string; eventDate?: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<RegistrationFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: '',
      isPBO: 'no',
      country: 'Nigeria',
      state: '',
      localGovernment: '',
      address: '',
      inviteAnother: false,
      inviteeName: '',
      inviteePhone: '',
      needReminder: false,
    }
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('training_registrations')
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            gender: data.gender,
            is_pbo: data.isPBO,
            country: data.country,
            state: data.state,
            local_government: data.localGovernment,
            address: data.address,
            invite_another: data.inviteAnother,
            invitee_name: data.inviteeName,
            invitee_phone: data.inviteePhone,
            need_reminder: data.needReminder,
            event_title: eventTitle,
            event_date: eventDate
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Thank you for registering! You'll receive a confirmation shortly.",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: "There was a problem submitting your registration. Please try again.",
        variant: "destructive",
      });
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="px-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-4">
            <PersonalInfoFields form={form} />
            <AddressFields form={form} />
            <AdditionalOptionsFields form={form} />
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-estate-blue hover:bg-estate-darkBlue"
              >
                {isSubmitting ? 'Submitting...' : 'Register Now'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
};

export default TrainingRegistrationForm;
