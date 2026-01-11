import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, Send, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface AdminProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
}

const AdminChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [admins, setAdmins] = useState<Map<string, AdminProfile>>(new Map());
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages((data as ChatMessage[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        const adminIds = adminRoles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, profile_picture_url')
          .in('id', adminIds);
        
        const adminMap = new Map<string, AdminProfile>();
        profiles?.forEach(profile => {
          adminMap.set(profile.id, profile);
        });
        setAdmins(adminMap);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchAdmins();

    // Real-time subscription for new messages
    const channel = supabase
      .channel('admin-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_chat_messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('admin_chat_messages')
        .insert({
          sender_id: user.id,
          content: messageContent,
          message_type: 'text'
        });

      if (error) throw error;
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      setNewMessage(messageContent);
    }
  };

  const getAdminName = (senderId: string) => {
    const admin = admins.get(senderId);
    if (!admin) return 'Admin';
    return `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Admin';
  };

  const getAdminInitials = (senderId: string) => {
    const admin = admins.get(senderId);
    if (!admin) return 'A';
    const first = admin.first_name?.[0] || '';
    const last = admin.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'A';
  };

  const getAdminAvatar = (senderId: string) => {
    const admin = admins.get(senderId);
    return admin?.profile_picture_url || '';
  };

  return (
    <Card className="bg-slate-800 border-slate-700 flex flex-col h-[500px]">
      <CardHeader className="border-b border-slate-700 py-3">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5" />
          Team Chat
          <span className="text-xs text-slate-400 ml-2">
            ({admins.size} admin{admins.size !== 1 ? 's' : ''})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-slate-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                    <div className="h-12 w-3/4 bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400">No messages yet</p>
                <p className="text-xs text-slate-500 mt-1">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === user?.id;
                const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    {showAvatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAdminAvatar(message.sender_id)} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getAdminInitials(message.sender_id)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8" />
                    )}
                    <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                      {showAvatar && (
                        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs font-medium text-slate-300">
                            {isOwnMessage ? 'You' : getAdminName(message.sender_id)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(message.created_at), 'h:mm a')}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
        <form onSubmit={sendMessage} className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-700 border-slate-600 text-white"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminChat;
