import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import RichTextEditor from '@/components/editor/RichTextEditor';
import {
  Send, Users, Mail, RefreshCw, Search, Plus, Trash2, Eye, Clock,
  CheckCircle, XCircle, Paperclip, FileText, Image as ImageIcon,
  Save, X, Sparkles, ShieldCheck, Upload, CalendarDays
} from 'lucide-react';

interface CampaignAttachment {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  body_html: string | null;
  attachments: CampaignAttachment[];
  recipient_filter: string;
  recipient_emails: string[];
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: string;
  sent_at: string | null;
  created_at: string;
  updated_at?: string;
}

interface Recipient {
  id: string;
  email: string;
  name: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const EDITOR_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol',
    'li', 'a', 'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'td',
    'th', 'blockquote', 'hr', 'sup', 'sub'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel', 'width',
    'height', 'align', 'colspan', 'rowspan'
  ],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'video', 'audio'],
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const BLOCKED_ATTACHMENT_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'js', 'jar', 'vbs', 'ps1', 'sh', 'php'
]);

const toEditorHtml = (value: string) => {
  if (!value?.trim()) return '<p></p>';
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\r?\n/)
    .map(line => `<p>${line.trim() || '<br>'}</p>`)
    .join('');
};

const htmlToPlainText = (html: string) => {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return (doc.body.textContent || '').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
};

const formatBytes = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const safeHtml = (html: string) => DOMPurify.sanitize(html || '<p>No content yet.</p>', EDITOR_SANITIZE_CONFIG);

export default function AdminBulkEmail() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('<p></p>');
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [customEmails, setCustomEmails] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [attachments, setAttachments] = useState<CampaignAttachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCampaigns((data || []) as unknown as EmailCampaign[]);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load email campaigns');
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
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
  }, []);

  const fetchRecipients = useCallback(async () => {
    if (recipientFilter === 'custom') {
      setRecipients([]);
      setSelectedRecipients(new Set());
      return;
    }

    setLoading(true);
    try {
      let emails: Recipient[] = [];

      if (recipientFilter === 'all' || recipientFilter === 'clients') {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name');

        const { data: usersData } = await supabase.functions.invoke('get-user-emails');
        if (profiles && usersData?.users) {
          emails = profiles
            .map((p: any) => ({
              id: p.id,
              email: usersData.users.find((u: any) => u.id === p.id)?.email || '',
              name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Valued Client',
            }))
            .filter((r: Recipient) => r.email);
        }
      }

      if (recipientFilter === 'subscribers' || recipientFilter === 'all') {
        const { data: subscribers } = await supabase
          .from('newsletter_subscribers')
          .select('id, email')
          .eq('is_active', true);

        const existingEmails = new Set(emails.map(e => e.email.toLowerCase()));
        for (const subscriber of subscribers || []) {
          if (!existingEmails.has(subscriber.email.toLowerCase())) {
            emails.push({ id: subscriber.id, email: subscriber.email, name: 'Subscriber' });
          }
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
  }, [fetchCampaigns, fetchTemplates]);

  useEffect(() => {
    if (dialogOpen) fetchRecipients();
  }, [dialogOpen, fetchRecipients]);

  const resetForm = () => {
    setName('');
    setSubject('');
    setBodyHtml('<p></p>');
    setRecipientFilter('all');
    setCustomEmails('');
    setSelectedRecipients(new Set());
    setAttachments([]);
    setSendProgress(0);
    setPreviewOpen(false);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    setSubject(template.subject);
    setBodyHtml(toEditorHtml(template.body));
    toast.success('Template applied');
  };

  const filteredRecipients = useMemo(
    () => recipients.filter(r =>
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [recipients, searchTerm],
  );

  const selectedEmailRecords = useMemo(() => {
    const selected = recipients
      .filter(r => selectedRecipients.has(r.id))
      .map(r => ({ email: r.email, name: r.name }));

    if (recipientFilter === 'custom') {
      const seen = new Set<string>();
      customEmails.split(/[,\n;]+/).map(e => e.trim()).filter(Boolean).forEach(email => {
        const key = email.toLowerCase();
        if (!seen.has(key)) {
          selected.push({ email, name: '' });
          seen.add(key);
        }
      });
    }

    const deduped = new Map<string, { email: string; name: string }>();
    selected.forEach(item => {
      const key = item.email.toLowerCase();
      if (!deduped.has(key)) deduped.set(key, item);
    });
    return Array.from(deduped.values());
  }, [recipients, selectedRecipients, recipientFilter, customEmails]);

  const totalAttachmentBytes = attachments.reduce((sum, a) => sum + (a.size || 0), 0);

  const uploadAttachments = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadingAttachment(true);

    try {
      const currentBytes = attachments.reduce((sum, a) => sum + (a.size || 0), 0);
      let addedBytes = 0;
      const next: CampaignAttachment[] = [];

      for (const file of Array.from(files)) {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (BLOCKED_ATTACHMENT_EXTENSIONS.has(extension)) {
          toast.error(`"${file.name}" is not an allowed email attachment.`);
          continue;
        }
        if (file.size > MAX_ATTACHMENT_BYTES) {
          toast.error(`"${file.name}" is larger than 10MB.`);
          continue;
        }
        if (currentBytes + addedBytes + file.size > MAX_TOTAL_ATTACHMENT_BYTES) {
          toast.error('Total attachments cannot exceed 20MB.');
          break;
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 160) || 'attachment';
        const path = `email-attachments/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from('public').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (error) throw error;

        const { data } = supabase.storage.from('public').getPublicUrl(path);
        next.push({ url: data.publicUrl, name: file.name, type: file.type, size: file.size });
        addedBytes += file.size;
      }

      if (next.length) {
        setAttachments(prev => [...prev, ...next]);
        toast.success(`${next.length} attachment${next.length > 1 ? 's' : ''} uploaded`);
      }
    } catch (error: any) {
      console.error('Attachment upload failed:', error);
      toast.error(error?.message || 'Attachment upload failed');
    } finally {
      setUploadingAttachment(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    }
  };

  const removeAttachment = (url: string) => {
    setAttachments(prev => prev.filter(a => a.url !== url));
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllRecipients = () => {
    setSelectedRecipients(prev =>
      prev.size === filteredRecipients.length
        ? new Set()
        : new Set(filteredRecipients.map(r => r.id))
    );
  };

  const validateCampaign = () => {
    if (!name.trim()) return 'Give the campaign a name.';
    if (!subject.trim()) return 'Enter an email subject.';
    if (!htmlToPlainText(bodyHtml)) return 'Write some email content.';
    if (!selectedEmailRecords.length) return 'Select at least one recipient.';
    return null;
  };

  const saveDraft = async () => {
    const errorMessage = validateCampaign();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      const plainText = htmlToPlainText(bodyHtml);
      const { error } = await supabase.from('email_campaigns').insert({
        name: name.trim(),
        subject: subject.trim(),
        body: plainText,
        body_html: safeHtml(bodyHtml),
        attachments,
        recipient_filter: recipientFilter,
        recipient_emails: selectedEmailRecords.map(r => r.email),
        total_recipients: selectedEmailRecords.length,
        status: 'draft',
        created_by: user?.id,
      });

      if (error) throw error;
      toast.success('Campaign saved as draft');
      setDialogOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      toast.error(error?.message || 'Failed to save campaign');
    }
  };

  const sendCampaign = async () => {
    const errorMessage = validateCampaign();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    if (!confirm(`Send "${name.trim()}" to ${selectedEmailRecords.length} recipient${selectedEmailRecords.length === 1 ? '' : 's'} now?`)) return;

    setSending(true);
    setSendProgress(0);

    try {
      const plainText = htmlToPlainText(bodyHtml);
      const sanitizedHtml = safeHtml(bodyHtml);
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          name: name.trim(),
          subject: subject.trim(),
          body: plainText,
          body_html: sanitizedHtml,
          attachments,
          recipient_filter: recipientFilter,
          recipient_emails: selectedEmailRecords.map(r => r.email),
          total_recipients: selectedEmailRecords.length,
          status: 'sending',
          created_by: user?.id,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      let sentCount = 0;
      let failedCount = 0;

      for (let i = 0; i < selectedEmailRecords.length; i++) {
        const recipient = selectedEmailRecords[i];
        try {
          const personalizedHtml = sanitizedHtml
            .replace(/\{\{name\}\}/g, DOMPurify.sanitize(recipient.name || 'Valued Customer'))
            .replace(/\{\{email\}\}/g, DOMPurify.sanitize(recipient.email))
            .replace(/\{\{date\}\}/g, new Date().toLocaleDateString());

          const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
              to: recipient.email,
              subject: subject.trim(),
              html: personalizedHtml,
              text: plainText
                .replace(/\{\{name\}\}/g, recipient.name || 'Valued Customer')
                .replace(/\{\{email\}\}/g, recipient.email)
                .replace(/\{\{date\}\}/g, new Date().toLocaleDateString()),
              attachments,
              eventKey: `campaign:${campaign.id}:${recipient.email.toLowerCase()}`,
            },
          });

          if (error) throw error;
          if (!data?.success) throw new Error(data?.error || 'Email could not be sent');
          sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error);
          failedCount++;
        }

        setSendProgress(Math.round(((i + 1) / selectedEmailRecords.length) * 100));
      }

      await supabase.from('email_campaigns').update({
        status: failedCount === selectedEmailRecords.length ? 'failed' : 'completed',
        sent_count: sentCount,
        failed_count: failedCount,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', campaign.id);

      if (failedCount === 0) toast.success(`Campaign sent successfully to ${sentCount} recipients`);
      else toast.warning(`Campaign completed: ${sentCount} sent, ${failedCount} failed`);

      setDialogOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      toast.error(error?.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
      if (error) throw error;
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'completed') return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
    if (status === 'sending') return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200"><RefreshCw className="mr-1 h-3 w-3 animate-spin" />Sending</Badge>;
    if (status === 'failed') return <Badge className="bg-red-500/10 text-red-700 border-red-200"><XCircle className="mr-1 h-3 w-3" />Failed</Badge>;
    return <Badge className="bg-slate-100 text-slate-700 border-slate-200"><Clock className="mr-1 h-3 w-3" />Draft</Badge>;
  };

  return (
    <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-[0_18px_60px_rgba(31,36,48,0.08)] backdrop-blur-xl">
      <CardHeader className="border-b border-slate-200/70 bg-white/70 px-5 py-5 backdrop-blur-xl sm:px-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-2">
                <Mail className="h-5 w-5 text-purple-700" />
              </div>
              Bulk Email & Campaigns
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-slate-500">
              Create branded campaigns with rich content, inline images, attachments and controlled recipient lists.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading} className="border-slate-200 bg-white/80 text-slate-700">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={openCreate} className="gap-2 bg-[#5b2a86] text-white shadow-lg shadow-purple-900/10 hover:bg-[#4b226f]">
              <Plus className="h-4 w-4" /> New Campaign
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-7">
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-purple-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No campaigns yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Create a campaign and send a polished Bridgefort Homes email directly from the Admin Console.</p>
            <Button onClick={openCreate} className="mt-5 bg-[#5b2a86] text-white">Create your first campaign</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="group rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-slate-900">{campaign.name}</h3>
                      {statusBadge(campaign.status)}
                      {campaign.attachments?.length > 0 && (
                        <Badge variant="outline" className="border-slate-200 text-slate-600">
                          <Paperclip className="mr-1 h-3 w-3" /> {campaign.attachments.length}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-purple-800">{campaign.subject}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{campaign.total_recipients || 0} recipients</span>
                      <span>{campaign.sent_count || 0} sent</span>
                      <span>{campaign.failed_count || 0} failed</span>
                      <span>{new Date(campaign.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCampaign(campaign.id)} className="self-end text-slate-400 hover:bg-red-50 hover:text-red-600 lg:self-auto">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open && !sending) resetForm(); }}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent className="max-h-[94vh] max-w-[1400px] overflow-y-auto border-slate-200 bg-[#eef0f5]/95 p-0 text-slate-900 shadow-2xl backdrop-blur-2xl">
          <DialogHeader className="sticky top-0 z-20 border-b border-white/70 bg-white/80 px-5 py-4 backdrop-blur-2xl sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl text-slate-900">
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-2"><Sparkles className="h-5 w-5 text-purple-700" /></div>
                  Create Email Campaign
                </DialogTitle>
                <p className="mt-1 text-sm text-slate-500">Compose on a clean white canvas with the Bridgefort liquid-glass visual language.</p>
              </div>
              <Badge className="hidden border-purple-200 bg-purple-50 text-purple-800 sm:flex"><ShieldCheck className="mr-1 h-3 w-3" /> Admin only</Badge>
            </div>
          </DialogHeader>

          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(330px,.75fr)] sm:p-7">
            <section className="min-w-0 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700">Campaign name *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. October Property Opportunities" className="border-slate-200 bg-white/80 text-slate-900 shadow-sm focus-visible:ring-purple-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Use email template</Label>
                  <Select onValueChange={applyTemplate}>
                    <SelectTrigger className="border-slate-200 bg-white/80 text-slate-900"><SelectValue placeholder="Choose a saved template..." /></SelectTrigger>
                    <SelectContent>
                      {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Subject *</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line" className="border-slate-200 bg-white/80 text-slate-900 shadow-sm focus-visible:ring-purple-500" />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-[0_14px_45px_rgba(31,36,48,0.06)] backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Email body</p>
                    <p className="text-xs text-slate-500">Format text, add links, and upload images directly into the message.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="border-slate-200 bg-white">
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </Button>
                </div>
                <div className="p-3 sm:p-4">
                  <RichTextEditor
                    value={bodyHtml}
                    onChange={setBodyHtml}
                    placeholder="Write your campaign message..."
                    maxLength={30000}
                    minHeightClassName="min-h-[330px]"
                    maxHeightClassName="max-h-[520px]"
                  />
                  <p className="mt-2 text-xs text-slate-400">Personalisation: <span className="font-medium text-slate-600">{{name}}</span>, <span className="font-medium text-slate-600">{{email}}</span>, <span className="font-medium text-slate-600">{{date}}</span></p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Paperclip className="h-4 w-4 text-purple-700" /> Attachments</p>
                    <p className="mt-1 text-xs text-slate-500">Up to 10MB per file and 20MB total. Images for the body can be inserted separately in the editor.</p>
                  </div>
                  <input ref={attachmentInputRef} type="file" multiple className="hidden" onChange={e => uploadAttachments(e.target.files)} />
                  <Button type="button" variant="outline" onClick={() => attachmentInputRef.current?.click()} disabled={uploadingAttachment} className="border-slate-200 bg-white">
                    {uploadingAttachment ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Add files
                  </Button>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map(file => (
                      <div key={file.url} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                        {file.type?.startsWith('image/') ? <ImageIcon className="h-4 w-4 text-purple-700" /> : <FileText className="h-4 w-4 text-slate-500" />}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                          <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAttachment(file.url)} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="min-w-0 space-y-5">
              <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_18px_55px_rgba(31,36,48,0.08)] backdrop-blur-2xl sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users className="h-4 w-4 text-purple-700" /> Recipients</p>
                    <p className="mt-1 text-xs text-slate-500">{selectedEmailRecords.length} selected</p>
                  </div>
                  <Badge variant="outline" className="border-slate-200 bg-white/70 text-slate-600"><CalendarDays className="mr-1 h-3 w-3" /> Send now</Badge>
                </div>

                <div className="mt-4 space-y-3">
                  <Select value={recipientFilter} onValueChange={setRecipientFilter}>
                    <SelectTrigger className="border-slate-200 bg-white/80 text-slate-900"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All users & subscribers</SelectItem>
                      <SelectItem value="subscribers">Newsletter subscribers</SelectItem>
                      <SelectItem value="clients">Registered users</SelectItem>
                      <SelectItem value="custom">Custom email list</SelectItem>
                    </SelectContent>
                  </Select>

                  {recipientFilter === 'custom' ? (
                    <textarea
                      value={customEmails}
                      onChange={e => setCustomEmails(e.target.value)}
                      placeholder="name@example.com, another@example.com"
                      className="min-h-[160px] w-full resize-y rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-900 outline-none ring-offset-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search recipients..." className="border-slate-200 bg-white/80 pl-9 text-slate-900" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{filteredRecipients.length} visible</span>
                        <Button type="button" variant="ghost" size="sm" onClick={toggleAllRecipients} className="h-7 px-2 text-xs text-purple-800 hover:bg-purple-50">
                          {selectedRecipients.size === filteredRecipients.length && filteredRecipients.length > 0 ? 'Deselect all' : 'Select all'}
                        </Button>
                      </div>
                      <ScrollArea className="h-[280px] rounded-xl border border-slate-200 bg-slate-50/70 p-2">
                        {loading ? (
                          <div className="flex h-full items-center justify-center text-sm text-slate-400"><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading recipients...</div>
                        ) : filteredRecipients.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-sm text-slate-400">No recipients found</div>
                        ) : (
                          <div className="space-y-1">
                            {filteredRecipients.map(recipient => (
                              <label key={recipient.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white">
                                <Checkbox checked={selectedRecipients.has(recipient.id)} onCheckedChange={() => toggleRecipient(recipient.id)} />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-800">{recipient.name}</p>
                                  <p className="truncate text-xs text-slate-500">{recipient.email}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(31,36,48,0.08)]">
                <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Eye className="h-4 w-4 text-purple-700" /> Email theme</p>
                </div>
                <div className="p-3">
                  <div className="rounded-xl border border-slate-200 bg-[#eef0f5] p-2">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 bg-white p-3 text-center">
                        <img src="/lovable-uploads/BridgefortHomesLogo.png" alt="Bridgefort Homes" className="mx-auto h-12 w-auto object-contain" />
                      </div>
                      <div className="p-4 text-xs leading-5 text-slate-700">
                        {subject ? <p className="mb-2 font-bold text-slate-900">{subject}</p> : <p className="mb-2 font-bold text-slate-400">Your subject appears here</p>}
                        <div dangerouslySetInnerHTML={{ __html: safeHtml(bodyHtml) }} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Every outgoing email sent through the shared Bridgefort template uses the same company logo, white content surface and dark-text branding.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Button type="button" variant="outline" onClick={saveDraft} disabled={sending} className="border-slate-200 bg-white text-slate-800">
                  <Save className="mr-2 h-4 w-4" /> Save Draft
                </Button>
                <Button type="button" onClick={sendCampaign} disabled={sending} className="bg-[#5b2a86] text-white shadow-lg shadow-purple-900/10 hover:bg-[#4b226f]">
                  {sending ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Sending {sendProgress}%</> : <><Send className="mr-2 h-4 w-4" /> Send Campaign</>}
                </Button>
                {sending && <Progress value={sendProgress} className="h-2" />}
              </div>
            </aside>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-slate-200 bg-[#eef0f5] p-0 text-slate-900">
          <DialogHeader className="border-b border-slate-200 bg-white/85 px-6 py-4 backdrop-blur-xl">
            <DialogTitle className="text-slate-900">Campaign Preview</DialogTitle>
          </DialogHeader>
          <div className="p-5 sm:p-8">
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(31,36,48,0.12)]">
              <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 text-center">
                <div className="mx-auto inline-flex rounded-2xl border border-purple-100 bg-white/80 p-3 shadow-lg shadow-purple-900/5">
                  <img src="/lovable-uploads/BridgefortHomesLogo.png" alt="Bridgefort Homes Development Ltd." className="h-20 w-auto max-w-full object-contain" />
                </div>
                <div className="mt-3 text-[10px] font-extrabold tracking-[0.18em] text-purple-800">BRINGING YOUR DREAM HOME</div>
              </div>
              <div className="prose prose-sm max-w-none px-6 py-7 text-slate-800 sm:px-9" dangerouslySetInnerHTML={{ __html: safeHtml(bodyHtml) }} />
              <div className="bg-[#171923] px-6 py-6 text-center text-xs text-slate-300">
                <div className="text-sm font-bold text-white">Bridgefort Homes Development Ltd.</div>
                <div className="mt-1">Bringing your dream home!</div>
                <div className="mt-2">www.bridgeforthomes.com · info@bridgeforthomes.com · sales@bridgeforthomes.com</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
