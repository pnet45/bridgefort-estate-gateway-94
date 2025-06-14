
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MessageTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

const MessageTextarea: React.FC<MessageTextareaProps> = ({ value, onChange }) => (
  <div className="space-y-2">
    <Label htmlFor="message">Additional Message</Label>
    <Textarea
      id="message"
      placeholder="Any specific requirements or questions..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
    />
  </div>
);

export default MessageTextarea;
