
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const positions = [
  'Real Estate Agent',
  'Sales Executive',
  'Property Consultant',
  'Marketing Executive',
  'Customer Service Representative',
  'Admin Officer',
  'Accountant',
  'Legal Officer',
  'IT Support',
  'Human Resources',
  'Other'
];

export interface JobDetailFieldsProps {
  position: string;
  gender: string;
  dateOfBirth: string;
  experience: string;
  onChange: (field: string, value: string) => void;
}

const JobDetailFields: React.FC<JobDetailFieldsProps> = ({
  position,
  gender,
  dateOfBirth,
  experience,
  onChange,
}) => (
  <div className="grid md:grid-cols-3 gap-4">
    <div className="space-y-2 md:col-span-1">
      <Label htmlFor="position" className="text-gray-900">Position Applied For *</Label>
      <Select value={position} onValueChange={(v) => onChange('position', v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select position" />
        </SelectTrigger>
        <SelectContent>
          {positions.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2 md:col-span-1">
      <Label htmlFor="gender" className="text-gray-900">Gender</Label>
      <Select value={gender} onValueChange={(v) => onChange('gender', v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="male">Male</SelectItem>
          <SelectItem value="female">Female</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2 md:col-span-1">
      <Label htmlFor="date_of_birth" className="text-gray-900">Date of Birth</Label>
      <Input
        id="date_of_birth"
        type="date"
        value={dateOfBirth}
        onChange={(e) => onChange('date_of_birth', e.target.value)}
      />
    </div>
    <div className="space-y-2 md:col-span-1">
      <Label htmlFor="experience" className="text-gray-900">Years of Experience</Label>
      <Input
        id="experience"
        value={experience}
        onChange={(e) => onChange('experience', e.target.value)}
        placeholder="e.g., 2 years"
      />
    </div>
  </div>
);
export default JobDetailFields;
