import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailClient';
import { useAuth } from '@/contexts/auth';

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  body: string;
  status: string;
  sent_at: string;
  sender_id: string | null;
}

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

interface UserContact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export function useEmail() {
  const { user } = useAuth();
  const [sentEmails, setSentEmails] = useState<EmailLog[]>([]);
  const [inboxMessages, setInboxMessages] = useState<ContactMessage[]>([]);
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchSentEmails = useCallback(async () => {
    try { setSentEmails(await emailService.getSentEmails()); }
    catch (error) { console.error('Error fetching sent emails:', error); }
  }, []);

  const fetchInboxMessages = useCallback(async (filter: 'all' | 'unread' | 'read' = 'all') => {
    try { setInboxMessages(await emailService.getInboxMessages(filter)); }
    catch (error) { console.error('Error fetching inbox messages:', error); }
  }, []);

  const fetchContacts = useCallback(async () => {
    try { setContacts(await emailService.getUserContacts()); }
    catch (error) { console.error('Error fetching contacts:', error); }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSentEmails(), fetchInboxMessages(), fetchContacts()]);
    setLoading(false);
  }, [fetchSentEmails, fetchInboxMessages, fetchContacts]);

  const sendEmail = useCallback(
    async (
      to: string,
      subject: string,
      body: string,
      recipientName?: string,
      fromMailbox?: string,
      cc?: string,
      bcc?: string,
    ) => {
      setSending(true);
      try {
        const result = await emailService.sendEmail({
          to,
          name: recipientName,
          subject,
          body,
          fromMailbox,
          cc,
          bcc,
        });
        if (result.success) {
          await emailService.logEmail(to, recipientName || null, subject, body, user?.id);
          await fetchSentEmails();
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally { setSending(false); }
    },
    [user, fetchSentEmails]
  );

  const replyToMessage = useCallback(
    async (message: ContactMessage, replySubject: string, replyBody: string, fromMailbox?: string) => {
      setSending(true);
      try {
        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="padding:30px;background:#fff"><p>Dear ${message.name},</p><div>${replyBody}</div><hr style="margin:20px 0;border:none;border-top:1px solid #eee"><p style="color:#666;font-size:12px">This is a reply to your message: "${message.subject}"</p></div></div>`;
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: { to: message.email, subject: replySubject, html, fromMailbox },
        });
        if (emailError) throw emailError;
        await emailService.markAsResponded(message.id, user?.id);
        await emailService.logEmail(message.email, message.name, replySubject, replyBody, user?.id);
        await fetchInboxMessages();
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally { setSending(false); }
    },
    [user, fetchInboxMessages]
  );

  const deleteEmailLog = useCallback(async (id: string) => {
    try { await emailService.deleteEmailLog(id); setSentEmails(prev => prev.filter(email => email.id !== id)); return { success: true }; }
    catch (error: any) { return { success: false, error: error.message }; }
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    try { await emailService.deleteContactMessage(id); setInboxMessages(prev => prev.filter(msg => msg.id !== id)); return { success: true }; }
    catch (error: any) { return { success: false, error: error.message }; }
  }, []);

  useEffect(() => {
    refreshAll();
    const emailLogsChannel = supabase.channel('email-logs-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'email_logs' }, fetchSentEmails).subscribe();
    const contactChannel = supabase.channel('contact-messages-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => fetchInboxMessages()).subscribe();
    return () => { supabase.removeChannel(emailLogsChannel); supabase.removeChannel(contactChannel); };
  }, []);

  return {
    sentEmails,
    inboxMessages,
    contacts,
    loading,
    sending,
    unreadCount: inboxMessages.filter(m => !m.responded).length,
    sendEmail,
    replyToMessage,
    deleteEmailLog,
    deleteMessage,
    fetchSentEmails,
    fetchInboxMessages,
    fetchContacts,
    refreshAll,
  };
}

export default useEmail;
