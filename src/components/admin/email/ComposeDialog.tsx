import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, RefreshCw, Save, Trash2, Minus } from 'lucide-react';

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (to: string, name: string, subject: string, body: string) => Promise<{ success: boolean; error?: string }>;
  onSaveDraft: (to: string, name: string, subject: string, body: string) => void;
  onDiscard: () => void;
  sending: boolean;
  initialTo?: string;
  initialName?: string;
  initialSubject?: string;
  initialBody?: string;
}

const ComposeDialog: React.FC<ComposeDialogProps> = ({
  open, onOpenChange, onSend, onSaveDraft, onDiscard, sending,
  initialTo = '', initialName = '', initialSubject = '', initialBody = ''
}) => {
  const [to, setTo] = useState(initialTo);
  const [name, setName] = useState(initialName);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  React.useEffect(() => {
    if (open) {
      setTo(initialTo);
      setName(initialName);
      setSubject(initialSubject);
      setBody(initialBody);
    }
  }, [open, initialTo, initialName, initialSubject, initialBody]);

  const handleSend = async () => {
    const result = await onSend(to, name, subject, body);
    if (result.success) {
      onOpenChange(false);
    }
  };

  const handleSaveDraft = () => {
    onSaveDraft(to, name, subject, body);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 bg-muted/50 border-b border-border rounded-t-lg">
          <DialogTitle className="text-base">New Message</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col min-h-0 px-4 py-2 space-y-1">
          <div className="flex items-center border-b border-border py-1">
            <Label className="w-12 text-sm text-muted-foreground">To</Label>
            <Input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="border-0 shadow-none focus-visible:ring-0 h-8"
            />
          </div>
          <div className="flex items-center border-b border-border py-1">
            <Label className="w-12 text-sm text-muted-foreground">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recipient name (optional)"
              className="border-0 shadow-none focus-visible:ring-0 h-8"
            />
          </div>
          <div className="flex items-center border-b border-border py-1">
            <Label className="w-12 text-sm text-muted-foreground">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="border-0 shadow-none focus-visible:ring-0 h-8"
            />
          </div>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Compose email..."
            className="flex-1 min-h-[200px] border-0 shadow-none focus-visible:ring-0 resize-none"
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={sending || !to.trim() || !subject.trim()} className="gap-1 rounded-full">
              {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft} className="gap-1">
              <Save className="h-4 w-4" /> Draft
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { onDiscard(); onOpenChange(false); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeDialog;
