import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, RefreshCw, Save, Trash2, ChevronDown, ChevronUp, LayoutTemplate, Maximize2, Minimize2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate { id: string; name: string; subject: string; body: string; category: string; is_default: boolean; }
interface ComposeDialogProps {
  open: boolean; onOpenChange: (open: boolean) => void;
  onSend: (to: string, name: string, subject: string, body: string, cc?: string, bcc?: string) => Promise<{ success: boolean; error?: string }>;
  onSaveDraft: (to: string, name: string, subject: string, body: string) => void;
  onDiscard: () => void; sending: boolean; initialTo?: string; initialName?: string; initialSubject?: string; initialBody?: string;
}

const ComposeDialog: React.FC<ComposeDialogProps> = ({ open, onOpenChange, onSend, onSaveDraft, onDiscard, sending, initialTo = '', initialName = '', initialSubject = '', initialBody = '' }) => {
  const [to, setTo] = useState(initialTo), [name, setName] = useState(initialName), [subject, setSubject] = useState(initialSubject), [body, setBody] = useState(initialBody);
  const [cc, setCc] = useState(''), [bcc, setBcc] = useState(''), [showCcBcc, setShowCcBcc] = useState(false), [fullscreen, setFullscreen] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]), [loadingTemplates, setLoadingTemplates] = useState(false), [draftSaving, setDraftSaving] = useState(false), [draftSaved, setDraftSaved] = useState(false);
  const lastSavedSignature = useRef('');
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signature = `${to}\n${name}\n${subject}\n${body}`;

  useEffect(() => {
    if (!open) return;
    setTo(initialTo); setName(initialName); setSubject(initialSubject); setBody(initialBody); setCc(''); setBcc(''); setShowCcBcc(false); setFullscreen(false); setDraftSaved(false);
    lastSavedSignature.current = `${initialTo}\n${initialName}\n${initialSubject}\n${initialBody}`;
    fetchTemplates();
  }, [open, initialTo, initialName, initialSubject, initialBody]);

  useEffect(() => () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); }, []);

  useEffect(() => {
    if (!open || !signature.trim() || signature === lastSavedSignature.current) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setDraftSaved(false);
    autosaveTimer.current = setTimeout(async () => {
      if (signature === lastSavedSignature.current) return;
      setDraftSaving(true);
      try {
        await Promise.resolve(onSaveDraft(to, name, subject, body));
        lastSavedSignature.current = signature;
        setDraftSaved(true);
      } finally { setDraftSaving(false); }
    }, 5000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [open, signature, to, name, subject, body, onSaveDraft]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try { const { data, error } = await supabase.from('email_templates').select('id, name, subject, body, category, is_default').order('is_default', { ascending: false }).order('name', { ascending: true }); if (!error && data) setTemplates(data); }
    catch (err) { console.error('Error fetching templates:', err); } finally { setLoadingTemplates(false); }
  };
  const handleTemplateSelect = (templateId: string) => { if (templateId === 'none') return; const t = templates.find(x => x.id === templateId); if (t) { setSubject(t.subject); setBody(t.body); } };
  const handleSend = async () => { const result = await onSend(to, name, subject, body, cc, bcc); if (result.success) { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); onOpenChange(false); } };
  const handleSaveDraft = () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); onSaveDraft(to, name, subject, body); lastSavedSignature.current = signature; setDraftSaved(true); };
  const recipientInputClass = 'border-0 shadow-none focus-visible:ring-0 h-9 min-w-0 flex-1';

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) setFullscreen(false); onOpenChange(value); }}>
      <DialogContent className={fullscreen ? 'w-screen h-screen max-w-none max-h-none rounded-none overflow-hidden flex flex-col p-0 gap-0' : 'w-[calc(100vw-1rem)] max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0'}>
        <DialogHeader className="shrink-0 px-5 py-3 bg-muted/50 border-b border-border rounded-t-lg flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-base font-semibold">New Message</DialogTitle>
          <Button type="button" variant="ghost" size="icon" onClick={() => setFullscreen(v => !v)} aria-label={fullscreen ? 'Exit fullscreen' : 'Open fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </DialogHeader>
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-4 sm:px-5 py-2 space-y-1">
          <div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-16 shrink-0 text-sm text-muted-foreground flex items-center gap-1"><LayoutTemplate className="h-3.5 w-3.5" /> Template</Label><Select onValueChange={handleTemplateSelect}><SelectTrigger className="border-0 shadow-none focus:ring-0 h-9 min-w-0 flex-1"><SelectValue placeholder={loadingTemplates ? 'Loading...' : 'Choose a template (optional)'} /></SelectTrigger><SelectContent><SelectItem value="none">No template</SelectItem>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.is_default ? '⭐ ' : ''}{t.name} ({t.category})</SelectItem>)}</SelectContent></Select></div>
          <div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">To</Label><Input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com, another@example.com" className={recipientInputClass} autoComplete="email" /><Button type="button" variant="ghost" size="sm" onClick={() => setShowCcBcc(!showCcBcc)} className="shrink-0 text-xs text-muted-foreground">Cc/Bcc {showCcBcc ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}</Button></div>
          {showCcBcc && <><div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">Cc</Label><Input type="text" value={cc} onChange={e => setCc(e.target.value)} placeholder="cc@example.com (comma separated)" className={recipientInputClass} autoComplete="email" /></div><div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">Bcc</Label><Input type="text" value={bcc} onChange={e => setBcc(e.target.value)} placeholder="bcc@example.com (comma separated)" className={recipientInputClass} autoComplete="email" /></div></>}
          <div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Recipient name (optional)" className={recipientInputClass} /></div>
          <div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className={recipientInputClass} /></div>
          <div className="min-w-0 max-w-full overflow-hidden pt-1"><RichTextEditor value={body} onChange={setBody} placeholder="Compose email..." maxLength={5000} minHeightClassName={fullscreen ? 'min-h-[360px]' : 'min-h-[180px]'} maxHeightClassName={fullscreen ? 'max-h-[calc(100vh-260px)]' : 'max-h-[360px]'} className="w-full min-w-0 max-w-full border-0 rounded-none" /></div>
        </div>
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border bg-background"><div className="flex min-w-0 gap-2"><Button onClick={handleSend} disabled={sending || !to.trim() || !subject.trim()} className="gap-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white">{sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Send</Button><Button variant="secondary" size="sm" onClick={handleSaveDraft} className="gap-1 rounded-full"><Save className="h-4 w-4" />Draft</Button>{(draftSaving || draftSaved) && <span className="flex items-center gap-1 text-xs text-muted-foreground">{draftSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}{draftSaving ? 'Saving draft…' : 'Draft saved'}</span>}</div><Button variant="secondary" size="icon" onClick={() => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); onDiscard(); onOpenChange(false); }} className="shrink-0 rounded-full" aria-label="Discard message"><Trash2 className="h-4 w-4" /></Button></div>
      </DialogContent>
    </Dialog>
  );
};
export default ComposeDialog;
