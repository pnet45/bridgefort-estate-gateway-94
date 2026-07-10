import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Mail, Send, Inbox, Clock, Search, Trash2, 
  PenSquare, Users, RefreshCw, CheckCircle, XCircle 
} from 'lucide-react';
import { format } from 'date-fns';

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  body: string;
  status: string;
  sent_at: string;
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string;
}

export default function BridgefortMails() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  
  // Compose form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (userRole !== 'admin') {
      navigate('/dashboard');
      toast.error('Access denied. Admin only.');
      return;
    }
    fetchData();
  }, [user, userRole, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch email logs
      const { data: logs, error: logsError } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false });

      if (logsError) throw logsError;
      setEmailLogs(logs || []);

      // Fetch users for recipient selection
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (profilesError) throw profilesError;

      // Fetch emails from auth.users via edge function
      const { data: usersData } = await supabase.functions.invoke('get-user-emails');
      
      const usersWithEmails = (profiles || []).map(profile => ({
        ...profile,
        email: usersData?.users?.find((u: any) => u.id === profile.id)?.email || ''
      }));
      
      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject || !body) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-admin-email', {
        body: {
          to: recipientEmail,
          name: recipientName,
          subject,
          body
        }
      });

      if (error) throw error;

      // Log the email
      await supabase.from('email_logs').insert({
        sender_id: user?.id,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject,
        body,
        status: 'sent'
      });

      toast.success('Email sent successfully!');
      setRecipientEmail('');
      setRecipientName('');
      setSubject('');
      setBody('');
      fetchData();
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const { error } = await supabase.from('email_logs').delete().eq('id', id);
      if (error) throw error;
      toast.success('Email log deleted');
      setEmailLogs(prev => prev.filter(log => log.id !== id));
      if (selectedEmail?.id === id) setSelectedEmail(null);
    } catch (error) {
      toast.error('Failed to delete log');
    }
  };

  const filteredLogs = emailLogs.filter(log =>
    log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Bridgefort Mail Center</h1>
        </div>

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <PenSquare className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Sent
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacts
            </TabsTrigger>
          </TabsList>

          {/* Compose Tab */}
          <TabsContent value="compose">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenSquare className="h-5 w-5" />
                  Compose Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientEmail">Recipient Email *</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input
                        id="recipientName"
                        placeholder="John Doe"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Email subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body">Message *</Label>
                    <Textarea
                      id="body"
                      placeholder="Write your email message here..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={10}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={sending} className="w-full md:w-auto">
                    {sending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sent Tab */}
          <TabsContent value="sent">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email List */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Inbox className="h-5 w-5" />
                    Sent Emails ({filteredLogs.length})
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No emails found</p>
                  ) : (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        onClick={() => setSelectedEmail(log)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedEmail?.id === log.id
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{log.recipient_email}</p>
                            <p className="text-sm text-muted-foreground truncate">{log.subject}</p>
                          </div>
                          <Badge variant={log.status === 'sent' ? 'default' : 'destructive'} className="shrink-0">
                            {log.status === 'sent' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.sent_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Email Preview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Email Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedEmail ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">To:</p>
                          <p className="font-medium">
                            {selectedEmail.recipient_name && `${selectedEmail.recipient_name} `}
                            &lt;{selectedEmail.recipient_email}&gt;
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLog(selectedEmail.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Subject:</p>
                        <p className="font-semibold text-lg">{selectedEmail.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sent:</p>
                        <p>{format(new Date(selectedEmail.sent_at), 'MMMM d, yyyy h:mm a')}</p>
                      </div>
                      <hr />
                      <div className="whitespace-pre-wrap">{selectedEmail.body}</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Contacts ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <p className="font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setRecipientEmail(user.email || '');
                          setRecipientName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
                          const tabsList = document.querySelector('[data-state="active"]');
                          if (tabsList) {
                            const composeTab = document.querySelector('[value="compose"]') as HTMLElement;
                            composeTab?.click();
                          }
                        }}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Send Email
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
