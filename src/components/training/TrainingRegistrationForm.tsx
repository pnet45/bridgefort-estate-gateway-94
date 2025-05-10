
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(5, { message: "Phone number is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  state: z.string().min(1, { message: "State is required" }),
  localGovernment: z.string().min(1, { message: "Local Government is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  needReminder: z.boolean().default(false),
  inviteAnother: z.boolean().default(false),
  inviteeName: z.string().optional(),
  inviteePhone: z.string().optional(),
  eventTitle: z.string().optional(),
  eventDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TrainingRegistrationFormProps {
  open: boolean;
  onClose: () => void;
  eventTitle?: string;
  eventDate?: string;
}

const TrainingRegistrationForm: React.FC<TrainingRegistrationFormProps> = ({
  open,
  onClose,
  eventTitle = "",
  eventDate = "",
}) => {
  const [showInvitee, setShowInvitee] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "",
      email: "",
      phone: "",
      country: "Nigeria",
      state: "",
      localGovernment: "",
      address: "",
      needReminder: false,
      inviteAnother: false,
      inviteeName: "",
      inviteePhone: "",
      eventTitle,
      eventDate,
    },
  });

  const handleSubmit = (data: FormValues) => {
    // Format the email body with the form data
    const subject = encodeURIComponent(`Training Registration: ${data.eventTitle || 'Upcoming Training'}`);
    
    let body = encodeURIComponent(
      `Registration Details:\n\n` +
      `Name: ${data.name}\n` +
      `Gender: ${data.gender}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n` +
      `Country: ${data.country}\n` +
      `State: ${data.state}\n` +
      `Local Government: ${data.localGovernment}\n` +
      `Address: ${data.address}\n` +
      `Needs Reminder Call: ${data.needReminder ? 'Yes' : 'No'}\n` +
      `Event: ${data.eventTitle || "Not specified"}\n` +
      `Event Date: ${data.eventDate || "Not specified"}\n`
    );
    
    if (data.inviteAnother && data.inviteeName && data.inviteePhone) {
      body += encodeURIComponent(
        `\nInvited Person:\n` +
        `Name: ${data.inviteeName}\n` +
        `Phone: ${data.inviteePhone}\n`
      );
    }
    
    // Open the default email client with pre-populated fields
    window.location.href = `mailto:training@pwanbridgefort.ng?subject=${subject}&body=${body}`;
    
    // Close the dialog after submission
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-estate-blue">
            Training Registration
          </DialogTitle>
          <DialogDescription>
            {eventTitle ? `Register for: ${eventTitle} - ${eventDate}` : "Complete your registration for this training event"}
          </DialogDescription>
        </DialogHeader>
        
        <button 
          className="absolute right-4 top-4 rounded-sm text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender*</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Prefer not to say</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
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
                control={form.control}
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
                control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-estate-red hover:bg-red-700 text-white"
              >
                Submit Registration
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingRegistrationForm;
