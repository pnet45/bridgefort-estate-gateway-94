import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { TrainingFormValues } from './types';

interface ReferralFieldsProps {
  control: Control<TrainingFormValues>;
  showReferral: boolean;
}

const ReferralFields = ({ control, showReferral }: ReferralFieldsProps) => {
  if (!showReferral) return null;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-estate-blue">Referrer Information</h4>
      <p className="text-sm text-gray-600">Please provide details of the PBO who referred you:</p>
      
      <FormField
        control={control}
        name="referrerName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Referrer Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter referrer's full name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="referrerPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Referrer Phone Number *</FormLabel>
            <FormControl>
              <Input placeholder="Enter referrer's phone number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="referrerEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Referrer Email *</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Enter referrer's email address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ReferralFields;