import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Bell, Mail, Wallet, CreditCard, Cake, MessageSquare, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const iconFor = (type: string) => {
  if (type.includes('withdrawal')) return Wallet;
  if (type.includes('payment')) return CreditCard;
  if (type.includes('birthday')) return Cake;
  if (type.includes('message') || type.includes('email')) return Mail;
  if (type.includes('call')) return Phone;
  if (type.includes('renewal') || type.includes('reminder')) return AlertCircle;
  return MessageSquare;
};

interface NotificationBellProps {
  audience: 'user' | 'admin';
  /** Extra classes for the trigger button, e.g. to match a dark admin header vs a light dashboard. */
  triggerClassName?: string;
}

// Shared bell used on both the client dashboard and the admin console.
// Reads from the `notifications` table (renewal reminders, payment/
// withdrawal status changes, birthday alerts, etc.), and renders the dropdown
// with a high z-index so it always draws on top of page content rather than
// being clipped or hidden behind it.
const NotificationBell: React.FC<NotificationBellProps> = ({ audience, triggerClassName = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('audience', audience)
        .order('created_at', { ascending: false })
        .limit(30);

      query = audience === 'user' ? query.eq('user_id', user.id) : query;

      const { data, error } = await query;
      if (error) throw error;
      setNotifications((data || []) as NotificationRow[]);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, audience]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${audience}-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const row = payload.new as NotificationRow & { audience: string; user_id: string | null };
          const relevant = audience === 'user' ? row.user_id === user.id : row.audience === 'admin';
          if (relevant) setNotifications((prev) => [row, ...prev]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, audience]);

  // Close on outside click.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (n: NotificationRow) => {
    if (!n.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
      setNotifications((prev) => prev.map((row) => (row.id === n.id ? { ...row, is_read: true } : row)));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications((prev) => prev.map((row) => ({ ...row, is_read: true })));
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        className={`relative ${triggerClassName}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        // Fixed positioning + a very high z-index so this always renders in
        // front of everything else on the page (modals, sticky headers,
        // carousels, etc.) instead of getting stuck behind them.
        <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full sm:mt-2 w-[92vw] sm:w-96 max-w-sm bg-white border border-slate-200 rounded-xl shadow-2xl z-[9999]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-estate-blue hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ScrollArea className="h-80">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-estate-blue" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((n) => {
                  const Icon = iconFor(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full p-3 rounded-lg text-left hover:bg-slate-50 transition-colors flex items-start gap-3 ${!n.is_read ? 'bg-estate-blue/5' : ''}`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${!n.is_read ? 'bg-estate-blue/10 text-estate-blue' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${!n.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">{n.message}</p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 bg-estate-blue rounded-full mt-2 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
