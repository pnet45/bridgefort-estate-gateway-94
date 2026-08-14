import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, RefreshCw, Save, Trash2, ChevronDown, ChevronUp, LayoutTemplate, Maximize2, Minimize2, CheckCircle2, Mail, Cloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailTemplate { id: string; name: string; subject: string; body: string; category: string; is_default: boolean; }
interface GmailConnection { id: string; google_account_email: string; is_active: boolean; updated_at?: string; }
interface ComposeDialogProps {
  open: boolean; onOpenChange: (open: boolean) => void;
  onSend: (to: string, name: string, subject: string, body: string, cc?: string, bcc?: string) => Promise<{ success: boolean; error?: string }>;
  onSaveDraft: (to: string, name: string, subject: string, body: string) => void;
  onDiscard: () => void; sending: boolean; initialTo?: string; initialName?: string; initialSubject?: string; initialBody?: string;
}

type SendRoute = 'resend' | 'gmail';
const ACTIVE_MAILBOX_KEY = 'admin_email_active_mailbox';

const ComposeDialog: React.FC<ComposeDialogProps> = ({ open, onOpenChange, onSend: _onSend, onSaveDraft, onDiscard, sending, initialTo = '', initialName = '', initialSubject = '', initialBody = '' }) => {
  const [to, setTo] = useState(initialTo), [name, setName] = useState(initialName), [subject, setSubject] = useState(initialSubject), [body, setBody] = useState(initialBody);
  const [cc, setCc] = useState(''), [bcc, setBcc] = useState(''), [showCcBcc, setShowCcBcc] = useState(false), [fullscreen, setFullscreen] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]), [loadingTemplates, setLoadingTemplates] = useState(false), [draftSaving, setDraftSaving] = useState(false), [draftSaved, setDraftSaved] = useState(false);
  const [sendRoute, setSendRoute] = useState<SendRoute>('resend');
  const [gmailConnections, setGmailConnections] = useState<GmailConnection[]>([]);
  const [selectedGmailAccount, setSelectedGmailAccount] = useState('');
  const [loadingGmailConnections, setLoadingGmailConnections] = useState(false);
  const [localSending, setLocalSending] = useState(false);
  const lastSavedSignature = useRef('');
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signature = `${to}\n${name}\n${subject}\n${body}`;
  const activeMailbox = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_MAILBOX_KEY) || '' : '';

  useEffect(() => {
    if (!open) return;
    setTo(initialTo); setName(initialName); setSubject(initialSubject); setBody(initialBody); setCc(''); setBcc(''); setShowCcBcc(false); setFullscreen(false); setDraftSaved(false); setSendRoute('resend'); setSelectedGmailAccount('');
    lastSavedSignature.current = `${initialTo}\n${initialName}\n${initialSubject}\n${initialBody}`;
    fetchTemplates(); fetchGmailConnections();
  }, [open, initialTo, initialName, initialSubject, initialBody]);

  useEffect(() => () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); }, []);

  useEffect(() => {
    if (!open || !signature.trim() || signature === lastSavedSignature.current) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setDraftSaved(false);
    autosaveTimer.current = setTimeout(async () => {
      if (signature === lastSavedSignature.current) return;
      setDraftSaving(true);
      try { await Promise.resolve(onSaveDraft(to, name, subject, body)); lastSavedSignature.current = signature; setDraftSaved(true); }
      finally { setDraftSaving(false); }
    }, 5000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [open, signature, to, name, subject, body, onSaveDraft]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try { const { data, error } = await supabase.from('email_templates').select('id, name, subject, body, category, is_default').order('is_default', { ascending: false }).order('name', { ascending: true }); if (!error && data) setTemplates(data); }
    catch (err) { console.error('Error fetching templates:', err); } finally { setLoadingTemplates(false); }
  };

  const fetchGmailConnections = async () => {
    if (!activeMailbox) return;
    setLoadingGmailConnections(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-list-connections', { body: { mailboxEmail: activeMailbox } });
      if (error) throw error;
      const connections = Array.isArray(data?.connections) ? data.connections as GmailConnection[] : [];
      setGmailConnections(connections);
      if (connections.length) setSelectedGmailAccount(connections[0].google_account_email);
    } catch (error) { console.warn('Unable to load Gmail connections:', error); setGmailConnections([]); }
    finally { setLoadingGmailConnections(false); }
  };

  const handleTemplateSelect = (templateId: string) => { if (templateId === 'none') return; const t = templates.find(x => x.id === templateId); if (t) { setSubject(t.subject); setBody(t.body); } };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) { toast.error('Fill in To, Subject and Message before sending.'); return; }
    if (!activeMailbox) { toast.error('No company mailbox is selected.'); return; }
    if (sendRoute === 'gmail' && !selectedGmailAccount) { toast.error('Select a connected Gmail account first.'); return; }
    setLocalSending(true);
    try {
      const invokeBody = sendRoute === 'gmail'
        ? { action: 'send-message', mailboxEmail: activeMailbox, googleAccountEmail: selectedGmailAccount, to: to.trim(), subject: subject.trim(), html: body, cc: cc.trim() || undefined, bcc: bcc.trim() || undefined }
        : { to: to.trim(), subject: subject.trim(), html: body, text: body.replace(/<[^>]*>/g, ''), fromMailbox: activeMailbox, cc: cc.trim() || undefined, bcc: bcc.trim() || undefined };
      const { data, error } = await supabase.functions.invoke(sendRoute === 'gmail' ? 'gmail-sync' : 'send-email', { body: invokeBody });
      if (error) throw new Error(error.message || 'Email service request failed');
      if (!data?.success) throw new Error(data?.error || 'Email could not be sent');
      toast.success(sendRoute === 'gmail' ? `Sent with Gmail · ${selectedGmailAccount}` : `Sent with Resend · ${activeMailbox}`);
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      onOpenChange(false);
    } catch (error: any) { toast.error(error?.message || 'Failed to send email'); }
    finally { setLocalSending(false); }
  };

  const handleSaveDraft = () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); onSaveDraft(to, name, subject, body); lastSavedSignature.current = signature; setDraftSaved(true); };
  const recipientInputClass = 'border-0 shadow-none focus-visible:ring-0 h-9 min-w-0 flex-1';
  const isSending = sending || localSending;
  const gmailUnavailable = !loadingGmailConnections && gmailConnections.length === 0;

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) setFullscreen(false); onOpenChange(value); }}>
      <DialogContent className={fullscreen ? 'w-screen h-screen max-w-none max-h-none rounded-none overflow-hidden flex flex-col p-0 gap-0' : 'w-[calc(100vw-1rem)] max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0'}>
        <DialogHeader className="shrink-0 px-5 py-3 bg-muted/50 border-b border-border rounded-t-lg flex flex-row items-center justify-between space-y-0">
          <div><DialogTitle className="text-base font-semibold">New Message</DialogTitle><p className="mt-0.5 text-[11px] text-muted-foreground truncate max-w-[65vw]">From {activeMailbox || 'company mailbox'}</p></div>
          <Button type="button" variant="ghost" size="icon" onClick={() => setFullscreen(v => !v)} aria-label={fullscreen ? 'Exit fullscreen' : 'Open fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>{fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</Button>
        </DialogHeader>
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-4 sm:px-5 py-2 space-y-1">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-slate-800">Send using</p><p className="text-[10px] text-slate-500">Choose how this message should leave the company.</p></div><span className="text-[10px] font-medium text-slate-400">{sendRoute === 'gmail' ? 'Google Gmail' : 'Resend'}</span></div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSendRoute('resend')} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${sendRoute === 'resend' ? 'border-slate-900 bg-slate-900 text-white shadow' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}><Cloud className="h-4 w-4"/><span><span className="block text-xs font-semibold">Send with Resend</span><span className={`block text-[10px] ${sendRoute === 'resend' ? 'text-slate-300' : 'text-slate-500'}`}>{activeMailbox || 'Company mailbox'}</span></span></button>
              <button type="button" onClick={() => !gmailUnavailable && setSendRoute('gmail')} disabled={gmailUnavailable} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${sendRoute === 'gmail' ? 'border-emerald-700 bg-emerald-700 text-white shadow' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}><Mail className="h-4 w-4"/><span><span className="block text-xs font-semibold">Send with Gmail</span><span className={`block text-[10px] ${sendRoute === 'gmail' ? 'text-emerald-100' : 'text-slate-500'}`}>{loadingGmailConnections ? 'Checking connections…' : gmailUnavailable ? 'No connected account' : `${gmailConnections.length} connected account${gmailConnections.length === 1 ? '' : 's'}`}</span></span></button>
            </div>
            {sendRoute === 'gmail' && <div className="mt-2"><Label className="mb-1 block text-[11px] text-slate-500">Connected Gmail account</Label><Select value={selectedGmailAccount} onValueChange={setSelectedGmailAccount}><SelectTrigger className="h-9 rounded-xl bg-white text-xs"><SelectValue placeholder="Select connected Google account" /></SelectTrigger><SelectContent>{gmailConnections.map(c => <SelectItem key={c.id} value={c.google_account_email}>{c.google_account_email}</SelectItem>)}</SelectContent></Select></div>}
          </div>
          <div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-16 shrink-0 text-sm text-muted-foreground flex items-center gap-1"><LayoutTemplate className="h-3.5 w-3.5" /> Template</Label><Select onValueChange={handleTemplateSelect}><SelectTrigger className="border-0 shadow-none focus:ring-0 h-9 min-w-0 flex-1"><SelectValue placeholder={loadingTemplates ? 'Loading...' : 'Choose a template (optional)'} /></SelectTrigger><SelectContent><SelectItem value="none">No template</SelectItem>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.is_default ? '⭐ ' : ''}{t.name} ({t.category})</SelectItem>)}</SelectContent></Select></div>
          <div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">To</Label><Input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com, another@example.com" className={recipientInputClass} autoComplete="email" /><Button type="button" variant="ghost" size="sm" onClick={() => setShowCcBcc(!showCcBcc)} className="shrink-0 text-xs text-muted-foreground">Cc/Bcc {showCcBcc ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}</Button></div>
          {showCcBcc && <><div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">Cc</Label><Input type="text" value={cc} onChange={e => setCc(e.target.value)} placeholder="cc@example.com (comma separated)" className={recipientInputClass} autoComplete="email" /></div><div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">Bcc</Label><Input type="text" value={bcc} onChange={e => setBcc(e.target.value)} placeholder="bcc@example.com (comma separated)" className={recipientInputClass} autoComplete="email" /></div></>}
          <div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Recipient name (optional)" className={recipientInputClass} /></div>
          <div className="flex min-w-0 items-center border-b border-border py-1"><Label className="w-12 shrink-0 text-sm text-muted-foreground">Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className={recipientInputClass} /></div>
          <div className="min-w-0 max-w-full overflow-hidden pt-1"><RichTextEditor value={body} onChange={setBody} placeholder="Compose email..." maxLength={5000} minHeightClassName={fullscreen ? 'min-h-[360px]' : 'min-h-[180px]'} maxHeightClassName={fullscreen ? 'max-h-[calc(100vh-260px)]' : 'max-h-[360px]'} className="w-full min-w-0 max-w-full border-0 rounded-none" /></div>
        </div>
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border bg-background"><div className="flex min-w-0 gap-2"><Button onClick={handleSend} disabled={isSending || !to.trim() || !subject.trim() || (sendRoute === 'gmail' && !selectedGmailAccount)} className="gap-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white">{isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Send</Button><Button variant="secondary" size="sm" onClick={handleSaveDraft} className="gap-1 rounded-full"><Save className="h-4 w-4" />Draft</Button>{(draftSaving || draftSaved) && <span className="flex items-center gap-1 text-xs text-muted-foreground">{draftSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}{draftSaving ? 'Saving draft…' : 'Draft saved'}</span>}</div><Button variant="secondary" size="icon" onClick={() => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); onDiscard(); onOpenChange(false); }} className="shrink-0 rounded-full" aria-label="Discard message"><Trash2 className="h-4 w-4" /></Button></div>
      </DialogContent>
    </Dialog>
  );
};
export default ComposeDialog;
