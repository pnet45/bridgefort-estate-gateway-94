import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { 
  Send, Users, Mail, RefreshCw, Search, Plus, 
  Trash2, Eye, Clock, CheckCircle, XCircle, AlertCircle,
  LayoutTemplate
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  recipient_filter: string;
  recipient_emails: string[];
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: string;
  sent_at: string | null;
  created_at: string;
}

interface Recipient {
  id: string;
  email: string;
  name: string;
  selected: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export default function AdminBulkEmail() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [customEmails, setCustomEmails] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, body')
        .order('is_default', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchRecipients = useCallback(async () => {
    setLoading(true);
    try {
      let emails: Recipient[] = [];

      if (recipientFilter === 'all' || recipientFilter === 'clients') {
        // Get profiles with email from users table
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name');

        // We'll need to get emails through edge function or join
        const { data: usersData } = await supabase.functions.invoke('get-user-emails');
        
        if (profiles && usersData?.users) {
          emails = profiles.map(p => ({
            id: p.id,
            email: usersData.users.find((u: any) => u.id === p.id)?.email || '',
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User',
            selected: false,
          })).filter(r => r.email);
        }
      }

      if (recipientFilter === 'subscribers' || recipientFilter === 'all') {
        const { data: subscribers } = await supabase
          .from('newsletter_subscribers')
          .select('id, email')
          .eq('is_active', true);

        if (subscribers) {
          const subscriberEmails = subscribers.map(s => ({
            id: s.id,
            email: s.email,
            name: 'Subscriber',
            selected: false,
          }));
          
          // Merge without duplicates
          const existingEmails = new Set(emails.map(e => e.email));
          subscriberEmails.forEach(s => {
            if (!existingEmails.has(s.email)) {
              emails.push(s);
            }
          });
        }
      }

      setRecipients(emails);
      setSelectedRecipients(new Set(emails.map(e => e.id)));
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  }, [recipientFilter]);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      fetchRecipients();
    }
  }, [dialogOpen, recipientFilter, fetchRecipients]);

  const resetForm = () => {
    setName('');
    setSubject('');
    setBody('');
    setRecipientFilter('all');
    setCustomEmails('');
    setSelectedRecipients(new Set());
    setSendProgress(0);
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      toast.success('Template applied');
    }
  };

  const toggleRecipient = (id: string) => {
    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecipients(newSelected);
  };

  const toggleAllRecipients = () => {
    if (selectedRecipients.size === filteredRecipients.length) {
      setSelectedRecipients(new Set());
    } else {
      setSelectedRecipients(new Set(filteredRecipients.map(r => r.id)));
    }
  };

  const handleSendBulkEmail = async () => {
    const selectedEmails = recipients
      .filter(r => selectedRecipients.has(r.id))
      .map(r => ({ email: r.email, name: r.name }));

    if (recipientFilter === 'custom') {
      const emails = customEmails.split(/[,\n]/).map(e => e.trim()).filter(e => e);
      emails.forEach(email => {
        selectedEmails.push({ email, name: '' });
      });
    }

    if (selectedEmails.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast.error('Please fill in subject and body');
      return;
    }

    setSending(true);
    setSendProgress(0);

    try {
      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          name: name || `Campaign ${new Date().toLocaleDateString()}`,
          subject,
          body,
          recipient_filter: recipientFilter,
          recipient_emails: selectedEmails.map(e => e.email),
          total_recipients: selectedEmails.length,
          status: 'sending',
          created_by: user?.id,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      let sentCount = 0;
      let failedCount = 0;

      // Send emails one by one with progress
      for (let i = 0; i < selectedEmails.length; i++) {
        const recipient = selectedEmails[i];
        
        try {
          // Personalize body
          const personalizedBody = body
            .replace(/\{\{name\}\}/g, recipient.name || 'Valued Customer')
            .replace(/\{\{email\}\}/g, recipient.email)
            .replace(/\{\{date\}\}/g, new Date().toLocaleDateString());

          const { error } = await supabase.functions.invoke('send-email', {
            body: {
              to: recipient.email,
              subject,
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${personalizedBody.replace(/\n/g, '<br/>')}
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;"/>
                <p style="color: #666; font-size: 12px;">
                  This email was sent by PWAN Bridgefort. 
                  If you no longer wish to receive these emails, please contact us.
                </p>
              </div>`,
            },
          });

          if (error) throw error;
          sentCount++;

          // Log email
          await supabase.from('email_logs').insert({
            recipient_email: recipient.email,
            recipient_name: recipient.name,
            subject,
            body: personalizedBody,
            sender_id: user?.id,
            status: 'sent',
          });
        } catch (err) {
          console.error(`Failed to send to ${recipient.email}:`, err);
          failedCount++;
        }

        setSendProgress(Math.round(((i + 1) / selectedEmails.length) * 100));
      }

      // Update campaign status
      await supabase
        .from('email_campaigns')
        .update({
          status: failedCount === selectedEmails.length ? 'failed' : 'completed',
          sent_count: sentCount,
          failed_count: failedCount,
          sent_at: new Date().toISOString(),
        })
        .eq('id', campaign.id);

      toast.success(`Bulk email sent! ${sentCount} delivered, ${failedCount} failed`);
      resetForm();
      setDialogOpen(false);
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error sending bulk email:', error);
      toast.error(error.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'sending':
        return <Badge className="bg-blue-500/20 text-blue-400"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Sending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  const filteredRecipients = recipients.filter(r =>
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5 text-blue-400" />
          Bulk Email & Campaigns
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCampaigns}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Create Email Campaign</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                {/* Left side - Email Content */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Campaign Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., January Newsletter"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4" />
                        Use Template
                      </Label>
                      <Select onValueChange={applyTemplate}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id} className="text-white">
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-slate-300">Subject *</Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject line"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Email Body *</Label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write your message... Use {{name}}, {{email}}, {{date}} for personalization"
                      rows={10}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                {/* Right side - Recipients */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Recipient Group</Label>
                    <Select value={recipientFilter} onValueChange={setRecipientFilter}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="all" className="text-white">All Users & Subscribers</SelectItem>
                        <SelectItem value="subscribers" className="text-white">Newsletter Subscribers Only</SelectItem>
                        <SelectItem value="clients" className="text-white">Registered Users Only</SelectItem>
                        <SelectItem value="custom" className="text-white">Custom List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recipientFilter === 'custom' ? (
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email Addresses</Label>
                      <Textarea
                        value={customEmails}
                        onChange={(e) => setCustomEmails(e.target.value)}
                        placeholder="Enter emails separated by commas or new lines"
                        rows={8}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-300">
                          Recipients ({selectedRecipients.size} selected)
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleAllRecipients}
                          className="text-xs"
                        >
                          {selectedRecipients.size === filteredRecipients.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search recipients..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <ScrollArea className="h-[250px] bg-slate-700/50 rounded-lg border border-slate-600">
                        {loading ? (
                          <div className="p-4 text-center text-slate-400">Loading recipients...</div>
                        ) : filteredRecipients.length === 0 ? (
                          <div className="p-4 text-center text-slate-400">No recipients found</div>
                        ) : (
                          <div className="p-2 space-y-1">
                            {filteredRecipients.map((recipient) => (
                              <div
                                key={recipient.id}
                                className="flex items-center gap-3 p-2 hover:bg-slate-600/50 rounded cursor-pointer"
                                onClick={() => toggleRecipient(recipient.id)}
                              >
                                <Checkbox
                                  checked={selectedRecipients.has(recipient.id)}
                                  onCheckedChange={() => toggleRecipient(recipient.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white truncate">{recipient.email}</p>
                                  <p className="text-xs text-slate-400 truncate">{recipient.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>

              {sending && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Sending emails...</span>
                    <span className="text-white">{sendProgress}%</span>
                  </div>
                  <Progress value={sendProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={sending}>
                  Cancel
                </Button>
                <Button onClick={handleSendBulkEmail} disabled={sending}>
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Campaign ({recipientFilter === 'custom' 
                        ? customEmails.split(/[,\n]/).filter(e => e.trim()).length 
                        : selectedRecipients.size} recipients)
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No campaigns yet</p>
              <p className="text-sm text-slate-500 mt-1">Create your first email campaign</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white truncate">{campaign.name}</span>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <p className="text-sm text-primary truncate">{campaign.subject}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.total_recipients} recipients
                        </span>
                        {campaign.status === 'completed' && (
                          <>
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              {campaign.sent_count} sent
                            </span>
                            {campaign.failed_count > 0 && (
                              <span className="flex items-center gap-1 text-red-400">
                                <XCircle className="h-3 w-3" />
                                {campaign.failed_count} failed
                              </span>
                            )}
                          </>
                        )}
                        {campaign.sent_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(campaign.sent_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
