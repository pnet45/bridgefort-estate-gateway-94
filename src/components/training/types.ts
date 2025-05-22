
import { z } from "zod";

export const trainingFormSchema = z.object({
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
  isPBO: z.string().min(1, { message: "Please select whether you are a PBO" }),
});

export type TrainingFormValues = z.infer<typeof trainingFormSchema>;

export interface TrainingRegistrationFormProps {
  open: boolean;
  onClose: () => void;
  eventTitle?: string;
  eventDate?: string;
}

// Interface for the PersonalInfoFields component
export interface PersonalInfoFieldsProps {
  control: any;
}

// Interface for the AddressFields component
export interface AddressFieldsProps {
  control: any;
}

// Interface for the AdditionalOptionsFields component
export interface AdditionalOptionsFieldsProps {
  control: any;
  showInvitee: boolean;
  setShowInvitee: (show: boolean) => void;
}
