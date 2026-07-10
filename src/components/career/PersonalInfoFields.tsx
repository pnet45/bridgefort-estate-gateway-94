
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PersonalInfoFieldsProps {
  fullName: string;
  email: string;
  phone: string;
  onChange: (field: string, value: string) => void;
}
const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  fullName,
  email,
  phone,
  onChange,
}) => (
  <div className="grid md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="full_name" className="text-gray-900">Full Name *</Label>
      <Input
        id="full_name"
        value={fullName}
        onChange={(e) => onChange('full_name', e.target.value)}
        required
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="email" className="text-gray-900">Email Address *</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => onChange('email', e.target.value)}
        required
      />
    </div>
    <div className="md:col-span-2 space-y-2">
      <Label htmlFor="phone" className="text-gray-900">Phone Number *</Label>
      <Input
        id="phone"
        type="tel"
        value={phone}
        onChange={(e) => onChange('phone', e.target.value)}
        required
      />
    </div>
  </div>
);
export default PersonalInfoFields;
