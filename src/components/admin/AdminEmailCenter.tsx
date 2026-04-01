import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  Mail, Search, RefreshCw, Trash2, Archive, MailOpen,
  CheckSquare, Star, Users, User, Inbox, GripVertical
} from 'lucide-react';

export default function AdminEmailCenter() {
  const { user } = useAuth();
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

  // DB-backed admin_emails
  const [adminEmails, setAdminEmails] = useState<any[]>([]);
  // Resend received
  const [receivedEmails, setReceivedEmails] = useState<any[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [receivedDetails, setReceivedDetails] = useState<Record<string, any>>({});

  const fetchAllAdminEmails = useCallback(async () => {
    const { data } = await supabase
      .from('admin_emails')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAdminEmails(data);
  }, []);

  const fetchReceivedEmails = useCallback(async () => {
    setReceivedLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resend-receive-emails', {
        body: { action: 'list' },
      });
      if (error) throw error;
      const emails = data?.data?.data || (Array.isArray(data?.data) ? data.data : []);
      setReceivedEmails(emails);
    } catch {
      // silent
    } finally {
      setReceivedLoading(false);
    }
  }, []);

  const fetchReceivedDetail = useCallback(async (emailId: string) => {
    if (receivedDetails[emailId]) return;
    try {
      const { data } = await supabase.functions.invoke('resend-receive-emails', {
        body: { action: 'get', emailId },
      });
      if (data?.success) {
        setReceivedDetails(prev => ({ ...prev, [emailId]: data.data }));
      }
    } catch {}
  }, [receivedDetails]);

  useEffect(() => {
    refreshAll();
    fetchAllAdminEmails();
    fetchReceivedEmails();
    const ch = supabase
      .channel('admin-emails-gmail')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_emails' }, fetchAllAdminEmails)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
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
      from_email: 'noreply@pwanbridgefort.ng',
      from_name: 'PWAN Bridgefort',
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

    const fromResend: UnifiedEmail[] = receivedEmails.map(e => ({
      id: `resend-${e.id}`,
      from_email: e.from || '',
      from_name: e.from || '',
      to_email: e.to || 'admin@pwanbridgefort.ng',
      to_name: '',
      subject: e.subject || '(No Subject)',
      body: receivedDetails[e.id]?.text || receivedDetails[e.id]?.body || '',
      html: receivedDetails[e.id]?.html || undefined,
      created_at: e.created_at,
      is_read: false,
      is_starred: false,
      folder: 'inbox',
      source: 'resend',
      has_attachments: e.attachments?.length > 0,
      _original: e,
    }));

    return [...fromAdminEmails, ...fromContactMessages, ...fromEmailLogs, ...fromResend];
  }, [adminEmails, inboxMessages, sentEmails, receivedEmails, receivedDetails]);

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
    let filtered = deduped;
    switch (activeFolder) {
      case 'inbox': filtered = deduped.filter(e => e.folder === 'inbox'); break;
      case 'sent': filtered = deduped.filter(e => e.folder === 'sent'); break;
      case 'drafts': filtered = deduped.filter(e => e.folder === 'drafts'); break;
      case 'starred': filtered = deduped.filter(e => e.is_starred); break;
      case 'archive': filtered = deduped.filter(e => e.folder === 'archive'); break;
      case 'trash': filtered = deduped.filter(e => e.folder === 'trash'); break;
      case 'received': filtered = deduped.filter(e => e.source === 'resend'); break;
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
  }, [deduped, activeFolder, searchTerm]);

  const selectedEmail = folderEmails.find(e => e.id === selectedEmailId) || null;
  const threadEmails = useMemo(() => {
    if (!selectedEmail) return [];
    const tid = getThreadId(selectedEmail.subject);
    return deduped
      .filter(e => getThreadId(e.subject) === tid && (e.from_email === selectedEmail.from_email || e.to_email === selectedEmail.from_email || e.from_email === selectedEmail.to_email))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [selectedEmail, deduped]);

  const counts = useMemo(() => ({
    inbox: deduped.filter(e => e.folder === 'inbox').length,
    unread: deduped.filter(e => e.folder === 'inbox' && !e.is_read).length,
    starred: deduped.filter(e => e.is_starred).length,
    sent: deduped.filter(e => e.folder === 'sent').length,
    drafts: deduped.filter(e => e.folder === 'drafts').length,
    archive: deduped.filter(e => e.folder === 'archive').length,
    trash: deduped.filter(e => e.folder === 'trash').length,
    received: deduped.filter(e => e.source === 'resend').length,
    contacts: contacts.length,
  }), [deduped, contacts]);

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
    if (!email.is_read && !email.id.startsWith('cm-') && !email.id.startsWith('log-') && !email.id.startsWith('resend-')) {
      supabase.from('admin_emails').update({ is_read: true }).eq('id', email.id).then(() => fetchAllAdminEmails());
    }
    if (email.id.startsWith('resend-')) {
      fetchReceivedDetail(email._original.id);
    }
  };

  const handleComposeSend = async (to: string, name: string, subj: string, body: string, cc?: string, bcc?: string) => {
    if (!to || !subj || !body) {
      toast.error('Fill in all required fields');
      return { success: false, error: 'Missing fields' };
    }
    const result = await sendEmail(to, subj, body, name);
    if (result.success) {
      await supabase.from('admin_emails').insert({
        from_email: 'noreply@pwanbridgefort.ng',
        from_name: 'PWAN Bridgefort',
        to_email: to,
        to_name: name || null,
        subject: subj,
        body,
        folder: 'sent',
        is_read: true,
        source: 'compose',
      });
      // Send to CC recipients too
      if (cc) {
        const ccEmails = cc.split(',').map(e => e.trim()).filter(Boolean);
        for (const ccEmail of ccEmails) {
          await sendEmail(ccEmail, subj, body, '');
        }
      }
      if (bcc) {
        const bccEmails = bcc.split(',').map(e => e.trim()).filter(Boolean);
        for (const bccEmail of bccEmails) {
          await sendEmail(bccEmail, subj, body, '');
        }
      }
      toast.success('Email sent!');
      fetchAllAdminEmails();
    } else {
      toast.error(result.error || 'Failed to send');
    }
    return result;
  };

  const handleSaveDraft = async (to: string, name: string, subj: string, body: string) => {
    await supabase.from('admin_emails').insert({
      from_email: 'noreply@pwanbridgefort.ng',
      from_name: 'PWAN Bridgefort',
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
    fetchReceivedEmails();
  };

  const isToolView = ['contacts', 'templates', 'bulk'].includes(activeFolder);

  return (
    <div className={`flex h-[calc(100vh-8rem)] gap-0 rounded-xl border border-border overflow-hidden bg-background ${isResizing ? 'select-none' : ''}`}>
      {/* Sidebar */}
      <div className="border-r border-border p-3 hidden md:block">
        <GmailSidebar
          activeFolder={activeFolder}
          onFolderChange={(f) => { setActiveFolder(f); setSelectedEmailId(null); setSearchTerm(''); setFullViewEmail(false); }}
          onCompose={() => { setComposeInitial({ to: '', name: '', subject: '', body: '' }); setComposeOpen(true); }}
          counts={counts}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
          <select
            value={activeFolder}
            onChange={(e) => { setActiveFolder(e.target.value as EmailFolder); setSelectedEmailId(null); }}
            className="md:hidden h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {['inbox','starred','sent','drafts','received','archive','trash','contacts','templates','bulk'].map(f => (
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
                className="pl-9 h-9 rounded-full bg-muted/50 border-0"
              />
            </div>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading || receivedLoading}>
            <RefreshCw className={`h-4 w-4 ${loading || receivedLoading ? 'animate-spin' : ''}`} />
          </Button>
          {counts.unread > 0 && (
            <Badge variant="destructive" className="text-xs">{counts.unread} unread</Badge>
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
                  <ScrollArea className="flex-1">
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
