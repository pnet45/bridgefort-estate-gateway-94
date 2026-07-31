import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Inbox, Send, FileText, Star, AlertOctagon, Trash2, Tag,
  RefreshCw, Search, ArrowLeft, Paperclip, Download, Archive, MailOpen,
} from 'lucide-react';

interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  messagesUnread?: number;
  messagesTotal?: number;
}

interface GmailMessageSummary {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  is_unread: boolean;
}

interface GmailMessageFull extends GmailMessageSummary {
  html: string;
  text: string;
  attachments: { id: string; filename: string; content_type: string; size: number }[];
  scopeRestricted?: boolean;
  scopeRestrictedMessage?: string;
}

const SYSTEM_ICON: Record<string, React.ElementType> = {
  INBOX: Inbox,
  SENT: Send,
  DRAFT: FileText,
  STARRED: Star,
  SPAM: AlertOctagon,
  TRASH: Trash2,
};

const SANITIZE = {
  ALLOWED_TAGS: ['p','h1','h2','h3','h4','h5','h6','ul','ol','li','strong','em','a','img','span','br','div','table','thead','tbody','tr','td','th','blockquote','code','pre','hr'],
  ALLOWED_ATTR: ['href','src','alt','title','class','style','target','rel'],
  FORBID_TAGS: ['script','style','iframe','object','embed','form','input'],
  FORBID_ATTR: ['onerror','onload','onclick','onmouseover'],
};

function friendlyLabelName(name: string) {
  if (name.startsWith('CATEGORY_')) {
    const rest = name.replace('CATEGORY_', '').toLowerCase();
    return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  return name.charAt(0) + name.slice(1).toLowerCase();
}

export default function GmailInbox() {
  const [labels, setLabels] = useState<GmailLabel[]>([]);
  const [activeLabel, setActiveLabel] = useState<string>('INBOX');
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selected, setSelected] = useState<GmailMessageFull | null>(null);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [query, setQuery] = useState('');
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyMode, setReplyMode] = useState<null | 'reply' | 'forward'>(null);
  const [replyTo, setReplyTo] = useState('');
  const [replyCc, setReplyCc] = useState('');
  const [replyBcc, setReplyBcc] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchLabels = useCallback(async () => {
    setLoadingLabels(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: { action: 'list-labels' },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to load labels');
      setLabels(data.data || []);
    } catch (e: any) {
      setError(e.message);
      toast.error(`Gmail labels: ${e.message}`);
    } finally {
      setLoadingLabels(false);
    }
  }, []);

  const fetchMessages = useCallback(async (labelId: string, q: string, token: string | null) => {
    setLoadingMessages(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: {
          action: 'list-messages',
          labelIds: labelId ? [labelId] : undefined,
          q: q || undefined,
          pageToken: token || undefined,
          maxResults: 25,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to load messages');
      setMessages(data.data?.messages || []);
      setNextPageToken(data.data?.nextPageToken || null);
    } catch (e: any) {
      setError(e.message);
      toast.error(`Gmail messages: ${e.message}`);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => { fetchLabels(); }, [fetchLabels]);
  useEffect(() => {
    fetchMessages(activeLabel, query, pageToken);
    setSelected(null);
  }, [activeLabel, pageToken]);

  const openMessage = async (id: string) => {
    setLoadingMessage(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: { action: 'get-message', messageId: id },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed');
      setSelected(data.data);
      // Auto-mark read
      if (data.data?.labelIds?.includes('UNREAD')) {
        await supabase.functions.invoke('gmail-sync', {
          body: { action: 'modify-message', messageId: id, removeLabelIds: ['UNREAD'] },
        });
        setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_unread: false } : m));
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingMessage(false);
    }
  };

  const sendGmailMessage = async (to: string, subject: string, body: string, cc?: string, bcc?: string) => {
    setSendingReply(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: {
          action: 'send-message',
          to,
          subject,
          html: body,
          cc: cc || undefined,
          bcc: bcc || undefined,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send Gmail message');
      toast.success('Message sent');
      setReplyMode(null);
      setReplyCc('');
      setReplyBcc('');
      setReplyBody('');
      setReplySubject('');
      setReplyTo('');
      setSelected(null);
      fetchMessages(activeLabel, query, pageToken);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSendingReply(false);
    }
  };

  const replyToMessage = (mode: 'reply' | 'forward') => {
    if (!selected) return;
    setReplyMode(mode);
    setReplyTo(selected.from);
    setReplyCc('');
    setReplyBcc('');
    if (mode === 'reply') {
      setReplySubject(`Re: ${selected.subject}`);
      setReplyBody('');
    } else {
      setReplySubject(`Fwd: ${selected.subject}`);
      setReplyBody(`
<div><br></div>
<hr>
<div><strong>Forwarded message</strong></div>
<div><strong>From:</strong> ${selected.from}</div>
<div><strong>To:</strong> ${selected.to}</div>
<div><strong>Date:</strong> ${selected.date}</div>
<div><strong>Subject:</strong> ${selected.subject}</div>
<div><br></div>
<div>${selected.html ? selected.html : `<pre>${selected.text || selected.snippet}</pre>`}</div>
`);
    }
  };

  const trashMessage = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync', { body: { action: 'trash-message', messageId: id } });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to trash message');
      toast.success('Moved to Trash');
      setSelected(null);
      fetchMessages(activeLabel, query, pageToken);
    } catch (e: any) { toast.error(e.message); }
  };

  const archiveMessage = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: { action: 'modify-message', messageId: id, removeLabelIds: ['INBOX'] },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to archive message');
      toast.success('Archived');
      setSelected(null);
      fetchMessages(activeLabel, query, pageToken);
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleRead = async (msg: GmailMessageFull) => {
    const unread = msg.labelIds.includes('UNREAD');
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: {
          action: 'modify-message', messageId: msg.id,
          [unread ? 'removeLabelIds' : 'addLabelIds']: ['UNREAD'],
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to update message');
      setSelected({ ...msg, labelIds: unread ? msg.labelIds.filter(l => l !== 'UNREAD') : [...msg.labelIds, 'UNREAD'] });
      fetchMessages(activeLabel, query, pageToken);
    } catch (e: any) { toast.error(e.message); }
  };

  const downloadAttachment = async (att: { id: string; filename: string; content_type: string }) => {
    if (!selected) return;
    try {
      const { data, error } = await supabase.functions.invoke('gmail-sync', {
        body: { action: 'get-attachment', messageId: selected.id, attachmentId: att.id },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed');
      const bin = atob(data.data.content);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: att.content_type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = att.filename; document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
    } catch (e: any) { toast.error(e.message); }
  };

  const systemLabels = useMemo(() => {
    const order = ['INBOX','STARRED','SENT','DRAFT','SPAM','TRASH'];
    return order
      .map((id) => labels.find((l) => l.id === id))
      .filter(Boolean) as GmailLabel[];
  }, [labels]);

  const categoryLabels = useMemo(
    () => labels.filter((l) => l.type === 'system' && l.id.startsWith('CATEGORY_')),
    [labels]
  );

  const userLabels = useMemo(() => labels.filter((l) => l.type === 'user'), [labels]);

  const renderLabelBtn = (l: GmailLabel) => {
    const Icon = SYSTEM_ICON[l.id] || Tag;
    const active = activeLabel === l.id;
    return (
      <button
        key={l.id}
        onClick={() => { setActiveLabel(l.id); setPageToken(null); }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-r-full text-sm transition-colors ${
          active ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left truncate">{friendlyLabelName(l.name)}</span>
        {!!l.messagesUnread && l.messagesUnread > 0 && (
          <Badge variant="destructive" className="h-5 px-1.5 text-xs">{l.messagesUnread}</Badge>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-full min-h-0">
      {/* Labels sidebar */}
      <div className="w-56 shrink-0 border-r border-border p-3 hidden md:flex flex-col">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gmail</span>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={fetchLabels} disabled={loadingLabels}>
            <RefreshCw className={`h-3.5 w-3.5 ${loadingLabels ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-0.5">{systemLabels.map(renderLabelBtn)}</div>
          {categoryLabels.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border space-y-0.5">
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase mb-1">Categories</p>
              {categoryLabels.map(renderLabelBtn)}
            </div>
          )}
          {userLabels.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border space-y-0.5">
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase mb-1">Labels</p>
              {userLabels.map(renderLabelBtn)}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
          <select
            value={activeLabel}
            onChange={(e) => { setActiveLabel(e.target.value); setPageToken(null); }}
            className="md:hidden h-9 rounded-md border border-input bg-background px-2 text-sm max-w-[40%]"
          >
            {labels.map((l) => (
              <option key={l.id} value={l.id}>{friendlyLabelName(l.name)}</option>
            ))}
          </select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Gmail (uses Gmail search syntax)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPageToken(null); fetchMessages(activeLabel, query, null); }}}
              className="pl-9 h-9 rounded-full bg-muted/50 border-0"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => fetchMessages(activeLabel, query, pageToken)} disabled={loadingMessages}>
            <RefreshCw className={`h-4 w-4 ${loadingMessages ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {error && (
          <div className="px-4 py-2 text-sm text-destructive bg-destructive/10 border-b border-destructive/20">
            {error} — Ensure the Gmail connector is linked with the required scopes.
          </div>
        )}

        {!selected ? (
          <>
            <ScrollArea className="flex-1">
              {loadingMessages && messages.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Loading…</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No messages in this folder.</div>
              ) : (
                <div>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => openMessage(m.id)}
                      className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-b border-border hover:bg-muted/40 ${
                        m.is_unread ? 'bg-muted/20' : ''
                      }`}
                    >
                      <span className={`w-48 shrink-0 truncate text-sm ${m.is_unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {m.from.replace(/<.*>/, '').trim() || m.from}
                      </span>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className={`truncate text-sm ${m.is_unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {m.subject}
                        </span>
                        <span className="text-sm text-muted-foreground truncate hidden md:inline">— {m.snippet}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {m.internalDate ? format(new Date(Number(m.internalDate)), 'MMM d') : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-2 shrink-0">
              <Button variant="outline" size="sm" disabled={!pageToken} onClick={() => setPageToken(null)}>First page</Button>
              <Button variant="outline" size="sm" disabled={!nextPageToken} onClick={() => setPageToken(nextPageToken)}>
                Next →
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-border">
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><ArrowLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => replyToMessage('reply')} title="Reply"><Send className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => replyToMessage('forward')} title="Forward"><FileText className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => archiveMessage(selected.id)} title="Archive"><Archive className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => trashMessage(selected.id)} className="text-destructive" title="Trash"><Trash2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => toggleRead(selected)} title="Toggle read"><MailOpen className="h-4 w-4" /></Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="px-6 py-4">
                <h2 className="text-xl font-semibold text-foreground mb-2">{selected.subject}</h2>
                <div className="flex flex-wrap gap-1 mb-3">
                  {selected.labelIds.map((l) => (
                    <Badge key={l} variant="outline" className="text-[10px]">{friendlyLabelName(l)}</Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  <div><strong>From:</strong> {selected.from}</div>
                  <div><strong>To:</strong> {selected.to}</div>
                  {selected.date && <div><strong>Date:</strong> {selected.date}</div>}
                </div>
                {selected.scopeRestricted && (
                  <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {selected.scopeRestrictedMessage || 'This Gmail connection only has limited access, so the full message cannot be shown.'}
                  </div>
                )}
                {selected.html ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selected.html, SANITIZE) }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm font-sans">{selected.text || selected.snippet}</pre>
                )}
                {replyMode && (
                  <div className="mt-6 p-4 border rounded-lg bg-muted/10">
                    <div className="grid gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">To</Label>
                          <Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className="mt-1 h-9" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Cc</Label>
                          <Input value={replyCc} onChange={(e) => setReplyCc(e.target.value)} className="mt-1 h-9" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Bcc</Label>
                          <Input value={replyBcc} onChange={(e) => setReplyBcc(e.target.value)} className="mt-1 h-9" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Subject</Label>
                          <Input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} className="mt-1 h-9" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Message</Label>
                        <Textarea
          maxLength={5000} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={8} className="mt-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button disabled={sendingReply || !replyTo.trim() || !replySubject.trim() || !replyBody.trim()} onClick={() => sendGmailMessage(replyTo, replySubject, replyBody, replyCc, replyBcc)}>
                          {sendingReply ? 'Sending...' : 'Send'}
                        </Button>
                        <Button variant="outline" onClick={() => setReplyMode(null)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
                {selected.attachments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Paperclip className="h-4 w-4" /> {selected.attachments.length} Attachment{selected.attachments.length > 1 ? 's' : ''}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selected.attachments.map((a) => (
                        <div key={a.id} className="border border-border rounded-lg p-3 flex flex-col gap-2">
                          <div className="text-sm font-medium truncate">{a.filename}</div>
                          <div className="text-xs text-muted-foreground">{a.content_type} · {(a.size/1024).toFixed(1)} KB</div>
                          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => downloadAttachment(a)}>
                            <Download className="h-3 w-3" /> Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
