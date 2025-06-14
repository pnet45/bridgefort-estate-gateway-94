
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EstateSelectProps {
  estates: Array<{ name: string }>;
  value: string;
  onChange: (value: string) => void;
}

const EstateSelect: React.FC<EstateSelectProps> = ({ estates, value, onChange }) => (
  <div className="space-y-2">
    <Label htmlFor="estate_name">Property *</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a property to inspect" />
      </SelectTrigger>
      <SelectContent>
        {estates.map((estate) => (
          <SelectItem key={estate.name} value={estate.name}>
            {estate.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default EstateSelect;
