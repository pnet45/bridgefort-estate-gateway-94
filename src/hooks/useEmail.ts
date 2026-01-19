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
    try {
      const emails = await emailService.getSentEmails();
      setSentEmails(emails);
    } catch (error) {
      console.error('Error fetching sent emails:', error);
    }
  }, []);

  const fetchInboxMessages = useCallback(async (filter: 'all' | 'unread' | 'read' = 'all') => {
    try {
      const messages = await emailService.getInboxMessages(filter);
      setInboxMessages(messages);
    } catch (error) {
      console.error('Error fetching inbox messages:', error);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const userContacts = await emailService.getUserContacts();
      setContacts(userContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSentEmails(), fetchInboxMessages(), fetchContacts()]);
    setLoading(false);
  }, [fetchSentEmails, fetchInboxMessages, fetchContacts]);

  const sendEmail = useCallback(
    async (to: string, subject: string, body: string, recipientName?: string) => {
      setSending(true);
      try {
        const result = await emailService.sendEmail({
          to,
          name: recipientName,
          subject,
          body,
        });

        if (result.success) {
          await emailService.logEmail(to, recipientName || null, subject, body, user?.id);
          await fetchSentEmails();
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setSending(false);
      }
    },
    [user, fetchSentEmails]
  );

  const replyToMessage = useCallback(
    async (message: ContactMessage, replySubject: string, replyBody: string) => {
      setSending(true);
      try {
        // Generate HTML for reply
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; text-align: center;">
              <h1 style="color: #fff; margin: 0;">PWAN Bridgefort</h1>
            </div>
            <div style="padding: 30px; background: #fff;">
              <p>Dear ${message.name},</p>
              <div style="white-space: pre-wrap;">${replyBody}</div>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                This is a reply to your message: "${message.subject}"
              </p>
            </div>
            <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>PWAN Bridgefort | 3 Isoko Drive, Off NTA Road, Asaba, Delta State</p>
            </div>
          </div>
        `;

        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: message.email,
            subject: replySubject,
            html,
          },
        });

        if (emailError) throw emailError;

        // Mark as responded
        await emailService.markAsResponded(message.id, user?.id);

        // Log the email
        await emailService.logEmail(
          message.email,
          message.name,
          replySubject,
          replyBody,
          user?.id
        );

        await fetchInboxMessages();
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setSending(false);
      }
    },
    [user, fetchInboxMessages]
  );

  const deleteEmailLog = useCallback(
    async (id: string) => {
      try {
        await emailService.deleteEmailLog(id);
        setSentEmails((prev) => prev.filter((email) => email.id !== id));
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    []
  );

  const deleteMessage = useCallback(
    async (id: string) => {
      try {
        await emailService.deleteContactMessage(id);
        setInboxMessages((prev) => prev.filter((msg) => msg.id !== id));
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    []
  );

  // Set up real-time subscriptions
  useEffect(() => {
    refreshAll();

    const emailLogsChannel = supabase
      .channel('email-logs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_logs' }, fetchSentEmails)
      .subscribe();

    const contactChannel = supabase
      .channel('contact-messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () =>
        fetchInboxMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(emailLogsChannel);
      supabase.removeChannel(contactChannel);
    };
  }, []);

  const unreadCount = inboxMessages.filter((m) => !m.responded).length;

  return {
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
    fetchSentEmails,
    fetchInboxMessages,
    fetchContacts,
    refreshAll,
  };
}

export default useEmail;
