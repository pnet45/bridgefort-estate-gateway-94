import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useEmail } from '@/hooks/useEmail';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import AdminEmailTemplates from './AdminEmailTemplates';
import AdminBulkEmail from './AdminBulkEmail';
import GmailSidebar, { EmailFolder } from './email/GmailSidebar';
import EmailListItem, { UnifiedEmail } from './email/EmailListItem';
import EmailReadingPane from './email/EmailReadingPane';
import ComposeDialog from './email/ComposeDialog';
import EmailLoginScreen, { AvailableMailbox } from './email/EmailLoginScreen';
import {
  Mail, Search, RefreshCw, Trash2, Archive, MailOpen,
  CheckSquare, Star, Users, User, Inbox, GripVertical, LogOut
} from 'lucide-react';
import AdminEmailSettings from './AdminEmailSettings';

type EmailAccount = 'resend' | 'gmail';
const ACTIVE_MAILBOX_KEY = 'admin_email_active_mailbox';

export default function AdminEmailCenter() {
  const { user, hasMailboxAccess, hasPermission } = useAuth();
  const {
    sentEmails, inboxMessages, contacts, loading, sending,
    unreadCount, sendEmail, replyToMessage, deleteEmailLog,
    deleteMessage, refreshAll,
  } = useEmail();

  const [activeFolder, setActiveFolder] = useState<EmailFolder>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeInitial, setComposeInitial] = useState({ to: '', name: '', subject: '', body: '' });
  const [fullViewEmail, setFullViewEmail] = useState(false);

  // Resizable column width
  const [listWidth, setListWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);

  // DB-backed admin_emails — the single source of truth for both Gmail and
  // Resend mail now (see resend-inbound-webhook, send-email, and
  // gmail-sync-to-db, which all write here). The previous live
  // resend-receive-emails fetch and the separate GmailInbox live view are
  // gone — everything reads from this one table instead.
  const [adminEmails, setAdminEmails] = useState<any[]>([]);

  // Which specific mailbox is active — the real switcher. activeAccount
  // (gmail/resend) is derived from it below, kept only because the
  // filtering/JSX logic further down already branches on it.
  const [availableMailboxes, setAvailableMailboxes] = useState<AvailableMailbox[]>([]);
  const [mailboxesLoading, setMailboxesLoading] = useState(true);
  const [activeMailbox, setActiveMailbox] = useState<string | null>(null);
  const [showEmailLogin, setShowEmailLogin] = useState(true);
  const [connectingEmail, setConnectingEmail] = useState<string | null>(null);
  const [disconnectingEmail, setDisconnectingEmail] = useState<string | null>(null);

  const activeAccount: EmailAccount = useMemo(() => {
    const match = availableMailboxes.find(m => m.mailbox_email === activeMailbox);
    return match?.mailbox_provider === 'gmail' ? 'gmail' : 'resend';
  }, [availableMailboxes, activeMailbox]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [syncingGmail, setSyncingGmail] = useState(false);

  const fetchAllAdminEmails = useCallback(async () => {
    const { data } = await supabase
      .from('admin_emails')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAdminEmails(data);
  }, []);

  const fetchAvailableMailboxes = useCallback(async () => {
    if (!user) return;
    setMailboxesLoading(true);
    const { data, error } = await supabase.rpc('get_available_mailboxes', { _user_id: user.id });
    if (!error && data) {
      const mailboxes = data as AvailableMailbox[];
      setAvailableMailboxes(mailboxes);

      const saved = localStorage.getItem(ACTIVE_MAILBOX_KEY);
      const savedStillValid = saved && mailboxes.some(m => m.mailbox_email === saved);
      if (savedStillValid) {
        setActiveMailbox(saved);
        setShowEmailLogin(false);
      } else {
        // Either nothing was saved yet, or whatever was saved is no longer
        // in this admin's authorized list (access was changed/revoked) —
        // either way, back to the login screen rather than silently
        // falling through to some other mailbox.
        setActiveMailbox(null);
        setShowEmailLogin(true);
        if (saved) localStorage.removeItem(ACTIVE_MAILBOX_KEY);
      }
    }
    setMailboxesLoading(false);
  }, [user]);

  const selectMailbox = useCallback((mailboxEmail: string) => {
    setActiveMailbox(mailboxEmail);
    localStorage.setItem(ACTIVE_MAILBOX_KEY, mailboxEmail);
    setShowEmailLogin(false);
    setSelectedEmailId(null);
    setSearchTerm('');
  }, []);

  const connectGmail = async (mailboxEmail: string) => {
    const allowed = await hasMailboxAccess(mailboxEmail, 'gmail');
    if (!allowed && !hasPermission('admin:all')) {
      toast.error('You do not have permission to connect this mailbox.');
      return;
    }

    setConnectingEmail(mailboxEmail);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-oauth-start');
      if (error || !data?.url) throw new Error(error?.message || 'Could not start Gmail connection');
      window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || 'Could not start Gmail connection');
      setConnectingEmail(null);
    }
  };

  const disconnectGmail = async (mailboxEmail: string) => {
    setDisconnectingEmail(mailboxEmail);
    try {
      const { error } = await supabase.functions.invoke('gmail-oauth-disconnect', {
        body: { mailboxEmail },
      });
      if (error) throw error;
      toast.success(`Signed out of ${mailboxEmail}`);
      if (activeMailbox === mailboxEmail) {
        setActiveMailbox(null);
        localStorage.removeItem(ACTIVE_MAILBOX_KEY);
        setShowEmailLogin(true);
      }
      fetchAvailableMailboxes();
    } catch (e: any) {
      toast.error(e.message || 'Could not disconnect this account');
    } finally {
      setDisconnectingEmail(null);
    }
  };

  const syncGmailNow = async (mailboxEmail: string) => {
    const allowed = await hasMailboxAccess(mailboxEmail, 'gmail');
    if (!allowed && !hasPermission('admin:all')) {
      toast.error('You do not have permission to sync this mailbox.');
      return;
    }

    setSyncingGmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync-to-db', {
        body: { maxPerLabel: 25, mailboxEmail },
      });
      if (error) throw error;
      if (data?.scopeRestricted) {
        toast.error('Gmail connection only has limited access — reconnect Gmail for full mail sync.');
      } else {
        toast.success(`Synced ${data?.synced ?? 0} Gmail messages`);
      }
      fetchAllAdminEmails();
    } catch (e: any) {
      toast.error(e.message || 'Gmail sync failed');
    } finally {
      setSyncingGmail(false);
    }
  };

  useEffect(() => {
    fetchAvailableMailboxes();

    // Handle the redirect back from gmail-oauth-callback.
    const connected = searchParams.get('gmail_connected');
    const connectedEmail = searchParams.get('gmail_email');
    const gmailError = searchParams.get('gmail_error');
    if (connected && connectedEmail) {
      toast.success(`Gmail connected: ${connectedEmail}`);
      selectMailbox(connectedEmail);
      fetchAvailableMailboxes();
      syncGmailNow(connectedEmail);
    } else if (gmailError) {
      const attemptedEmail = searchParams.get('gmail_attempted_email');
      const messages: Record<string, string> = {
        missing_code_or_state: 'Gmail connection was cancelled or incomplete.',
        invalid_or_expired_state: 'That connection link expired — try connecting again.',
        expired_state: 'That connection link expired — try connecting again.',
        token_exchange_failed: 'Google rejected the connection request. Try again.',
        profile_fetch_failed: 'Connected, but could not read the Gmail account details.',
        mailbox_not_authorized: attemptedEmail
          ? `You signed into ${attemptedEmail} on Google, but you're not authorized for that mailbox. Ask an administrator for access, or sign into an account you're already authorized for.`
          : "You're not authorized for that Gmail account.",
        no_refresh_token:
          'Google did not grant lasting access — disconnect this app in your Google Account security settings, then try connecting again.',
        storage_failed: 'Connected, but saving the connection failed. Try again.',
        unexpected_error: 'Something went wrong connecting Gmail. Try again.',
      };
      toast.error(messages[gmailError] || `Gmail connection failed: ${gmailError}`);
    }
    if (connected || gmailError) {
      searchParams.delete('gmail_connected');
      searchParams.delete('gmail_email');
      searchParams.delete('gmail_error');
      searchParams.delete('gmail_attempted_email');
      setSearchParams(searchParams, { replace: true });
    }

    refreshAll();
    fetchAllAdminEmails();
    const ch = supabase
      .channel('admin-emails-gmail')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_emails' }, fetchAllAdminEmails)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resizable column handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = listWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(250, Math.min(700, startWidth + e.clientX - startX));
      setListWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [listWidth]);

  // Normalize all emails into UnifiedEmail
  const allUnifiedEmails: UnifiedEmail[] = useMemo(() => {
    const fromAdminEmails: UnifiedEmail[] = adminEmails.map(e => ({
      id: e.id,
      from_email: e.from_email,
      from_name: e.from_name || '',
      to_email: e.to_email,
      to_name: e.to_name || '',
      subject: e.subject || '',
      body: e.body || '',
      html: e.html || undefined,
      created_at: e.created_at,
      is_read: e.is_read,
      is_starred: e.is_starred,
      folder: e.folder,
      source: e.source,
      has_attachments: Array.isArray(e.attachments) && e.attachments.length > 0,
      _original: e,
    }));

    const fromContactMessages: UnifiedEmail[] = inboxMessages.map(m => ({
      id: `cm-${m.id}`,
      from_email: m.email,
      from_name: m.name,
      to_email: 'admin@pwanbridgefort.ng',
      to_name: 'Admin',
      subject: m.subject,
      body: m.message,
      created_at: m.created_at,
      is_read: m.responded,
      is_starred: false,
      folder: 'inbox',
      source: 'contact_form',
      _original: m,
    }));

    const fromEmailLogs: UnifiedEmail[] = sentEmails.map(e => ({
      id: `log-${e.id}`,
      from_email: 'noreply@bridgeforthomes.com',
      from_name: 'Bridgefort Homes Development Ltd',
      to_email: e.recipient_email,
      to_name: e.recipient_name || '',
      subject: e.subject,
      body: e.body,
      created_at: e.sent_at,
      is_read: true,
      is_starred: false,
      folder: 'sent',
      source: 'email_log',
      _original: e,
    }));

    return [...fromAdminEmails, ...fromContactMessages, ...fromEmailLogs];
  }, [adminEmails, inboxMessages, sentEmails]);

  // Dedup
  const deduped = useMemo(() => {
    const seen = new Map<string, UnifiedEmail>();
    const sorted = [...allUnifiedEmails].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    sorted.forEach(e => {
      const key = `${e.from_email}|${e.subject}|${e.to_email}`;
      const existing = seen.get(key);
      if (existing) {
        const timeDiff = Math.abs(new Date(existing.created_at).getTime() - new Date(e.created_at).getTime());
        if (timeDiff < 5000) return;
      }
      seen.set(`${key}|${e.id}`, e);
    });
    return Array.from(seen.values());
  }, [allUnifiedEmails]);

  const getThreadId = (subject: string) => subject.replace(/^(re|fwd|fw):\s*/gi, '').trim().toLowerCase();

  const folderEmails = useMemo(() => {
    // Exact mailbox match now that we know precisely which address is
    // active — replaces the old coarse gmail-vs-everything-else split.
    // to_email covers received mail, from_email covers sent (an outbound
    // message's to_email is the external recipient, not us).
    let filtered = activeMailbox
      ? deduped.filter((e) => e.to_email === activeMailbox || e.from_email === activeMailbox)
      : [];

    switch (activeFolder) {
      case 'inbox': filtered = filtered.filter(e => e.folder === 'inbox'); break;
      case 'sent': filtered = filtered.filter(e => e.folder === 'sent'); break;
      case 'drafts': filtered = filtered.filter(e => e.folder === 'drafts'); break;
      case 'starred': filtered = filtered.filter(e => e.is_starred); break;
      case 'spam': filtered = filtered.filter(e => e.folder === 'spam'); break;
      case 'archive': filtered = filtered.filter(e => e.folder === 'archive'); break;
      case 'trash': filtered = filtered.filter(e => e.folder === 'trash'); break;
      default: filtered = [];
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.subject.toLowerCase().includes(s) ||
        e.from_email.toLowerCase().includes(s) ||
        e.from_name.toLowerCase().includes(s) ||
        e.body.toLowerCase().includes(s)
      );
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [deduped, activeFolder, activeMailbox, searchTerm]);

  const selectedEmail = folderEmails.find(e => e.id === selectedEmailId) || null;
  const threadEmails = useMemo(() => {
    if (!selectedEmail) return [];
    const tid = getThreadId(selectedEmail.subject);
    return deduped
      .filter(e => getThreadId(e.subject) === tid && (e.from_email === selectedEmail.from_email || e.to_email === selectedEmail.from_email || e.from_email === selectedEmail.to_email))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [selectedEmail, deduped]);

  const accountEmails = useMemo(
    () => (activeMailbox ? deduped.filter((e) => e.to_email === activeMailbox || e.from_email === activeMailbox) : []),
    [deduped, activeMailbox]
  );

  const counts = useMemo(() => ({
    inbox: accountEmails.filter(e => e.folder === 'inbox').length,
    unread: accountEmails.filter(e => e.folder === 'inbox' && !e.is_read).length,
    starred: accountEmails.filter(e => e.is_starred).length,
    sent: accountEmails.filter(e => e.folder === 'sent').length,
    drafts: accountEmails.filter(e => e.folder === 'drafts').length,
    spam: accountEmails.filter(e => e.folder === 'spam').length,
    archive: accountEmails.filter(e => e.folder === 'archive').length,
    trash: accountEmails.filter(e => e.folder === 'trash').length,
    contacts: contacts.length,
  }), [accountEmails, contacts]);

  // Actions
  const toggleStar = async (email: UnifiedEmail) => {
    if (email.id.startsWith('cm-') || email.id.startsWith('log-') || email.id.startsWith('resend-')) {
      toast.info('Star is available for admin emails');
      return;
    }
    await supabase.from('admin_emails').update({ is_starred: !email.is_starred }).eq('id', email.id);
    fetchAllAdminEmails();
  };

  const moveToFolder = async (email: UnifiedEmail, folder: string) => {
    if (email.id.startsWith('cm-')) {
      if (folder === 'trash') { await deleteMessage(email._original.id); toast.success('Message deleted'); }
      return;
    }
    if (email.id.startsWith('log-')) {
      if (folder === 'trash') { await deleteEmailLog(email._original.id); toast.success('Email log deleted'); }
      return;
    }
    if (email.id.startsWith('resend-')) { toast.info('Cannot move Resend emails'); return; }
    await supabase.from('admin_emails').update({ folder }).eq('id', email.id);
    toast.success(`Moved to ${folder}`);
    fetchAllAdminEmails();
    if (selectedEmailId === email.id) setSelectedEmailId(null);
  };

  const markRead = async (email: UnifiedEmail) => {
    if (email.id.startsWith('cm-') || email.id.startsWith('log-') || email.id.startsWith('resend-')) return;
    await supabase.from('admin_emails').update({ is_read: !email.is_read }).eq('id', email.id);
    fetchAllAdminEmails();
  };

  const handleSelectEmail = (email: UnifiedEmail) => {
    setSelectedEmailId(email.id);
    if (!email.is_read && !email.id.startsWith('cm-') && !email.id.startsWith('log-')) {
      supabase.from('admin_emails').update({ is_read: true }).eq('id', email.id).then(() => fetchAllAdminEmails());
    }
  };

  const handleComposeSend = async (to: string, name: string, subj: string, body: string, cc?: string, bcc?: string) => {
    if (!to || !subj || !body) {
      toast.error('Fill in all required fields');
      return { success: false, error: 'Missing fields' };
    }
    if (!activeMailbox) {
      toast.error('No mailbox selected');
      return { success: false, error: 'No mailbox selected' };
    }

    let result: { success: boolean; error?: string };
    if (activeAccount === 'gmail') {
      const { error } = await supabase.functions.invoke('gmail-sync', {
        body: { action: 'send-message', mailboxEmail: activeMailbox, to, subject: subj, html: body, cc, bcc },
      });
      result = error ? { success: false, error: error.message } : { success: true };
    } else {
      // send-email (Resend) already writes its own Sent-folder record to
      // admin_emails after a successful send — same for gmail-sync's
      // send-message above — so there's no manual insert needed here
      // anymore. There used to be one; it would have created a duplicate
      // "sent" entry alongside the one the edge function now writes itself.
      result = await sendEmail(to, subj, body, name, activeMailbox);

      // CC/BCC only make sense for the Resend path today — Gmail's raw MIME
      // send above already supports them natively via the cc/bcc fields.
      if (result.success && cc) {
        const ccEmails = cc.split(',').map(e => e.trim()).filter(Boolean);
        for (const ccEmail of ccEmails) await sendEmail(ccEmail, subj, body, '', activeMailbox);
      }
      if (result.success && bcc) {
        const bccEmails = bcc.split(',').map(e => e.trim()).filter(Boolean);
        for (const bccEmail of bccEmails) await sendEmail(bccEmail, subj, body, '', activeMailbox);
      }
    }

    if (result.success) {
      toast.success('Email sent!');
      fetchAllAdminEmails();
    } else {
      toast.error(result.error || 'Failed to send');
    }
    return result;
  };

  const handleSaveDraft = async (to: string, name: string, subj: string, body: string) => {
    await supabase.from('admin_emails').insert({
      from_email: 'noreply@bridgeforthomes.com',
      from_name: 'Bridgefort Homes Development Ltd',
      to_email: to || 'draft',
      to_name: name || null,
      subject: subj || '(No Subject)',
      body: body || '',
      folder: 'drafts',
      is_read: true,
      source: 'draft',
    });
    toast.success('Draft saved');
    fetchAllAdminEmails();
  };

  const handleReply = async (email: UnifiedEmail, subj: string, body: string) => {
    if (email.id.startsWith('cm-')) {
      const result = await replyToMessage(email._original, subj, body);
      if (result.success) toast.success('Reply sent');
      else toast.error(result.error || 'Failed');
      return result;
    }
    return handleComposeSend(email.from_email, email.from_name, subj, body);
  };

  const handleForward = async (email: UnifiedEmail, to: string, subj: string, body: string) => {
    return handleComposeSend(to, '', subj, body);
  };

  const handleSelectContact = (contact: any) => {
    setComposeInitial({
      to: contact.email || '',
      name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
      subject: '',
      body: '',
    });
    setComposeOpen(true);
  };

  const handleOpenDraft = (email: UnifiedEmail) => {
    setComposeInitial({
      to: email.to_email === 'draft' ? '' : email.to_email,
      name: email.to_name || '',
      subject: email.subject,
      body: email.body,
    });
    setComposeOpen(true);
    if (!email.id.startsWith('cm-') && !email.id.startsWith('log-') && !email.id.startsWith('resend-')) {
      supabase.from('admin_emails').delete().eq('id', email.id).then(() => fetchAllAdminEmails());
    }
  };

  const handleRefresh = () => {
    refreshAll();
    fetchAllAdminEmails();
    if (activeAccount === 'gmail' && activeMailbox) syncGmailNow(activeMailbox);
  };

  const isToolView = ['contacts', 'templates', 'bulk'].includes(activeFolder);

  // The spec's "Email Login screen" — clicking into Email Center lands
  // here first, not an inbox. Shown until a mailbox is picked, and
  // reachable again any time via "Switch account" below.
  if (showEmailLogin || !activeMailbox) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] h-auto gap-3 p-3 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/15 shadow-2xl">
        <EmailLoginScreen
          mailboxes={availableMailboxes}
          loading={mailboxesLoading}
          activeMailbox={activeMailbox}
          connectingEmail={connectingEmail}
          disconnectingEmail={disconnectingEmail}
          onSelect={selectMailbox}
          onConnectGmail={connectGmail}
          onDisconnectGmail={disconnectGmail}
        />
      </div>
    );
  }

  return (
    <div className={`flex min-h-[calc(100vh-8rem)] h-auto gap-3 p-3 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/15 shadow-2xl ${isResizing ? 'select-none' : ''}`}>
      {/* Sidebar */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg p-3 hidden md:block">
        <GmailSidebar
          activeFolder={activeFolder}
          onFolderChange={(f) => { setActiveFolder(f); setSelectedEmailId(null); setSearchTerm(''); setFullViewEmail(false); }}
          onCompose={() => { setComposeInitial({ to: '', name: '', subject: '', body: '' }); setComposeOpen(true); }}
          counts={counts}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 shrink-0 bg-white/40">
          <select
            value={activeFolder}
            onChange={(e) => { setActiveFolder(e.target.value as EmailFolder); setSelectedEmailId(null); }}
            className="md:hidden h-9 rounded-full border border-input bg-white/70 px-3 text-sm"
          >
            {['inbox','starred','sent','drafts','spam','archive','trash','contacts','templates','bulk'].map(f => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>

          {!isToolView && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 rounded-full bg-white/70 border-white/50 shadow-sm"
              />
            </div>
          )}
          <div className="flex-1" />

          {/* Current mailbox + switcher — replaces the old binary
              Resend/Gmail toggle now that there can be several mailboxes
              per provider. Opens the same Email Login screen to change. */}
          <button
            onClick={() => setShowEmailLogin(true)}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors max-w-[220px]"
            title="Switch account"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{activeMailbox}</span>
            <LogOut className="h-3 w-3 shrink-0 opacity-50" />
          </button>

          {activeAccount === 'gmail' && (
            <Button size="sm" variant="default" onClick={() => syncGmailNow(activeMailbox)} disabled={syncingGmail} className="gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white">
              <RefreshCw className={`h-3.5 w-3.5 ${syncingGmail ? 'animate-spin' : ''}`} />
              Sync Gmail
            </Button>
          )}

          <Button variant="secondary" size="icon" className="rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <AdminEmailSettings />
          {counts.unread > 0 && (
            <Badge variant="destructive" className="text-xs rounded-full">{counts.unread} unread</Badge>
          )}
        </div>

        {/* Tool views */}
        {activeFolder === 'contacts' && (
          <ScrollArea className="flex-1 p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" /> Contacts ({contacts.length})
            </h3>
            {contacts.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No contacts found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {contacts.filter(c => c.email).map(contact => (
                  <div key={contact.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate text-sm">
                          {contact.first_name || contact.last_name
                            ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                            : 'No Name'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 w-full text-xs" onClick={() => handleSelectContact(contact)}>
                      <Mail className="h-3 w-3 mr-1" /> Email
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {activeFolder === 'templates' && (
          <ScrollArea className="flex-1 p-4">
            <AdminEmailTemplates
              onSelectTemplate={(template) => {
                setComposeInitial({ to: '', name: '', subject: template.subject, body: template.body });
                setComposeOpen(true);
                toast.success('Template loaded');
              }}
            />
          </ScrollArea>
        )}

        {activeFolder === 'bulk' && (
          <ScrollArea className="flex-1 p-4">
            <AdminBulkEmail />
          </ScrollArea>
        )}

        {/* Email list + reading pane */}
        {!isToolView && (
          <div className="flex-1 flex min-h-0">
            {/* Email list - resizable */}
            {!fullViewEmail && (
              <>
                <div
                  className={`${selectedEmailId ? 'hidden md:flex' : 'flex'} flex-col shrink-0 border-r border-border`}
                  style={{ width: selectedEmailId ? listWidth : '100%', maxWidth: selectedEmailId ? '60%' : '100%' }}
                >
                  <ScrollArea className="h-auto">
                    {loading && folderEmails.length === 0 ? (
                      <div className="p-4 space-y-3">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : folderEmails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Inbox className="h-12 w-12 mb-3 opacity-30" />
                        <p>No emails in {activeFolder}</p>
                      </div>
                    ) : (
                      folderEmails.map(email => (
                        <EmailListItem
                          key={email.id}
                          email={email}
                          isSelected={selectedEmailId === email.id}
                          isChecked={checkedIds.has(email.id)}
                          onSelect={() => {
                            if (activeFolder === 'drafts') {
                              handleOpenDraft(email);
                            } else {
                              handleSelectEmail(email);
                            }
                          }}
                          onCheck={(c) => {
                            setCheckedIds(prev => {
                              const next = new Set(prev);
                              c ? next.add(email.id) : next.delete(email.id);
                              return next;
                            });
                          }}
                          onStar={() => toggleStar(email)}
                        />
                      ))
                    )}
                  </ScrollArea>
                </div>

                {/* Resizable divider */}
                {selectedEmailId && (
                  <div
                    className="hidden md:flex w-1.5 cursor-col-resize items-center justify-center hover:bg-primary/20 transition-colors shrink-0"
                    onMouseDown={handleMouseDown}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </>
            )}

            {/* Reading pane */}
            <div className={`${selectedEmailId ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
              <EmailReadingPane
                email={selectedEmail}
                threadEmails={threadEmails}
                onBack={() => { setSelectedEmailId(null); setFullViewEmail(false); }}
                onReply={handleReply}
                onForward={handleForward}
                onStar={toggleStar}
                onArchive={(e) => moveToFolder(e, 'archive')}
                onDelete={(e) => moveToFolder(e, 'trash')}
                onMarkRead={markRead}
                sending={sending}
                isFullView={fullViewEmail}
                onToggleFullView={() => setFullViewEmail(!fullViewEmail)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Compose dialog */}
      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSend={handleComposeSend}
        onSaveDraft={handleSaveDraft}
        onDiscard={() => {}}
        sending={sending}
        initialTo={composeInitial.to}
        initialName={composeInitial.name}
        initialSubject={composeInitial.subject}
        initialBody={composeInitial.body}
      />
    </div>
  );
}
