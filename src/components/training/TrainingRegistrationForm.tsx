
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { TrainingRegistrationFormProps, trainingFormSchema, TrainingFormValues } from "./types";
import PersonalInfoFields from "./PersonalInfoFields";
import AddressFields from "./AddressFields";
import AdditionalOptionsFields from "./AdditionalOptionsFields";
import { handleFormSubmission } from "./formUtils";

const TrainingRegistrationForm: React.FC<TrainingRegistrationFormProps> = ({
  open,
  onClose,
  eventTitle = "",
  eventDate = "",
}) => {
  const [showInvitee, setShowInvitee] = useState(false);

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema),
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
      isPBO: "",
    },
  });

  const handleSubmit = (data: TrainingFormValues) => {
    handleFormSubmission(data);
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
            {/* Personal Information Fields */}
            <PersonalInfoFields control={form.control} />
            
            {/* Address Fields */}
            <AddressFields control={form.control} />
            
            {/* Additional Options Fields */}
            <AdditionalOptionsFields 
              control={form.control} 
              showInvitee={showInvitee} 
              setShowInvitee={setShowInvitee} 
            />
            
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
