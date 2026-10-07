import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, ClipboardList, LoaderCircle, MessageCircle, Send, X, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { hasPermission, isAdminRole } from '@/lib/rbac';

type EmailDraft = {
  to: string | null;
  subject: string;
  body: string;
};

type NextAction = { label: string; href: string };

type AdminLink = {
  label: string;
  href: string;
};

type TrackedInquiry = {
  id: string;
  tracking_number: string;
  actor_type: string;
  status: string;
  updated_at: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  emailDraft?: EmailDraft | null;
  nextAction?: NextAction | null;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hello, I'm Leo, the Bridgefort Homes assistant. I can help with your service journey, property questions, and follow-up. I only use information you are authorized to see.",
};

const getAssistantErrorMessage = async (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('context' in error)) return null;
  const context = error.context;
  if (!(context instanceof Response)) return null;
  try {
    const body: unknown = await context.clone().json();
    if (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'string'
    ) return body.error;
  } catch {
    return null;
  }
  return null;
};

const PropertyAssistant = ({ adminRoute = false }: { adminRoute?: boolean }) => {
  const { user, loading: authLoading, userRole, permissions } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = isAdminRole(userRole) || permissions.some((permission) => permission.startsWith('admin:'));
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [adminLinks, setAdminLinks] = useState<AdminLink[]>([]);
  const [inquiryPanelOpen, setInquiryPanelOpen] = useState(false);
  const [trackedInquiries, setTrackedInquiries] = useState<TrackedInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState('');
  const [selectedInquiryMessages, setSelectedInquiryMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setConversationId('');
      setTrackingNumber('');
      setMessages([INITIAL_MESSAGE]);
      return;
    }
    let cancelled = false;
    if (sessionStorage.getItem('leo-open-after-auth') === 'true') {
      sessionStorage.removeItem('leo-open-after-auth');
      setIsOpen(true);
    }
    const savedConversation = sessionStorage.getItem(`leo-conversation:${user.id}`);
    if (savedConversation) {
      setConversationId(savedConversation);
      supabase.functions.invoke('property-assistant', {
        body: { action: 'load', conversationId: savedConversation },
      }).then(({ data, error: loadError }) => {
        if (cancelled) return;
        if (loadError || !Array.isArray(data?.messages)) {
          setConversationId('');
          sessionStorage.removeItem(`leo-conversation:${user.id}`);
          setError('Leo could not restore this conversation. You can still start a new message.');
          return;
        }
        setTrackingNumber(typeof data.trackingNumber === 'string' ? data.trackingNumber : '');
        setMessages([
          INITIAL_MESSAGE,
          ...data.messages.filter((message: unknown): message is ChatMessage =>
            typeof message === 'object' &&
            message !== null &&
            'role' in message &&
            (message.role === 'user' || message.role === 'assistant') &&
            'content' in message &&
            typeof message.content === 'string'
          ),
        ]);
      }).catch(() => {
        if (cancelled) return;
        setConversationId('');
        sessionStorage.removeItem(`leo-conversation:${user.id}`);
        setError('Leo could not restore this conversation. You can still start a new message.');
      });
    }
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages, error]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  if (adminRoute && !isAdmin) return null;

  const openAssistant = () => {
    if (!user) {
      sessionStorage.setItem('leo-open-after-auth', 'true');
      const next = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/auth?next=${encodeURIComponent(next)}`);
      return;
    }
    setIsOpen((open) => !open);
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending || !user) return;

    const nextMessages = [...messages, { role: 'user' as const, content }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'property-assistant',
        { body: { action: 'chat', message: content, ...(conversationId ? { conversationId } : {}) } },
      );
      if (typeof data?.conversationId === 'string') {
        setConversationId(data.conversationId);
        sessionStorage.setItem(`leo-conversation:${user.id}`, data.conversationId);
      }
      if (typeof data?.trackingNumber === 'string') setTrackingNumber(data.trackingNumber);
      if (invokeError) throw invokeError;
      if (typeof data?.reply !== 'string' || !data.reply.trim()) {
        throw new Error('The assistant returned an empty response.');
      }
      setAdminLinks(Array.isArray(data.adminLinks) ? data.adminLinks : []);
      setMessages((current) => [...current, {
        role: 'assistant',
        content: data.reply,
        emailDraft: data.emailDraft ?? null,
        nextAction: data.nextAction ?? null,
      }]);
      if (data.emailStatus === 'sent') {
        setMessages((current) => [...current, {
          role: 'assistant',
          content: `I sent the follow-up to your verified account email. Reference: ${data.trackingNumber}.`,
        }]);
      } else if (data.emailStatus === 'send_failed') {
        setMessages((current) => [...current, {
          role: 'assistant',
          content: 'I could not send the follow-up email, but your chat and enquiry reference are saved. Please try again later or contact our team.',
        }]);
      } else if (data.emailStatus === 'not_verified') {
        setMessages((current) => [...current, {
          role: 'assistant',
          content: 'I could not email you because your account email is not verified. Please verify it in your account settings.',
        }]);
      } else if (data.emailStatus === 'not_configured') {
        setMessages((current) => [...current, {
          role: 'assistant',
          content: 'Email follow-up is not configured yet. Your chat is saved under the tracking reference shown above.',
        }]);
      } else if (data.emailStatus === 'rate_limited') {
        setMessages((current) => [...current, {
          role: 'assistant',
          content: 'I reached the daily limit for automatic email follow-ups. Your enquiry remains saved under the tracking reference shown above.',
        }]);
      }
    } catch (sendError) {
      setInput(content);
      setError(
        await getAssistantErrorMessage(sendError) ??
          "Leo is temporarily unavailable. Your tracking reference and saved messages are kept; please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const sendAdminDraft = async (draft: EmailDraft) => {
    if (!draft.to || !user) {
      setError('Leo could not identify a recipient. Ask him to revise the draft with the intended email address.');
      return;
    }
    const confirmation = window.confirm(
      `Send this email from your authorized Bridgefort mailbox?\n\nTo: ${draft.to}\nSubject: ${draft.subject}`,
    );
    if (!confirmation) return;

    setError('');
    setIsSending(true);
    const safeHtml = draft.body.split(/\r?\n/).map((line) =>
      `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;') || ' '}</p>`
    ).join('');
    try {
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: draft.to,
          subject: draft.subject.replace(/[\r\n\0]/g, ' ').trim(),
          text: draft.body,
          html: safeHtml,
        },
      });
      if (emailError) throw emailError;
      setMessages((current) => [...current, {
        role: 'assistant',
        content: `The email was sent to ${draft.to}. Reference: ${trackingNumber}.`,
      }]);
    } catch {
      setError('The email was not sent. Check your authorized mailbox access and try again.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleInquiryMonitor = async () => {
    if (inquiryPanelOpen) {
      setInquiryPanelOpen(false);
      setSelectedInquiry('');
      setSelectedInquiryMessages([]);
      return;
    }
    setError('');
    setIsSending(true);
    try {
      const { data, error: listError } = await supabase.functions.invoke('property-assistant', {
        body: { action: 'list_inquiries' },
      });
      if (listError) throw listError;
      setTrackedInquiries(Array.isArray(data?.inquiries) ? data.inquiries : []);
      setInquiryPanelOpen(true);
    } catch {
      setError('Leo could not load enquiry tracking. Confirm you have CRM viewing permission.');
    } finally {
      setIsSending(false);
    }
  };

  const openTrackedInquiry = async (inquiry: TrackedInquiry) => {
    setError('');
    setIsSending(true);
    try {
      const { data, error: loadError } = await supabase.functions.invoke('property-assistant', {
        body: { action: 'load_inquiry', conversationId: inquiry.id },
      });
      if (loadError) throw loadError;
      setSelectedInquiry(inquiry.id);
      setSelectedInquiryMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch {
      setError('This enquiry transcript could not be loaded with your current permissions.');
    } finally {
      setIsSending(false);
    }
  };

  const startNewInquiry = () => {
    if (user) sessionStorage.removeItem(`leo-conversation:${user.id}`);
    setConversationId('');
    setTrackingNumber('');
    setMessages([INITIAL_MESSAGE]);
    setError('');
  };

  return (
    <div className="fixed bottom-6 right-4 z-[60] sm:right-6">
      {isOpen && (
        <section
          role="dialog"
          aria-label="Bridgefort Homes AI assistant"
          className="absolute bottom-16 right-0 flex h-[min(32rem,calc(100dvh_-_7rem))] w-[min(22rem,calc(100vw_-_2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-estate-blue px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Bot size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Bridgefort Assistant</h2>
                <p className="text-xs text-white/80">Leo · Your Bridgefort service journey</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11 text-white hover:bg-white/15 hover:text-white"
                onClick={startNewInquiry}
              >
                New enquiry
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-white hover:bg-white/15 hover:text-white"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                <X size={18} />
              </Button>
            </div>
          </header>

          <div
            className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4"
            aria-live="polite"
            aria-relevant="additions text"
          >
            <p className="text-xs leading-5 text-slate-600">
              Sign-in verified · Messages may be processed by Bridgefort's configured AI service and are saved under your account until it is deleted. Do not share passwords or payment credentials.
            </p>
            {trackingNumber && (
              <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900">
                Enquiry reference: <span className="font-bold">{trackingNumber}</span>
              </p>
            )}
            {isAdmin && hasPermission(permissions, 'admin:view_crm') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => void toggleInquiryMonitor()}
                disabled={isSending}
              >
                <ClipboardList size={16} />
                {inquiryPanelOpen ? 'Close enquiry monitor' : 'Monitor enquiries'}
              </Button>
            )}
            {inquiryPanelOpen && (
              <section aria-label="Tracked enquiries" className="space-y-2 rounded-lg border bg-white p-3">
                <h3 className="font-semibold text-slate-900">Recent tracked enquiries</h3>
                {trackedInquiries.length === 0 && (
                  <p className="text-sm text-slate-600">No tracked enquiries yet.</p>
                )}
                {trackedInquiries.map((inquiry) => (
                  <button
                    key={inquiry.id}
                    type="button"
                    onClick={() => void openTrackedInquiry(inquiry)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border p-2 text-left text-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-blue"
                  >
                    <span>
                      <span className="block font-semibold text-estate-blue">{inquiry.tracking_number}</span>
                      <span className="text-xs text-slate-600">{inquiry.actor_type} · {inquiry.status}</span>
                    </span>
                    <time className="text-xs text-slate-500" dateTime={inquiry.updated_at}>
                      {new Date(inquiry.updated_at).toLocaleDateString()}
                    </time>
                  </button>
                ))}
                {selectedInquiry && (
                  <div className="max-h-48 space-y-2 overflow-y-auto border-t pt-2">
                    {selectedInquiryMessages.map((message, index) => (
                      <p key={`${selectedInquiry}-${index}`} className="whitespace-pre-wrap text-sm text-slate-700">
                        <strong>{message.role === 'user' ? 'User' : 'Leo'}:</strong> {message.content}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            )}
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`}>
                <div
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-base leading-6 ${
                    message.role === 'user'
                      ? 'ml-auto rounded-br-sm bg-estate-blue text-white'
                      : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {message.content}
                </div>
                {message.nextAction && !isAdmin && (
                  <div className="mt-2">
                    <Link
                      to={message.nextAction.href}
                      className="inline-flex items-center rounded-lg bg-estate-blue px-3 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-blue"
                    >
                      {message.nextAction.label}
                    </Link>
                  </div>
                )}
                {message.emailDraft && isAdmin && (
                  <div className="mt-2 space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-amber-950">
                      <Mail size={16} aria-hidden="true" /> Email draft — review before sending
                    </div>
                    <p><strong>To:</strong> {message.emailDraft.to || 'Recipient needed'}</p>
                    <p><strong>Subject:</strong> {message.emailDraft.subject}</p>
                    <p className="whitespace-pre-wrap">{message.emailDraft.body}</p>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isSending || !message.emailDraft.to}
                      onClick={() => void sendAdminDraft(message.emailDraft!)}
                    >
                      Confirm and send
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isAdmin && adminLinks.length > 0 && (
              <nav aria-label="Admin console shortcuts" className="flex flex-wrap gap-2">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="rounded-full border border-estate-blue/30 bg-white px-3 py-2 text-sm text-estate-blue underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-blue"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
            {isSending && (
              <div className="flex items-center gap-2 text-sm text-slate-500" role="status">
                <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                Thinking…
              </div>
            )}
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t bg-white p-3">
            <label className="sr-only" htmlFor="property-assistant-message">
              Ask a question
            </label>
            <input
              id="property-assistant-message"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={1500}
              placeholder="Ask about properties or services…"
              disabled={isSending || authLoading}
              className="h-11 min-w-0 flex-1 rounded-full border border-slate-300 px-4 text-base outline-none focus:border-estate-blue focus:ring-2 focus:ring-estate-blue/20 disabled:bg-slate-100"
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full"
              disabled={!input.trim() || isSending}
              aria-label="Send message"
            >
              <Send size={17} />
            </Button>
          </form>
        </section>
      )}

      <Button
        type="button"
        className="h-12 min-w-12 rounded-full px-4 shadow-lg sm:h-14"
        onClick={openAssistant}
        aria-label={isOpen ? 'Close Leo chat' : 'Chat with Leo'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        <span>{isOpen ? 'Close Leo' : 'Chat with Leo'}</span>
      </Button>
    </div>
  );
};

export default PropertyAssistant;
