
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AddressFieldsProps {
  address: string;
  state: string;
  localGovernment: string;
  onChange: (field: string, value: string) => void;
}

const AddressFields: React.FC<AddressFieldsProps> = ({
  address,
  state,
  localGovernment,
  onChange,
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="address" className="text-gray-900">Address</Label>
      <Input
        id="address"
        value={address}
        onChange={(e) => onChange('address', e.target.value)}
        placeholder="Your full address"
      />
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="state" className="text-gray-900">State</Label>
        <Input
          id="state"
          value={state}
          onChange={(e) => onChange('state', e.target.value)}
          placeholder="Your state"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="local_government" className="text-gray-900">Local Government</Label>
        <Input
          id="local_government"
          value={localGovernment}
          onChange={(e) => onChange('local_government', e.target.value)}
          placeholder="Your LGA"
        />
      </div>
    </div>
  </div>
);

export default AddressFields;
