import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, RefreshCw, Save, Trash2, ChevronDown, ChevronUp, LayoutTemplate } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  is_default: boolean;
}

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (to: string, name: string, subject: string, body: string, cc?: string, bcc?: string) => Promise<{ success: boolean; error?: string }>;
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
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (open) {
      setTo(initialTo);
      setName(initialName);
      setSubject(initialSubject);
      setBody(initialBody);
      setCc('');
      setBcc('');
      setShowCcBcc(false);
      fetchTemplates();
    }
  }, [open, initialTo, initialName, initialSubject, initialBody]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, body, category, is_default')
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });
      if (!error && data) setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'none') return;
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleSend = async () => {
    const result = await onSend(to, name, subject, body, cc, bcc);
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
          {/* Template Selector */}
          <div className="flex items-center border-b border-border py-1">
            <Label className="w-16 text-sm text-muted-foreground flex items-center gap-1">
              <LayoutTemplate className="h-3.5 w-3.5" /> Template
            </Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8 flex-1">
                <SelectValue placeholder={loadingTemplates ? "Loading..." : "Choose a template (optional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No template</SelectItem>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.is_default ? '⭐ ' : ''}{t.name} ({t.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center border-b border-border py-1">
            <Label className="w-12 text-sm text-muted-foreground">To</Label>
            <Input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="border-0 shadow-none focus-visible:ring-0 h-8 flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-xs text-muted-foreground shrink-0"
            >
              Cc/Bcc {showCcBcc ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          </div>
          {showCcBcc && (
            <>
              <div className="flex items-center border-b border-border py-1">
                <Label className="w-12 text-sm text-muted-foreground">Cc</Label>
                <Input
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com (comma separated)"
                  className="border-0 shadow-none focus-visible:ring-0 h-8"
                />
              </div>
              <div className="flex items-center border-b border-border py-1">
                <Label className="w-12 text-sm text-muted-foreground">Bcc</Label>
                <Input
                  type="email"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com (comma separated)"
                  className="border-0 shadow-none focus-visible:ring-0 h-8"
                />
              </div>
            </>
          )}
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
