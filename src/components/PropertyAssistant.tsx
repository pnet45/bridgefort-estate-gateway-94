import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, LoaderCircle, MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hello! I'm the Bridgefort Homes assistant. Ask me about our properties or services. For current prices and availability, I'll help you connect with our team.",
};

const PropertyAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: 'user' as const, content }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'property-assistant',
        { body: { messages: nextMessages.slice(-10).map(({ role, content: text }) => ({ role, content: text })) } },
      );
      if (invokeError) throw invokeError;
      if (typeof data?.reply !== 'string' || !data.reply.trim()) {
        throw new Error('The assistant returned an empty response.');
      }
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
    } catch {
      setInput(content);
      setError(
        "The assistant is temporarily unavailable. Please try again or contact our team on WhatsApp.",
      );
    } finally {
      setIsSending(false);
    }
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
                <p className="text-xs text-white/80">Property and service questions</p>
              </div>
            </div>
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
          </header>

          <div
            className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-base leading-6 ${
                  message.role === 'user'
                    ? 'ml-auto rounded-br-sm bg-estate-blue text-white'
                    : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                }`}
              >
                {message.content}
              </div>
            ))}
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
              disabled={isSending}
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
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </Button>
    </div>
  );
};

export default PropertyAssistant;
