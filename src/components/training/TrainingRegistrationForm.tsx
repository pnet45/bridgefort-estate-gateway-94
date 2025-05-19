
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';
import AdditionalOptionsFields from './AdditionalOptionsFields';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  gender: z.string().optional(),
  country: z.string().default('Nigeria'),
  state: z.string().optional(),
  localGovernment: z.string().optional(),
  address: z.string().optional(),
  isPBO: z.string().optional(),
  needReminder: z.boolean().default(false),
  inviteAnother: z.boolean().default(false),
  inviteeName: z.string().optional(),
  inviteePhone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TrainingRegistrationFormProps {
  eventTitle?: string;
  eventDate?: string;
}

const TrainingRegistrationForm: React.FC<TrainingRegistrationFormProps> = ({
  eventTitle = "General Training",
  eventDate = "Upcoming"
}) => {
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: '',
      country: 'Nigeria',
      state: '',
      localGovernment: '',
      address: '',
      isPBO: 'no',
      needReminder: false,
      inviteAnother: false,
      inviteeName: '',
      inviteePhone: '',
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('training_registrations')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          country: data.country,
          state: data.state,
          local_government: data.localGovernment,
          address: data.address,
          is_pbo: data.isPBO,
          need_reminder: data.needReminder,
          invite_another: data.inviteAnother,
          invitee_name: data.inviteAnother ? data.inviteeName : null,
          invitee_phone: data.inviteAnother ? data.inviteePhone : null,
          event_title: eventTitle,
          event_date: eventDate
        });

      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Registration Successful!",
        description: "Thank you for registering for our training event. We'll be in touch soon!",
      });
      
      methods.reset();
      
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-estate-blue mb-6">Register for Training</h2>
      
      {isSuccess ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Registration Successful!</h3>
          <p className="text-gray-600 mb-6">Thank you for registering for our training event. We'll be in touch soon with more details.</p>
          <Button 
            onClick={() => setIsSuccess(false)} 
            className="bg-estate-blue hover:bg-estate-darkBlue"
          >
            Register Someone Else
          </Button>
        </div>
      ) : (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            <PersonalInfoFields />
            <AddressFields />
            <AdditionalOptionsFields />
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white py-3 rounded-md font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export default TrainingRegistrationForm;
