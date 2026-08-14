import { supabase } from '@/integrations/supabase/client';

export interface EmailMessage {
  id: string; to: string; from: string; subject: string; body: string; html?: string; date: string; isRead: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash'; attachments?: string[];
}

export interface SendEmailPayload {
  to: string;
  name?: string;
  subject: string;
  body: string;
  html?: string;
  fromMailbox?: string;
  fromName?: string;
  cc?: string;
  bcc?: string;
}

export interface EmailDraft { id?: string; to: string; subject: string; body: string; savedAt: string; }

/**
 * Central email service.
 *
 * Department mailbox sends must use the Gmail OAuth connection for the
 * selected mailbox. The legacy `send-email` function is kept for generic
 * Resend-based application mail, but it must not be used for an assigned
 * Gmail mailbox because the two providers have different authorization
 * records.
 */
export const emailService = {
  async sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; error?: string }> {
    try {
      const html = payload.html || `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:20px;text-align:center"><h1 style="color:#fff;margin:0">Bridgefort Homes Development Ltd</h1></div><div style="padding:30px;background:#fff">${payload.name ? `<p>Dear ${payload.name},</p>` : ''}<div style="white-space:pre-wrap">${payload.body}</div></div></div>`;

      // When an administrator selects a mailbox from Email Center, that
      // mailbox is an OAuth/Gmail account. Route it through gmail-sync so the
      // backend checks the Gmail mailbox assignment and sends through the
      // actual connected Google account.
      if (payload.fromMailbox) {
        const { data, error } = await supabase.functions.invoke('gmail-sync', {
          body: {
            action: 'send-message',
            mailboxEmail: payload.fromMailbox,
            to: payload.to,
            subject: payload.subject,
            html,
            cc: payload.cc,
            bcc: payload.bcc,
          },
        });

        if (error) throw new Error(error.message || 'Gmail send request failed');
        if (!data?.success) throw new Error(data?.error || 'Gmail could not send the message');
        return { success: true };
      }

      // Preserve the existing application-email path for callers that do not
      // specify a department mailbox.
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: payload.to,
          subject: payload.subject,
          html,
          text: payload.body,
          fromName: payload.fromName,
          cc: payload.cc,
          bcc: payload.bcc,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Email sending failed');
      return { success: true };
    } catch (error: any) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message || 'Unable to send email' };
    }
  },

  async logEmail(recipientEmail: string, recipientName: string | null, subject: string, body: string, senderId?: string, status: string = 'sent'): Promise<boolean> {
    try {
      const { error } = await supabase.from('email_logs').insert({ recipient_email: recipientEmail, recipient_name: recipientName, subject, body, sender_id: senderId, status });
      if (error) throw error;
      return true;
    } catch (error) { console.error('Error logging email:', error); return false; }
  },

  async getSentEmails(limit = 50) {
    const { data, error } = await supabase.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getInboxMessages(filter: 'all' | 'unread' | 'read' = 'all') {
    let query = supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (filter === 'unread') query = query.eq('responded', false);
    else if (filter === 'read') query = query.eq('responded', true);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async markAsResponded(messageId: string, respondedBy?: string) {
    const { error } = await supabase.from('contact_messages').update({ responded: true, responded_at: new Date().toISOString(), responded_by: respondedBy }).eq('id', messageId);
    if (error) throw error;
    return true;
  },

  async deleteEmailLog(id: string) { const { error } = await supabase.from('email_logs').delete().eq('id', id); if (error) throw error; return true; },
  async deleteContactMessage(id: string) { const { error } = await supabase.from('contact_messages').delete().eq('id', id); if (error) throw error; return true; },

  async getUserContacts() {
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, first_name, last_name');
    if (profilesError) throw profilesError;
    const { data: usersData } = await supabase.functions.invoke('get-user-emails');
    return (profiles || []).map(profile => ({ ...profile, email: usersData?.users?.find((u: any) => u.id === profile.id)?.email || '' }));
  },
};

export default emailService;
