import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, MailOpen, Reply, Trash2, User, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  responded: boolean;
  responded_at: string | null;
  created_at: string;
}

const AdminInbox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('responded', false);
      } else if (filter === 'read') {
        query = query.eq('responded', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel('inbox-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetchMessages)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;

    setSending(true);
    try {
      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: selectedMessage.email,
          subject: replySubject || `Re: ${selectedMessage.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">Bridgefort Homes Development Ltd</h1>
              </div>
              <div style="padding: 30px; background: #fff;">
                <p>Dear ${selectedMessage.name},</p>
                <div style="white-space: pre-wrap;">${replyContent}</div>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                  This is a reply to your message: "${selectedMessage.subject}"
                </p>
              </div>
              <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>Bridgefort Homes Development Ltd | 3 Isoko Drive, Off NTA Road, Asaba, Delta State</p>
              </div>
            </div>
          `
        }
      });

      if (emailError) throw emailError;

      // Mark as responded
      const { error: updateError } = await supabase
        .from('contact_messages')
        .update({
          responded: true,
          responded_at: new Date().toISOString(),
          responded_by: user?.id
        })
        .eq('id', selectedMessage.id);

      if (updateError) throw updateError;

      // Log the email
      await supabase.from('email_logs').insert({
        recipient_email: selectedMessage.email,
        recipient_name: selectedMessage.name,
        subject: replySubject || `Re: ${selectedMessage.subject}`,
        body: replyContent,
        sender_id: user?.id,
        status: 'sent'
      });

      toast({
        title: "Reply Sent",
        description: `Email sent to ${selectedMessage.email}`
      });

      setReplyContent('');
      setReplySubject('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Message deleted successfully"
      });
      fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  const unreadCount = messages.filter(m => !m.responded).length;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Inbox
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-700 rounded-lg p-1">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchMessages}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
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
              <p className="text-slate-400">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {messages.map((message) => (
                <Dialog key={message.id}>
                  <DialogTrigger asChild>
                    <div
                      onClick={() => {
                        setSelectedMessage(message);
                        setReplySubject(`Re: ${message.subject}`);
                      }}
                      className={`p-4 hover:bg-slate-700/50 cursor-pointer transition-colors ${
                        !message.responded ? 'bg-slate-700/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-full ${
                            message.responded 
                              ? 'bg-slate-600' 
                              : 'bg-primary/20'
                          }`}>
                            {message.responded ? (
                              <MailOpen className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Mail className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white truncate">
                                {message.name}
                              </span>
                              {!message.responded && (
                                <Badge variant="default" className="text-xs">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-primary truncate">{message.subject}</p>
                            <p className="text-sm text-slate-400 truncate">{message.message}</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">{message.subject}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {message.name}
                        </div>
                        <div>{message.email}</div>
                        <div>{message.phone}</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(message.created_at), 'PPp')}
                        </div>
                      </div>
                      
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-slate-200 whitespace-pre-wrap">{message.message}</p>
                      </div>

                      {message.responded ? (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Replied on {format(new Date(message.responded_at!), 'PPp')}
                        </Badge>
                      ) : (
                        <div className="space-y-4 border-t border-slate-700 pt-4">
                          <h4 className="font-medium text-white flex items-center gap-2">
                            <Reply className="h-4 w-4" />
                            Reply
                          </h4>
                          <div className="space-y-2">
                            <Label className="text-slate-400">Subject</Label>
                            <Input
                              value={replySubject}
                              onChange={(e) => setReplySubject(e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-400">Message</Label>
                            <Textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Type your reply..."
                              rows={6}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div className="flex justify-between">
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(message.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Button
                              onClick={handleReply}
                              disabled={!replyContent.trim() || sending}
                            >
                              {sending ? 'Sending...' : 'Send Reply'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminInbox;
