
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface CoverLetterFieldProps {
  value: string;
  onChange: (v: string) => void;
}

const CoverLetterField: React.FC<CoverLetterFieldProps> = ({ value, onChange }) => (
  <div className="space-y-2">
    <Label htmlFor="cover_letter" className="text-gray-900">Cover Letter</Label>
    <Textarea
      id="cover_letter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      placeholder="Tell us why you're interested in this position and what makes you a great fit..."
    />
  </div>
);
export default CoverLetterField;
