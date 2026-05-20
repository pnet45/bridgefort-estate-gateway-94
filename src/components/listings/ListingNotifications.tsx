import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, X } from 'lucide-react';
import { toast } from 'sonner';

interface Notif {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const ListingNotifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setItems((data as Notif[]) || []);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase
      .channel('user-notifs-' + user.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Notif;
          setItems(prev => [n, ...prev]);
          toast[n.type === 'success' ? 'success' : n.type === 'error' ? 'error' : 'info' as 'info']
            ? (toast as any)[n.type === 'success' ? 'success' : n.type === 'error' ? 'error' : 'message'](n.title, { description: n.message })
            : toast(n.title, { description: n.message });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await (supabase as any).from('user_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setItems(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const dismiss = async (id: string) => {
    await (supabase as any).from('user_notifications').delete().eq('id', id);
    setItems(prev => prev.filter(n => n.id !== id));
  };

  const unread = items.filter(n => !n.is_read).length;
  if (!items.length) return null;

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <h3 className="font-semibold">Notifications</h3>
          {unread > 0 && <Badge variant="default">{unread} new</Badge>}
          <button onClick={() => setOpen(o => !o)} className="text-xs text-muted-foreground ml-2">
            {open ? 'Hide' : 'Show'}
          </button>
        </div>
        {unread > 0 && (
          <Button size="sm" variant="ghost" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>
      {open && (
        <ul className="space-y-2 max-h-64 overflow-auto">
          {items.map(n => (
            <li key={n.id} className={`flex items-start justify-between gap-3 p-2 rounded border ${n.is_read ? 'bg-background' : 'bg-muted/40'}`}>
              <div className="min-w-0">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => dismiss(n.id)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default ListingNotifications;
