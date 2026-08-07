import { supabase } from '@/integrations/supabase/client';

export interface EmailMessage {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  html?: string;
  date: string;
  isRead: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash';
  attachments?: string[];
}

export interface SendEmailPayload {
  to: string;
  name?: string;
  subject: string;
  body: string;
  html?: string;
  fromMailbox?: string;
  fromName?: string;
}

export interface EmailDraft {
  id?: string;
  to: string;
  subject: string;
  body: string;
  savedAt: string;
}

// Email service for sending emails via edge function
export const emailService = {
  // Sends via the `send-email` function — direct Resend API call, no
  // external gateway dependency. This previously called `send-admin-email`,
  // which routes through a Lovable connector gateway
  // (connector-gateway.lovable.dev) that is no longer reachable — every
  // call through that path would fail with a non-2xx response. Gmail sends
  // go through gmail-sync's send-message action instead (see
  // AdminEmailCenter's handleComposeSend), not through this function at all.
  async sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; error?: string }> {
    try {
      const html =
        payload.html ||
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0;">Bridgefort Homes Development Ltd</h1>
          </div>
          <div style="padding: 30px; background: #fff;">
            ${payload.name ? `<p>Dear ${payload.name},</p>` : ''}
            <div style="white-space: pre-wrap;">${payload.body}</div>
          </div>
        </div>`;

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: payload.to,
          subject: payload.subject,
          html,
          text: payload.body,
          fromMailbox: payload.fromMailbox,
          fromName: payload.fromName,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  },


  // Log email to database
  async logEmail(
    recipientEmail: string,
    recipientName: string | null,
    subject: string,
    body: string,
    senderId?: string,
    status: string = 'sent'
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('email_logs').insert({
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject,
        body,
        sender_id: senderId,
        status,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging email:', error);
      return false;
    }
  },

  // Fetch email logs (sent emails)
  async getSentEmails(limit = 50) {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Fetch contact messages (incoming messages)
  async getInboxMessages(filter: 'all' | 'unread' | 'read' = 'all') {
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
    return data || [];
  },

  // Mark message as read/responded
  async markAsResponded(messageId: string, respondedBy?: string) {
    const { error } = await supabase
      .from('contact_messages')
      .update({
        responded: true,
        responded_at: new Date().toISOString(),
        responded_by: respondedBy,
      })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  },

  // Delete email log
  async deleteEmailLog(id: string) {
    const { error } = await supabase.from('email_logs').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Delete contact message
  async deleteContactMessage(id: string) {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Get user contacts (profiles with emails)
  async getUserContacts() {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name');

    if (profilesError) throw profilesError;

    // Fetch emails from auth.users via edge function
    const { data: usersData } = await supabase.functions.invoke('get-user-emails');

    return (profiles || []).map((profile) => ({
      ...profile,
      email: usersData?.users?.find((u: any) => u.id === profile.id)?.email || '',
    }));
  },
};

export default emailService;
