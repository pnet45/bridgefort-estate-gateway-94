import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Mail, UserCheck, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'contact_message' | 'admin_request';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  entityId: string;
}

interface AdminNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Real-time subscription for new contact messages
    const contactChannel = supabase
      .channel('notification-contacts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, (payload) => {
        const newMessage = payload.new as any;
        const newNotification: Notification = {
          id: `contact-${newMessage.id}`,
          type: 'contact_message',
          title: 'New Contact Message',
          message: `${newMessage.name}: ${newMessage.subject}`,
          created_at: newMessage.created_at,
          read: false,
          entityId: newMessage.id
        };
        setNotifications(prev => [newNotification, ...prev]);
        
        toast({
          title: "📬 New Contact Message",
          description: `From ${newMessage.name}: ${newMessage.subject}`,
        });
      })
      .subscribe();

    // Real-time subscription for new admin requests
    const adminChannel = supabase
      .channel('notification-admin-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pending_admin_requests' }, (payload) => {
        const newRequest = payload.new as any;
        const newNotification: Notification = {
          id: `admin-${newRequest.id}`,
          type: 'admin_request',
          title: 'New Admin Request',
          message: `${newRequest.first_name || ''} ${newRequest.last_name || ''} (${newRequest.email}) requested admin access`,
          created_at: newRequest.created_at,
          read: false,
          entityId: newRequest.id
        };
        setNotifications(prev => [newNotification, ...prev]);
        
        toast({
          title: "🔐 New Admin Request",
          description: `${newRequest.email} is requesting admin access`,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(contactChannel);
      supabase.removeChannel(adminChannel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch recent contact messages
      const { data: contacts } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('responded', false)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch pending admin requests
      const { data: adminRequests } = await supabase
        .from('pending_admin_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      const contactNotifications: Notification[] = (contacts || []).map(c => ({
        id: `contact-${c.id}`,
        type: 'contact_message',
        title: 'Contact Message',
        message: `${c.name}: ${c.subject}`,
        created_at: c.created_at || new Date().toISOString(),
        read: c.responded || false,
        entityId: c.id
      }));

      const adminNotifications: Notification[] = (adminRequests || []).map(r => ({
        id: `admin-${r.id}`,
        type: 'admin_request',
        title: 'Admin Request',
        message: `${r.first_name || ''} ${r.last_name || ''} (${r.email})`,
        created_at: r.created_at,
        read: false,
        entityId: r.id
      }));

      const allNotifications = [...contactNotifications, ...adminNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'contact_message') {
      onNavigate('overview');
    } else if (notification.type === 'admin_request') {
      onNavigate('approvals');
    }
    onClose();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-80">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-3 rounded-lg text-left hover:bg-slate-700/50 transition-colors flex items-start gap-3 ${
                  !notification.read ? 'bg-slate-700/30' : ''
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  notification.type === 'contact_message' 
                    ? 'bg-blue-900/30 text-blue-400' 
                    : 'bg-purple-900/30 text-purple-400'
                }`}>
                  {notification.type === 'contact_message' ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AdminNotificationCenter;
