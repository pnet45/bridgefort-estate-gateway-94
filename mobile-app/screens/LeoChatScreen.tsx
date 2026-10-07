import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

type Message = { role: 'user' | 'assistant'; content: string };
type EmailDraft = { to: string | null; subject: string; body: string };
const INITIAL: Message = {
  role: 'assistant',
  content: "Hello, I'm Leo, the Bridgefort Homes assistant. I can help with your service journey and property questions.",
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export default function LeoChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [drafts, setDrafts] = useState<Record<number, EmailDraft>>({});
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      if (!user) return;
      try {
        const id = await AsyncStorage.getItem(`leo-conversation:${user.id}`);
        if (!id || cancelled) return;
        setConversationId(id);
        const { data, error: loadError } = await supabase.functions.invoke('property-assistant', {
          body: { action: 'load', conversationId: id },
        });
        if (cancelled) return;
        if (loadError || !Array.isArray(data?.messages)) {
          setConversationId('');
          await AsyncStorage.removeItem(`leo-conversation:${user.id}`);
          setError('Leo could not restore this conversation. You can still start a new message.');
          return;
        }
        setTrackingNumber(typeof data.trackingNumber === 'string' ? data.trackingNumber : '');
        setMessages([
          INITIAL,
          ...data.messages.filter((item: unknown): item is Message =>
            typeof item === 'object' && item !== null &&
            'role' in item && (item.role === 'user' || item.role === 'assistant') &&
            'content' in item && typeof item.content === 'string'
          ),
        ]);
      } catch {
        if (!cancelled) setError('Leo could not restore this conversation. You can still start a new message.');
      }
    };
    void restore();
    return () => { cancelled = true; };
  }, [user]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || sending || !user) return;
    setInput('');
    setError('');
    setSending(true);
    setMessages((current) => [...current, { role: 'user', content }]);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('property-assistant', {
        body: { action: 'chat', message: content, ...(conversationId ? { conversationId } : {}) },
      });
      if (typeof data?.conversationId === 'string') {
        setConversationId(data.conversationId);
        await AsyncStorage.setItem(`leo-conversation:${user.id}`, data.conversationId);
      }
      if (typeof data?.trackingNumber === 'string') setTrackingNumber(data.trackingNumber);
      if (invokeError) throw invokeError;
      if (typeof data?.reply !== 'string') throw new Error('Leo returned no response.');
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
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
          content: 'I could not email you because your account email is not verified.',
        }]);
      } else if (data.emailStatus === 'rate_limited') {
        setMessages((current) => [...current, {
          role: 'assistant',
          content: 'I reached the daily limit for automatic email follow-ups. Your enquiry remains saved under the tracking reference shown above.',
        }]);
      }
      if (data.emailDraft && typeof data.emailDraft === 'object') {
        const candidate = data.emailDraft;
        if (
          (candidate.to === null || typeof candidate.to === 'string') &&
          typeof candidate.subject === 'string' &&
          typeof candidate.body === 'string'
        ) {
          const assistantIndex = messages.length + 1;
          setDrafts((current) => ({
            ...current,
            [assistantIndex]: {
              to: candidate.to,
              subject: candidate.subject,
              body: candidate.body,
            },
          }));
        }
      }
    } catch {
      setInput(content);
      setError('Leo is temporarily unavailable. Your saved conversation can be retried.');
    } finally {
      setSending(false);
    }
  }, [conversationId, input, messages.length, sending, user]);

  const confirmAndSend = (draft: EmailDraft) => {
    if (!draft.to) {
      setError('Leo needs a valid recipient address before an email can be sent.');
      return;
    }
    Alert.alert(
      'Review email draft',
      `To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm and send',
          onPress: () => {
            void (async () => {
              setSending(true);
              setError('');
              try {
                const html = draft.body.split(/\r?\n/).map((line) => `<p>${escapeHtml(line || ' ')}</p>`).join('');
                const { error: emailError } = await supabase.functions.invoke('send-email', {
                  body: {
                    to: draft.to,
                    subject: draft.subject.replace(/[\r\n\0]/g, ' ').trim(),
                    text: draft.body,
                    html,
                  },
                });
                if (emailError) setError('The email was not sent. Check your authorized mailbox access.');
                else setMessages((current) => [...current, {
                  role: 'assistant',
                  content: `The email was sent to ${draft.to}. Reference: ${trackingNumber}.`,
                }]);
              } catch {
                setError('The email could not be sent. Check your connection and authorized mailbox access.');
              } finally {
                setSending(false);
              }
            })();
          },
        },
      ],
    );
  };

  const startNewInquiry = async () => {
    if (user) await AsyncStorage.removeItem(`leo-conversation:${user.id}`);
    setConversationId('');
    setTrackingNumber('');
    setMessages([INITIAL]);
    setDrafts({});
    setError('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Chat with Leo</Text>
              <Text style={styles.subtitle}>Bridgefort Homes service assistant</Text>
            </View>
            <Button title="New enquiry" onPress={() => void startNewInquiry()} />
          </View>
        </View>
        <Text style={styles.privacy}>
          Signed in as {user?.email}. Messages may be processed by Bridgefort's configured AI service and retained with your account until it is deleted. Do not share passwords or payment credentials.
        </Text>
        {trackingNumber ? (
          <Text style={styles.ticket}>Enquiry reference: {trackingNumber}</Text>
        ) : null}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message, index) => (
            <View key={`${index}-${message.role}`}>
              <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.messageText, message.role === 'user' && styles.userText]}>
                  {message.content}
                </Text>
              </View>
              {drafts[index] ? (
                <View style={styles.draft}>
                  <Text style={styles.draftTitle}>Email draft — review before sending</Text>
                  <Text>To: {drafts[index].to || 'Recipient needed'}</Text>
                  <Text>Subject: {drafts[index].subject}</Text>
                  <Text>{drafts[index].body}</Text>
                  <Button
                    title="Review and confirm email"
                    onPress={() => confirmAndSend(drafts[index])}
                    disabled={sending || !drafts[index].to}
                  />
                </View>
              ) : null}
            </View>
          ))}
          {sending ? <ActivityIndicator accessibilityLabel="Leo is responding" color="#1d4ed8" /> : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Leo a question…"
            accessibilityLabel="Ask Leo a question"
            multiline
            maxLength={1500}
            editable={!sending}
            returnKeyType="send"
          />
          <Button title="Send" onPress={() => void sendMessage()} disabled={!input.trim() || sending} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { color: '#0f172a', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#475569', fontSize: 15, marginTop: 4 },
  privacy: { color: '#475569', fontSize: 13, lineHeight: 19, marginBottom: 8 },
  ticket: { color: '#1e3a8a', backgroundColor: '#dbeafe', padding: 10, borderRadius: 8, fontWeight: '700', marginBottom: 8 },
  messages: { flexGrow: 1, gap: 12, paddingVertical: 8 },
  bubble: { maxWidth: '90%', borderRadius: 16, padding: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1d4ed8' },
  assistantBubble: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' },
  messageText: { color: '#0f172a', fontSize: 16, lineHeight: 23 },
  userText: { color: '#ffffff' },
  draft: { alignSelf: 'stretch', gap: 8, backgroundColor: '#fffbeb', borderColor: '#fcd34d', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 8 },
  draftTitle: { color: '#78350f', fontWeight: '700' },
  error: { color: '#b91c1c', fontSize: 14, padding: 8 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 8 },
  input: { flex: 1, minHeight: 48, maxHeight: 120, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#0f172a', backgroundColor: '#ffffff', fontSize: 16 },
});
