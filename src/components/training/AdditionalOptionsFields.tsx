
import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TrainingFormValues } from "./types";

interface AdditionalOptionsFieldsProps {
  control: Control<TrainingFormValues>;
  showInvitee: boolean;
  setShowInvitee: (show: boolean) => void;
}

const AdditionalOptionsFields: React.FC<AdditionalOptionsFieldsProps> = ({ 
  control, 
  showInvitee, 
  setShowInvitee 
}) => {
  return (
    <>
      <FormField
        control={control}
        name="needReminder"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer">
                Would you like a reminder call?
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="inviteAnother"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
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
              <FormLabel className="cursor-pointer">
                Invite someone else to this training
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
      
      {showInvitee && (
        <div className="border border-gray-200 rounded-md p-4 space-y-4">
          <h3 className="font-medium text-sm text-gray-700">Invitee Information</h3>
          
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
                  <Input placeholder="Enter invitee's phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};

export default AdditionalOptionsFields;
