
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TrainingFormValues, trainingFormSchema, TrainingRegistrationFormProps } from './types';
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';
import AdditionalOptionsFields from './AdditionalOptionsFields';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TrainingRegistrationForm = ({ open, onClose, eventTitle, eventDate }: TrainingRegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvitee, setShowInvitee] = useState(false);
  const { toast } = useToast();
  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: '',
      isPBO: '',
      country: 'Nigeria',
      state: '',
      localGovernment: '',
      address: '',
      inviteAnother: false,
      inviteeName: '',
      inviteePhone: '',
      needReminder: false,
      eventTitle: eventTitle,
      eventDate: eventDate,
      referrerName: '',
      referrerPhone: '',
      referrerEmail: '',
    }
  });

  const onSubmit = async (data: TrainingFormValues) => {
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
            event_date: eventDate,
            referrer_name: data.referrerName,
            referrer_phone: data.referrerPhone,
            referrer_email: data.referrerEmail,
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Thank you for registering! You'll receive a confirmation shortly.",
      });
      
      form.reset();
      onClose();
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-estate-blue">
            {eventTitle ? `Register for ${eventTitle}` : 'Training Registration'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] md:h-[70vh] pr-4">
          <div className="px-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
                <PersonalInfoFields control={form.control} />
                <AddressFields control={form.control} />
                <AdditionalOptionsFields 
                  control={form.control} 
                  showInvitee={showInvitee} 
                  setShowInvitee={setShowInvitee} 
                />
                
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
      </DialogContent>
    </Dialog>
  );
};

export default TrainingRegistrationForm;
