import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Reply, ReplyAll, Forward, Star, Archive, Trash2, ArrowLeft,
  Clock, Paperclip, User, Send, RefreshCw, MailOpen, Download,
  Maximize2, Minimize2, Printer, MoreVertical, Eye
} from 'lucide-react';
import { UnifiedEmail } from './EmailListItem';

interface EmailReadingPaneProps {
  email: UnifiedEmail | null;
  threadEmails?: UnifiedEmail[];
  onBack: () => void;
  onReply: (email: UnifiedEmail, subject: string, body: string) => Promise<{ success: boolean; error?: string }>;
  onForward: (email: UnifiedEmail, to: string, subject: string, body: string) => Promise<{ success: boolean; error?: string }>;
  onStar: (email: UnifiedEmail) => void;
  onArchive: (email: UnifiedEmail) => void;
  onDelete: (email: UnifiedEmail) => void;
  onMarkRead: (email: UnifiedEmail) => void;
  sending: boolean;
  isFullView?: boolean;
  onToggleFullView?: () => void;
}

type ReplyMode = null | 'reply' | 'reply-all' | 'forward';

const EmailReadingPane: React.FC<EmailReadingPaneProps> = ({
  email, threadEmails, onBack, onReply, onForward, onStar, onArchive, onDelete, onMarkRead, sending,
  isFullView, onToggleFullView
}) => {
  const [mode, setMode] = useState<ReplyMode>(null);
  const [replyBody, setReplyBody] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<string | null>(null);

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <MailOpen className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg">Select an email to read</p>
      </div>
    );
  }

  const handleReply = () => {
    setMode('reply');
    setReplySubject(`Re: ${email.subject}`);
    setReplyBody('');
  };
  const handleReplyAll = () => {
    setMode('reply-all');
    setReplySubject(`Re: ${email.subject}`);
    setReplyBody('');
  };
  const handleForward = () => {
    setMode('forward');
    setReplySubject(`Fwd: ${email.subject}`);
    setReplyBody(`\n\n---------- Forwarded message ----------\nFrom: ${email.from_name || email.from_email}\nDate: ${format(new Date(email.created_at), 'PPp')}\nSubject: ${email.subject}\n\n${email.body}`);
    setForwardTo('');
  };

  const handleSend = async () => {
    if (mode === 'reply' || mode === 'reply-all') {
      const result = await onReply(email, replySubject, replyBody);
      if (result.success) { setMode(null); setReplyBody(''); }
    } else if (mode === 'forward') {
      const result = await onForward(email, forwardTo, replySubject, replyBody);
      if (result.success) { setMode(null); setReplyBody(''); setForwardTo(''); }
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>${email.subject}</title></head><body>
        <h2>${email.subject}</h2>
        <p><strong>From:</strong> ${email.from_name || email.from_email} &lt;${email.from_email}&gt;</p>
        <p><strong>To:</strong> ${email.to_name || email.to_email}</p>
        <p><strong>Date:</strong> ${format(new Date(email.created_at), 'PPpp')}</p>
        <hr/>
        ${email.html || `<pre>${email.body}</pre>`}
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const allEmails = threadEmails && threadEmails.length > 1 ? threadEmails : [email];

  // Extract attachments from original email data
  const attachments = email._original?.attachments || [];

  const handleDownloadAttachment = (attachment: any) => {
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.filename || 'attachment';
      link.click();
    }
  };

  const isPreviewable = (filename: string) => {
    const ext = filename?.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf'].includes(ext || '');
  };

  const content = (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border shrink-0 flex-wrap">
        <Button variant="ghost" size="icon" onClick={onBack} title="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onArchive(email)} title="Archive">
          <Archive className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(email)} title="Delete" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onMarkRead(email)} title="Mark as read/unread">
          <MailOpen className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handlePrint} title="Print">
          <Printer className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" onClick={() => onStar(email)} title="Star">
          <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </Button>
        {onToggleFullView && (
          <Button variant="ghost" size="icon" onClick={onToggleFullView} title={isFullView ? 'Exit full view' : 'Full view'}>
            {isFullView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Subject */}
      <div className="px-6 py-4 border-b border-border shrink-0">
        <h2 className="text-xl font-semibold text-foreground">{email.subject || '(No Subject)'}</h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="secondary" className="text-xs">{email.folder}</Badge>
          {email.source !== 'manual' && <Badge variant="outline" className="text-xs">{email.source}</Badge>}
          {allEmails.length > 1 && <Badge variant="outline" className="text-xs">{allEmails.length} messages</Badge>}
        </div>
      </div>

      {/* Thread / Body */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {allEmails.map((e) => (
            <div key={e.id} className="px-6 py-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{e.from_name || e.from_email}</span>
                    <span className="text-sm text-muted-foreground">&lt;{e.from_email}&gt;</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
                    <span>to {e.to_name || e.to_email}</span>
                    <span className="mx-1">·</span>
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(e.created_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReply} title="Reply">
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleForward} title="Forward">
                    <Forward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {e.html ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none ml-13"
                  dangerouslySetInnerHTML={{ __html: e.html }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans ml-13">
                  {e.body}
                </pre>
              )}
            </div>
          ))}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="px-6 py-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> {attachments.length} Attachment{attachments.length > 1 ? 's' : ''}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {attachments.map((att: any, i: number) => (
                <div key={i} className="border border-border rounded-lg p-3 flex flex-col gap-2">
                  <div className="text-sm font-medium truncate">{att.filename || 'Attachment'}</div>
                  {att.content_type && <div className="text-xs text-muted-foreground">{att.content_type}</div>}
                  <div className="flex gap-2">
                    {isPreviewable(att.filename) && att.url && (
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setPreviewAttachment(att.url)}>
                        <Eye className="h-3 w-3" /> Preview
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleDownloadAttachment(att)}>
                      <Download className="h-3 w-3" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply / Forward area */}
        {mode === null ? (
          <div className="px-6 py-4 flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleReply} className="gap-1">
              <Reply className="h-4 w-4" /> Reply
            </Button>
            <Button variant="outline" size="sm" onClick={handleReplyAll} className="gap-1">
              <ReplyAll className="h-4 w-4" /> Reply All
            </Button>
            <Button variant="outline" size="sm" onClick={handleForward} className="gap-1">
              <Forward className="h-4 w-4" /> Forward
            </Button>
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-border space-y-3">
            <div className="flex items-center gap-2">
              {mode === 'forward' ? <Forward className="h-4 w-4 text-primary" /> : <Reply className="h-4 w-4 text-primary" />}
              <span className="font-medium text-foreground">
                {mode === 'reply' ? 'Reply' : mode === 'reply-all' ? 'Reply All' : 'Forward'}
              </span>
            </div>
            {mode === 'forward' && (
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">To</Label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  className="h-9"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Subject</Label>
              <Input
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="h-9"
              />
            </div>
            <Textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={mode === 'forward' ? 'Add a message...' : 'Type your reply...'}
              rows={6}
            />
            <div className="flex gap-2">
              <Button onClick={handleSend} disabled={sending || (!replyBody.trim() && mode !== 'forward') || (mode === 'forward' && !forwardTo.trim())} className="gap-1">
                {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
              <Button variant="ghost" onClick={() => setMode(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Attachment preview dialog */}
      <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {previewAttachment && (
            previewAttachment.endsWith('.pdf') ? (
              <iframe src={previewAttachment} className="w-full h-[80vh]" />
            ) : (
              <img src={previewAttachment} alt="Attachment preview" className="max-w-full max-h-[80vh] object-contain mx-auto" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  return content;
};

export default EmailReadingPane;
