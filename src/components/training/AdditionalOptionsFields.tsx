
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdditionalOptionsFieldsProps } from './types';
import ReferralFields from './ReferralFields';

const AdditionalOptionsFields = ({ control, showInvitee, setShowInvitee }: AdditionalOptionsFieldsProps) => {
  const [isPBO, setIsPBO] = React.useState<string>('');
  const [showReferral, setShowReferral] = React.useState(false);

  const handlePBOChange = (value: string) => {
    setIsPBO(value);
    setShowReferral(value === 'No');
  };

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-estate-blue mb-4">Additional Information</h3>
        
        <FormField
          control={control}
          name="isPBO"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Are you a PBO (Professional Business Owner)? *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handlePBOChange(value);
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <ReferralFields control={control} showReferral={showReferral} />
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="inviteAnother"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setShowInvitee(!!checked);
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Would you like to invite someone else?</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {showInvitee && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-estate-blue">Invitee Information</h4>
            <FormField
              control={control}
              name="inviteeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invitee Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter invitee's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="inviteePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invitee Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter invitee's phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={control}
          name="needReminder"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Send me reminder notifications about this event</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AdditionalOptionsFields;
