
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateInputProps {
  min: string;
  value: string;
  onChange: (value: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({ min, value, onChange }) => (
  <div className="space-y-2">
    <Label htmlFor="inspection_date">Preferred Date *</Label>
    <Input
      id="inspection_date"
      type="date"
      min={min}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    />
  </div>
);

export default DateInput;
