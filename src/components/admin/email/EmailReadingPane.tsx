import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Reply, Forward, Star, Archive, Trash2, ArrowLeft,
  Clock, Paperclip, User, Send, RefreshCw, MailOpen
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
}

type ReplyMode = null | 'reply' | 'forward';

const EmailReadingPane: React.FC<EmailReadingPaneProps> = ({
  email, threadEmails, onBack, onReply, onForward, onStar, onArchive, onDelete, onMarkRead, sending
}) => {
  const [mode, setMode] = useState<ReplyMode>(null);
  const [replyBody, setReplyBody] = useState('');
  const [forwardTo, setForwardTo] = useState('');
  const [replySubject, setReplySubject] = useState('');

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
  const handleForward = () => {
    setMode('forward');
    setReplySubject(`Fwd: ${email.subject}`);
    setReplyBody(`\n\n---------- Forwarded message ----------\nFrom: ${email.from_name || email.from_email}\nDate: ${format(new Date(email.created_at), 'PPp')}\nSubject: ${email.subject}\n\n${email.body}`);
    setForwardTo('');
  };

  const handleSend = async () => {
    if (mode === 'reply') {
      const result = await onReply(email, replySubject, replyBody);
      if (result.success) { setMode(null); setReplyBody(''); }
    } else if (mode === 'forward') {
      const result = await onForward(email, forwardTo, replySubject, replyBody);
      if (result.success) { setMode(null); setReplyBody(''); setForwardTo(''); }
    }
  };

  const allEmails = threadEmails && threadEmails.length > 1 ? threadEmails : [email];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
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
        <div className="flex-1" />
        <Button variant="ghost" size="icon" onClick={() => onStar(email)} title="Star">
          <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </Button>
      </div>

      {/* Subject */}
      <div className="px-6 py-4 border-b border-border shrink-0">
        <h2 className="text-xl font-semibold text-foreground">{email.subject || '(No Subject)'}</h2>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">{email.folder}</Badge>
          {email.source !== 'manual' && <Badge variant="outline" className="text-xs">{email.source}</Badge>}
        </div>
      </div>

      {/* Thread / Body */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {allEmails.map((e, i) => (
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
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>to {e.to_name || e.to_email}</span>
                    <span className="mx-1">·</span>
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(e.created_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>
              </div>
              {e.html ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none pl-13"
                  dangerouslySetInnerHTML={{ __html: e.html }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans pl-13">
                  {e.body}
                </pre>
              )}
            </div>
          ))}
        </div>

        {/* Reply / Forward area */}
        {mode === null ? (
          <div className="px-6 py-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReply} className="gap-1">
              <Reply className="h-4 w-4" /> Reply
            </Button>
            <Button variant="outline" size="sm" onClick={handleForward} className="gap-1">
              <Forward className="h-4 w-4" /> Forward
            </Button>
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-border space-y-3">
            <div className="flex items-center gap-2">
              {mode === 'reply' ? <Reply className="h-4 w-4 text-primary" /> : <Forward className="h-4 w-4 text-primary" />}
              <span className="font-medium text-foreground">{mode === 'reply' ? 'Reply' : 'Forward'}</span>
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
              placeholder={mode === 'reply' ? 'Type your reply...' : 'Add a message...'}
              rows={6}
            />
            <div className="flex gap-2">
              <Button onClick={handleSend} disabled={sending || (!replyBody.trim() && mode === 'reply') || (mode === 'forward' && !forwardTo.trim())} className="gap-1">
                {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
              <Button variant="ghost" onClick={() => setMode(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default EmailReadingPane;
