import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Plug, Loader2, LogOut, CheckCircle2, ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AvailableMailbox {
  mailbox_email: string;
  mailbox_provider: string;
  is_connected: boolean;
}

interface EmailLoginScreenProps {
  mailboxes: AvailableMailbox[];
  loading: boolean;
  activeMailbox: string | null;
  connectingEmail: string | null;
  disconnectingEmail: string | null;
  onSelect: (mailboxEmail: string) => void;
  onConnectGmail: (mailboxEmail: string) => void;
  onDisconnectGmail: (mailboxEmail: string) => void;
}

export default function EmailLoginScreen({ mailboxes, loading, activeMailbox, connectingEmail, disconnectingEmail, onSelect, onConnectGmail, onDisconnectGmail }: EmailLoginScreenProps) {
  const [localConnecting, setLocalConnecting] = useState<string | null>(null);

  const connectSelectedMailbox = async (mailboxEmail: string) => {
    setLocalConnecting(mailboxEmail);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-oauth-start', { body: { mailboxEmail } });
      if (error || !data?.url) throw new Error(error?.message || 'Could not start Gmail connection');
      window.location.href = data.url;
    } catch (error: any) {
      toast.error(error?.message || 'Could not start Gmail connection');
      setLocalConnecting(null);
    }
  };

  const mailboxRows = loading ? [] : mailboxes;

  // When a mailbox is already selected, this component is opened by the
  // Email Center's "Switch mailbox" control. Keep that interaction compact:
  // show only the mailboxes the current administrator can actually use.
  if (activeMailbox) {
    return (
      <div className="fixed inset-0 z-[80] bg-slate-950/10 backdrop-blur-[1px]" onMouseDown={(e) => { if (e.target === e.currentTarget) onSelect(activeMailbox); }}>
        <div className="absolute right-4 top-20 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/40 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
            <div className="min-w-0"><p className="text-sm font-semibold text-slate-900 dark:text-white">Switch mailbox</p><p className="truncate text-[11px] text-slate-500">Choose a connected company mailbox</p></div>
            <Button variant="ghost" size="icon" onClick={() => onSelect(activeMailbox)} className="h-8 w-8 rounded-lg"><ChevronDown className="h-4 w-4 rotate-180" /></Button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {loading ? <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : mailboxRows.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No mailbox is assigned to you.</p> : mailboxRows.map((mb) => {
              const isGmail = mb.mailbox_provider === 'gmail';
              const needsConnect = isGmail && !mb.is_connected;
              const isConnecting = connectingEmail === mb.mailbox_email || localConnecting === mb.mailbox_email;
              const isDisconnecting = disconnectingEmail === mb.mailbox_email;
              const isActive = activeMailbox === mb.mailbox_email;
              return (
                <div key={`${mb.mailbox_provider}-${mb.mailbox_email}`} className={`mb-1 flex items-center gap-3 rounded-xl border p-3 transition ${isActive ? 'border-primary/30 bg-primary/5' : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/5'}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white"><Mail className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-900 dark:text-white">{mb.mailbox_email}</p><div className="mt-0.5 flex items-center gap-2"><Badge variant="secondary" className="rounded-full px-2 py-0 text-[9px] capitalize">{mb.mailbox_provider}</Badge>{isGmail && <span className={`text-[10px] ${mb.is_connected ? 'text-emerald-600' : 'text-amber-600'}`}>{mb.is_connected ? 'Connected' : 'Needs Google connection'}</span>}</div></div>
                  {needsConnect ? <Button size="sm" onClick={() => connectSelectedMailbox(mb.mailbox_email)} disabled={isConnecting} className="h-8 rounded-lg">{isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}<span className="ml-1">Connect</span></Button> : <div className="flex items-center gap-1"><Button size="sm" variant={isActive ? 'secondary' : 'default'} onClick={() => onSelect(mb.mailbox_email)} className="h-8 rounded-lg">{isActive ? 'Current' : 'Open'}{!isActive && <ArrowRight className="ml-1 h-3.5 w-3.5" />}</Button>{isGmail && <Button size="icon" variant="ghost" onClick={() => onDisconnectGmail(mb.mailbox_email)} disabled={isDisconnecting} title="Disconnect Gmail" className="h-8 w-8 text-muted-foreground hover:text-red-500">{isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}</Button>}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/30 bg-white/65 p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,.55)] backdrop-blur-2xl md:p-10 dark:border-white/10 dark:bg-slate-950/45">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/30 bg-slate-900 text-white shadow-xl dark:bg-white/10"><Mail className="h-7 w-7" /></div>
          <div className="mb-2 flex items-center justify-center gap-2"><h2 className="text-2xl font-bold tracking-tight">Email Center</h2><span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Secure</span></div>
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">Sign in to an authorized company mailbox. Each mailbox can have one or more Google accounts assigned by an authorized administrator.</p>
        </div>
        {loading ? <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : mailboxes.length === 0 ? <div className="rounded-2xl border border-white/20 bg-white/40 p-10 text-center backdrop-blur-xl dark:bg-white/5"><Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" /><p className="font-medium">No mailboxes are assigned to your account yet.</p><p className="mt-1 text-sm text-muted-foreground">Ask an authorized administrator to grant you mailbox access.</p></div> : <div className="grid gap-3">{mailboxes.map((mb) => { const isGmail = mb.mailbox_provider === 'gmail'; const needsConnect = isGmail && !mb.is_connected; const isConnecting = connectingEmail === mb.mailbox_email || localConnecting === mb.mailbox_email; const isDisconnecting = disconnectingEmail === mb.mailbox_email; const isActive = activeMailbox === mb.mailbox_email; return <div key={`${mb.mailbox_provider}-${mb.mailbox_email}`} className={`group flex items-center gap-3 rounded-2xl border p-4 shadow-sm backdrop-blur-xl transition-all ${isActive ? 'border-primary/30 bg-primary/5 shadow-primary/10' : 'border-white/25 bg-white/45 hover:-translate-y-0.5 hover:bg-white/65 dark:bg-white/5 dark:hover:bg-white/10'}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/60 text-primary shadow-sm dark:bg-white/10"><Mail className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{mb.mailbox_email}</p><div className="mt-1 flex flex-wrap items-center gap-2"><Badge variant="secondary" className="rounded-full text-[10px] capitalize">{mb.mailbox_provider}</Badge>{isGmail && <span className={`flex items-center gap-1 text-[11px] ${mb.is_connected ? 'text-emerald-600 dark:text-emerald-300' : 'text-muted-foreground'}`}>{mb.is_connected ? <CheckCircle2 className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}{mb.is_connected ? 'Google connected' : 'Google account required'}</span>}</div></div><div className="flex shrink-0 items-center gap-1.5">{needsConnect ? <Button size="sm" onClick={() => connectSelectedMailbox(mb.mailbox_email)} disabled={isConnecting} className="gap-1.5 rounded-full">{isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}Connect</Button> : <><Button size="sm" variant={isActive ? 'secondary' : 'default'} onClick={() => onSelect(mb.mailbox_email)} className="gap-1.5 rounded-full">{isActive ? 'Current' : 'Sign In'}{!isActive && <ArrowRight className="h-3.5 w-3.5" />}</Button>{isGmail && <Button size="sm" variant="ghost" onClick={() => onDisconnectGmail(mb.mailbox_email)} disabled={isDisconnecting} title="Sign out this mailbox" className="text-muted-foreground hover:text-red-500">{isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}</Button>}</>}</div></div>; })}</div>}
      </div>
    </div>
  );
}
