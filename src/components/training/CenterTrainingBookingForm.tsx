
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const centerTrainingSchema = z.object({
  centerName: z.string().min(2, "Center name is required"),
  centerLeaderName: z.string().min(2, "Center leader name is required"),
  address: z.string().min(5, "Address is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().min(12, "Valid email is required"),
  venueCapacity: z.number().min(1, "Venue capacity must be at least 1"),
  expectedAttendance: z.number().min(1, "Expected attendance must be at least 1"),
  trainingDate: z.string().min(1, "Training date is required"),
  trainingTime: z.string().min(1, "Training time is required"),
});

type CenterTrainingFormValues = z.infer<typeof centerTrainingSchema>;

interface CenterTrainingBookingFormProps {
  open: boolean;
  onClose: () => void;
}

const CenterTrainingBookingForm = ({ open, onClose }: CenterTrainingBookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<CenterTrainingFormValues>({
    resolver: zodResolver(centerTrainingSchema),
    defaultValues: {
      centerName: '',
      centerLeaderName: '',
      address: '',
      phoneNumber: '',
      email: '',
      venueCapacity: 0,
      expectedAttendance: 0,
      trainingDate: '',
      trainingTime: '',
    }
  });

  const onSubmit = async (data: CenterTrainingFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('centertraining')
        .insert({
          center_name: data.centerName,
          center_leader_name: data.centerLeaderName,
          address: data.address,
          phone_number: data.phoneNumber,
          email: data.email,
          venue_capacity: data.venueCapacity,
          expected_attendance: data.expectedAttendance,
          training_date: data.trainingDate,
          training_time: data.trainingTime,
        });
      
      if (error) throw error;
      
      toast({
        title: "Booking submitted successfully",
        description: "We'll contact you soon to confirm your center training booking.",
      });
      
      form.reset();
      onClose();
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: "There was a problem submitting your booking. Please login and try again.",
        variant: "destructive",
      });
      console.error('Error submitting center training booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-estate-blue">
            Book Center Training
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="centerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Center Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter center name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="centerLeaderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Center Leader Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter center leader name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter center address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your center or your email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="venueCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedAttendance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Attendance</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trainingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trainingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-estate-blue hover:bg-estate-darkBlue"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Booking'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CenterTrainingBookingForm;
