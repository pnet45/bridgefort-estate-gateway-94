import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

// Inbound email HTML is attacker-controlled — anyone can email the connected
// inbox — so it must be sanitized before it is rendered in an admin session.
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p','h1','h2','h3','h4','h5','h6','ul','ol','li','strong','em','a','img','span','br','div','table','thead','tbody','tr','td','th','blockquote','code','pre','hr'],
  ALLOWED_ATTR: ['href','src','alt','title','class','style','target','rel'],
  FORBID_TAGS: ['script','style','iframe','object','embed','form','input'],
  FORBID_ATTR: ['onerror','onload','onclick','onmouseover'],
};
const sanitizeHtml = (dirty: string | null) => DOMPurify.sanitize(dirty || '', SANITIZE_CONFIG);
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MailOpen, Clock, RefreshCw, Inbox as InboxIcon } from 'lucide-react';
import { format } from 'date-fns';

interface AdminEmailRow {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  body: string | null;
  html: string | null;
  is_read: boolean;
  source: string;
  created_at: string;
}

/**
 * Dashboard overview widget — deliberately narrow scope: only the Inbox
 * folder, only Gmail + Resend (the two connected mail accounts). Everything
 * else — Sent/Drafts/Spam/Trash/Archive, contact-form messages, per-account
 * switching, reply/compose — lives in the full Email Center tab. This is
 * meant to be a quick glance, not a second inbox client.
 */
const AdminInbox = () => {
  const [messages, setMessages] = useState<AdminEmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminEmailRow | null>(null);

  const fetchInbox = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_emails')
      .select('id, from_email, from_name, subject, body, html, is_read, source, created_at')
      .in('source', ['gmail', 'resend'])
      .eq('folder', 'inbox')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) setMessages(data as AdminEmailRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchInbox();
    const channel = supabase
      .channel('admin-inbox-widget')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_emails' }, fetchInbox)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openMessage = async (message: AdminEmailRow) => {
    setSelected(message);
    if (!message.is_read) {
      await supabase.from('admin_emails').update({ is_read: true }).eq('id', message.id);
      fetchInbox();
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-white flex items-center gap-2">
              <InboxIcon className="h-5 w-5 text-estate-blue" />
              Inbox
            </CardTitle>
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
          </div>
          <Button variant="ghost" size="icon" onClick={fetchInbox} className="text-slate-400 hover:text-white">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No inbox messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`p-4 hover:bg-slate-700/50 cursor-pointer transition-colors ${
                    !message.is_read ? 'bg-slate-700/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-full ${message.is_read ? 'bg-slate-600' : 'bg-primary/20'}`}>
                        {message.is_read ? (
                          <MailOpen className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate">
                            {message.from_name || message.from_email}
                          </span>
                          <Badge variant="outline" className="text-[10px] capitalize border-slate-600 text-slate-400">
                            {message.source}
                          </Badge>
                          {!message.is_read && <Badge variant="default" className="text-xs">New</Badge>}
                        </div>
                        <p className="text-sm text-primary truncate">{message.subject || '(No Subject)'}</p>
                        <p className="text-sm text-slate-400 truncate">{message.body}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">{selected.subject || '(No Subject)'}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{selected.from_name || selected.from_email}</span>
                <Badge variant="outline" className="text-[10px] capitalize border-slate-600">{selected.source}</Badge>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(selected.created_at), 'PPp')}
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {selected.html ? (
                  <div className="text-slate-200" dangerouslySetInnerHTML={{ __html: sanitizeHtml(selected.html) }} />
                ) : (
                  <p className="text-slate-200 whitespace-pre-wrap">{selected.body}</p>
                )}
              </div>
              <p className="text-xs text-slate-500 text-center">
                Reply from the full Email Center tab for reply/forward/folder actions.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminInbox;
