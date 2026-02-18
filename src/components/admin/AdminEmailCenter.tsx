import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useEmail } from '@/hooks/useEmail';
import { supabase } from '@/integrations/supabase/client';
import AdminEmailTemplates from './AdminEmailTemplates';
import AdminBulkEmail from './AdminBulkEmail';
import { 
  Mail, Send, Inbox, Clock, Search, Trash2, 
  PenSquare, Users, RefreshCw, CheckCircle, XCircle,
  MailOpen, Reply, User, Archive, Star, LayoutTemplate, Megaphone, FolderOpen,
  Download, Paperclip, Globe
} from 'lucide-react';

export default function AdminEmailCenter() {
  const {
    sentEmails,
    inboxMessages,
    contacts,
    loading,
    sending,
    unreadCount,
    sendEmail,
    replyToMessage,
    deleteEmailLog,
    deleteMessage,
    refreshAll,
  } = useEmail();

  const [activeTab, setActiveTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'read'>('all');
  
  // Compose form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Selected items
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyContent, setReplyContent] = useState('');

  // Admin emails (folder-based)
  const [adminEmails, setAdminEmails] = useState<any[]>([]);
  const [adminSentEmails, setAdminSentEmails] = useState<any[]>([]);
  const [archiveEmails, setArchiveEmails] = useState<any[]>([]);

  // Resend received emails
  const [receivedEmails, setReceivedEmails] = useState<any[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [selectedReceivedEmail, setSelectedReceivedEmail] = useState<any>(null);
  const [receivedEmailDetail, setReceivedEmailDetail] = useState<any>(null);
  const [receivedAttachments, setReceivedAttachments] = useState<any[]>([]);

  const fetchAdminEmails = useCallback(async (folder: string) => {
    const { data, error } = await supabase
      .from('admin_emails')
      .select('*')
      .eq('folder', folder)
      .order('created_at', { ascending: false });
    if (!error && data) return data;
    return [];
  }, []);

  const refreshFolderEmails = useCallback(async () => {
    const [archiveData, sentData, inboxData] = await Promise.all([
      fetchAdminEmails('archive'),
      fetchAdminEmails('sent'),
      fetchAdminEmails('inbox'),
    ]);
    setArchiveEmails(archiveData);
    setAdminSentEmails(sentData);
    setAdminEmails(inboxData);
  }, [fetchAdminEmails]);

  const fetchReceivedEmails = useCallback(async () => {
    setReceivedLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resend-receive-emails', {
        body: { action: 'list' },
      });
      if (error) throw error;
      if (data?.success && data?.data?.data) {
        setReceivedEmails(data.data.data);
      } else if (data?.success && Array.isArray(data?.data)) {
        setReceivedEmails(data.data);
      } else {
        setReceivedEmails([]);
      }
    } catch (error: any) {
      console.error('Error fetching received emails:', error);
      toast.error('Failed to fetch received emails from Resend');
    } finally {
      setReceivedLoading(false);
    }
  }, []);

  const fetchReceivedEmailDetail = useCallback(async (emailId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('resend-receive-emails', {
        body: { action: 'get', emailId },
      });
      if (error) throw error;
      if (data?.success) {
        setReceivedEmailDetail(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching email detail:', error);
    }
  }, []);

  const fetchReceivedAttachments = useCallback(async (emailId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('resend-receive-emails', {
        body: { action: 'list-attachments', emailId },
      });
      if (error) throw error;
      if (data?.success && data?.data?.data) {
        setReceivedAttachments(data.data.data);
      } else {
        setReceivedAttachments([]);
      }
    } catch (error: any) {
      console.error('Error fetching attachments:', error);
      setReceivedAttachments([]);
    }
  }, []);

  useEffect(() => {
    refreshFolderEmails();
    fetchReceivedEmails();
    const channel = supabase
      .channel('admin-emails-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_emails' }, refreshFolderEmails)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refreshFolderEmails, fetchReceivedEmails]);

  const moveToFolder = async (emailId: string, folder: string) => {
    const { error } = await supabase
      .from('admin_emails')
      .update({ folder })
      .eq('id', emailId);
    if (!error) {
      toast.success(`Email moved to ${folder}`);
      refreshFolderEmails();
      refreshAll();
    } else {
      toast.error('Failed to move email');
    }
  };
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject || !body) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await sendEmail(recipientEmail, subject, body, recipientName);
    
    if (result.success) {
      // Also save to admin_emails as sent
      await supabase.from('admin_emails').insert({
        from_email: 'noreply@pwanbridgefort.ng',
        from_name: 'PWAN Bridgefort',
        to_email: recipientEmail,
        to_name: recipientName || null,
        subject,
        body,
        folder: 'sent',
        is_read: true,
        source: 'compose',
      });
      toast.success('Email sent successfully!');
      setRecipientEmail('');
      setRecipientName('');
      setSubject('');
      setBody('');
      setActiveTab('sent');
    } else {
      toast.error(result.error || 'Failed to send email');
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast.error('Please write a reply message');
      return;
    }

    const result = await replyToMessage(
      selectedMessage,
      replySubject || `Re: ${selectedMessage.subject}`,
      replyContent
    );

    if (result.success) {
      toast.success(`Reply sent to ${selectedMessage.email}`);
      setReplyContent('');
      setReplySubject('');
      setSelectedMessage(null);
    } else {
      toast.error(result.error || 'Failed to send reply');
    }
  };

  const handleDeleteLog = async (id: string) => {
    const result = await deleteEmailLog(id);
    if (result.success) {
      toast.success('Email log deleted');
      if (selectedEmail?.id === id) setSelectedEmail(null);
    } else {
      toast.error('Failed to delete log');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    const result = await deleteMessage(id);
    if (result.success) {
      toast.success('Message deleted');
    } else {
      toast.error('Failed to delete message');
    }
  };

  const handleSelectContact = (contact: any) => {
    setRecipientEmail(contact.email || '');
    setRecipientName(`${contact.first_name || ''} ${contact.last_name || ''}`.trim());
    setActiveTab('compose');
  };

  // Filtered data
  // Combine sent emails from email_logs + admin_emails (sent folder)
  const combinedSentEmails = [
    ...sentEmails.map(e => ({ ...e, _source: 'log' as const })),
    ...adminSentEmails.map(e => ({
      id: e.id,
      recipient_email: e.to_email,
      recipient_name: e.to_name,
      subject: e.subject,
      body: e.body,
      status: 'sent',
      sent_at: e.created_at,
      sender_id: e.sender_id,
      _source: 'admin' as const,
    })),
  ].sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

  // De-duplicate by subject + recipient + close timestamp (within 5s)
  const dedupedSentEmails = combinedSentEmails.filter((email, index, arr) => {
    return !arr.slice(0, index).some(prev => 
      prev.recipient_email === email.recipient_email &&
      prev.subject === email.subject &&
      Math.abs(new Date(prev.sent_at).getTime() - new Date(email.sent_at).getTime()) < 5000
    );
  });

  const filteredSentEmails = dedupedSentEmails.filter(log =>
    log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combine inbox: contact_messages + admin_emails (inbox folder) + Resend received emails
  const combinedInbox = [
    ...inboxMessages.map(msg => ({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      responded: msg.responded,
      created_at: msg.created_at,
      phone: msg.phone,
      _source: 'contact' as const,
    })),
    ...adminEmails.map(e => ({
      id: e.id,
      name: e.from_name || e.from_email,
      email: e.from_email,
      subject: e.subject,
      message: e.body,
      responded: e.is_read,
      created_at: e.created_at,
      phone: '',
      _source: 'admin_email' as const,
    })),
    ...receivedEmails.map(e => ({
      id: e.id,
      name: e.from || 'Unknown',
      email: e.from || '',
      subject: e.subject || '(No Subject)',
      message: '',
      responded: false,
      created_at: e.created_at,
      phone: '',
      _source: 'resend' as const,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // De-duplicate inbox by email + subject + close timestamp
  const dedupedInbox = combinedInbox.filter((item, index, arr) => {
    return !arr.slice(0, index).some(prev => 
      prev.email === item.email &&
      prev.subject === item.subject &&
      Math.abs(new Date(prev.created_at).getTime() - new Date(item.created_at).getTime()) < 5000
    );
  });

  const filteredInbox = dedupedInbox.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      inboxFilter === 'all' ||
      (inboxFilter === 'unread' && !msg.responded) ||
      (inboxFilter === 'read' && msg.responded);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900/30 rounded-lg">
            <Mail className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Email Center</h2>
            <p className="text-sm text-slate-400">Manage all communications</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">{unreadCount} unread</Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-700 border border-slate-600 p-1">
          <TabsTrigger 
            value="inbox" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <Inbox className="h-4 w-4" />
            Inbox ({filteredInbox.length})
            {dedupedInbox.filter(m => !m.responded).length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {dedupedInbox.filter(m => !m.responded).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="compose" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <PenSquare className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger 
            value="sent" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <Send className="h-4 w-4" />
            Sent ({dedupedSentEmails.length})
          </TabsTrigger>
          <TabsTrigger 
            value="contacts" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <Users className="h-4 w-4" />
            Contacts ({contacts.length})
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="bulk" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <Megaphone className="h-4 w-4" />
            Bulk Email
          </TabsTrigger>
          <TabsTrigger 
            value="received" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <Globe className="h-4 w-4" />
            Received ({receivedEmails.length})
          </TabsTrigger>
          <TabsTrigger 
            value="archive" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
          >
            <Archive className="h-4 w-4" />
            Archive ({archiveEmails.length})
          </TabsTrigger>
        </TabsList>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex bg-slate-700 rounded-lg p-1">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setInboxFilter(f)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    inboxFilter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-20 bg-slate-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredInbox.length === 0 ? (
                  <div className="p-12 text-center">
                    <Mail className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                    <p className="text-slate-400">No messages found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {filteredInbox.map((message) => (
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
                                    <span className={`font-medium truncate ${
                                      !message.responded ? 'text-white' : 'text-slate-300'
                                    }`}>
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
                            <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
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
                                Replied
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
                                    onClick={() => handleDeleteMessage(message.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </Button>
                                  <Button
                                    onClick={handleReply}
                                    disabled={!replyContent.trim() || sending}
                                  >
                                    {sending ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Sending...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Reply
                                      </>
                                    )}
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
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PenSquare className="h-5 w-5" />
                Compose Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail" className="text-slate-300">Recipient Email *</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="email@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientName" className="text-slate-300">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      placeholder="John Doe"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-slate-300">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body" className="text-slate-300">Message *</Label>
                  <Textarea
                    id="body"
                    placeholder="Write your email message here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={sending} className="gap-2">
                    {sending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Email List */}
            <Card className="lg:col-span-1 bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Send className="h-5 w-5" />
                  Sent Emails
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search sent emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-700 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : filteredSentEmails.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No sent emails found</p>
                  ) : (
                    <div className="p-2 space-y-2">
                      {filteredSentEmails.map((log) => (
                        <div
                          key={log.id}
                          onClick={() => setSelectedEmail(log)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedEmail?.id === log.id
                              ? 'bg-primary/20 border border-primary/30'
                              : 'bg-slate-700/50 hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate text-white">{log.recipient_email}</p>
                              <p className="text-sm text-slate-400 truncate">{log.subject}</p>
                            </div>
                            <Badge variant={log.status === 'sent' ? 'default' : 'destructive'} className="shrink-0">
                              {log.status === 'sent' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(log.sent_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Email Preview */}
            <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEmail ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-400">To:</p>
                        <p className="font-medium text-white">
                          {selectedEmail.recipient_name && `${selectedEmail.recipient_name} `}
                          &lt;{selectedEmail.recipient_email}&gt;
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLog(selectedEmail.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Subject:</p>
                      <p className="font-semibold text-lg text-white">{selectedEmail.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Sent:</p>
                      <p className="text-slate-300">{format(new Date(selectedEmail.sent_at), 'MMMM d, yyyy h:mm a')}</p>
                    </div>
                    <hr className="border-slate-700" />
                    <div className="whitespace-pre-wrap text-slate-300 bg-slate-700/30 p-4 rounded-lg">
                      {selectedEmail.body}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <Mail className="h-12 w-12 mb-4" />
                    <p>Select an email to view</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                User Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400">No contacts found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.filter(c => c.email).map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {contact.first_name || contact.last_name 
                              ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                              : 'No Name'}
                          </p>
                          <p className="text-sm text-slate-400 truncate">{contact.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => handleSelectContact(contact)}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Send Email
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <AdminEmailTemplates 
            onSelectTemplate={(template) => {
              setSubject(template.subject);
              setBody(template.body);
              setActiveTab('compose');
              toast.success('Template applied to compose');
            }}
          />
        </TabsContent>

        {/* Bulk Email Tab */}
        <TabsContent value="bulk">
          <AdminBulkEmail />
        </TabsContent>

        {/* Received Emails Tab (from Resend) */}
        <TabsContent value="received">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Email List */}
            <Card className="lg:col-span-1 bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Globe className="h-5 w-5" />
                    Received Emails
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchReceivedEmails}
                    disabled={receivedLoading}
                    className="text-slate-400 hover:text-white"
                  >
                    <RefreshCw className={`h-4 w-4 ${receivedLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {receivedLoading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-700 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : receivedEmails.length === 0 ? (
                    <div className="p-12 text-center">
                      <Globe className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                      <p className="text-slate-400">No received emails found</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Make sure your MX records are configured for Resend receiving
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {receivedEmails.map((email: any) => (
                        <div
                          key={email.id}
                          onClick={() => {
                            setSelectedReceivedEmail(email);
                            setReceivedEmailDetail(null);
                            setReceivedAttachments([]);
                            fetchReceivedEmailDetail(email.id);
                            fetchReceivedAttachments(email.id);
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedReceivedEmail?.id === email.id
                              ? 'bg-primary/20 border border-primary/30'
                              : 'bg-slate-700/50 hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate text-white">
                                {email.from || email.from_email || 'Unknown Sender'}
                              </p>
                              <p className="text-sm text-primary truncate">
                                {email.subject || '(No Subject)'}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {email.created_at 
                              ? format(new Date(email.created_at), 'MMM d, yyyy h:mm a')
                              : 'Unknown date'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Email Detail */}
            <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Email Detail</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedReceivedEmail ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400">From:</p>
                      <p className="font-medium text-white">
                        {receivedEmailDetail?.from || selectedReceivedEmail.from || selectedReceivedEmail.from_email || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">To:</p>
                      <p className="text-white">
                        {receivedEmailDetail?.to || selectedReceivedEmail.to || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Subject:</p>
                      <p className="font-semibold text-lg text-white">
                        {receivedEmailDetail?.subject || selectedReceivedEmail.subject || '(No Subject)'}
                      </p>
                    </div>
                    {selectedReceivedEmail.created_at && (
                      <div>
                        <p className="text-sm text-slate-400">Received:</p>
                        <p className="text-slate-300">
                          {format(new Date(selectedReceivedEmail.created_at), 'MMMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                    
                    {/* Attachments */}
                    {receivedAttachments.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-400 flex items-center gap-1 mb-2">
                          <Paperclip className="h-3 w-3" />
                          Attachments ({receivedAttachments.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {receivedAttachments.map((att: any) => (
                            <Badge 
                              key={att.id} 
                              variant="secondary" 
                              className="flex items-center gap-1 cursor-pointer hover:bg-slate-600"
                            >
                              <Paperclip className="h-3 w-3" />
                              {att.filename || att.name || 'Attachment'}
                              {att.size && <span className="text-xs">({Math.round(att.size / 1024)}KB)</span>}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <hr className="border-slate-700" />
                    
                    {/* Email body */}
                    <ScrollArea className="h-[300px]">
                      {receivedEmailDetail?.html ? (
                        <div 
                          className="text-slate-300 bg-slate-700/30 p-4 rounded-lg prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: receivedEmailDetail.html }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-slate-300 bg-slate-700/30 p-4 rounded-lg">
                          {receivedEmailDetail?.text || receivedEmailDetail?.body || selectedReceivedEmail.text || 'Loading email content...'}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <Globe className="h-12 w-12 mb-4" />
                    <p>Select a received email to view</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Archive Tab */}
        <TabsContent value="archive">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Archive className="h-5 w-5" />
                Archived Emails
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {archiveEmails.length === 0 ? (
                  <div className="p-12 text-center">
                    <Archive className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                    <p className="text-slate-400">No archived emails</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {archiveEmails.map((email) => (
                      <div key={email.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">
                              {email.from_name || email.from_email}
                            </p>
                            <p className="text-sm text-primary truncate">{email.subject}</p>
                            <p className="text-sm text-slate-400 truncate">{email.body}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {format(new Date(email.created_at), 'MMM d, h:mm a')}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveToFolder(email.id, 'inbox')}
                              title="Move back to inbox"
                              className="text-slate-400 hover:text-white"
                            >
                              <Inbox className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
