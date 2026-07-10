
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange }) => (
  <div className="space-y-2">
    <Label htmlFor="inspection_time">Preferred Time *</Label>
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-gray-400" />
      <Input
        id="inspection_time"
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  </div>
);

export default TimeInput;
