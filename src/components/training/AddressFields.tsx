
import React from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TrainingFormValues, AddressFieldsProps } from "./types";

const AddressFields: React.FC<AddressFieldsProps> = ({ control }) => {
  return (
    <>
      <FormField
        control={control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country*</FormLabel>
            <FormControl>
              <Input placeholder="Your country" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State*</FormLabel>
              <FormControl>
                <Input placeholder="Your state" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="localGovernment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Government*</FormLabel>
              <FormControl>
                <Input placeholder="Your local government" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address*</FormLabel>
            <FormControl>
              <Input placeholder="Your full address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="isPBO"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Are you a PBO?*</FormLabel>
            <FormControl>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...field}
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AddressFields;
