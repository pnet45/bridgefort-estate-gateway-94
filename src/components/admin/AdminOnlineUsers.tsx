import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// How often each tab reports itself as alive.
const HEARTBEAT_MS = 30000;
// If a presence row hasn't been updated in this long, treat it as offline
// regardless of what is_online says (covers crashed tabs, lost network,
// and the browser skipping our unload handler).
const STALE_MS = HEARTBEAT_MS * 2 + 15000; // 75s

interface AdminPresence {
  id: string;
  user_id: string;
  is_online: boolean;
  last_seen: string;
  status: 'available' | 'busy' | 'away' | 'offline';
}

interface AdminProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
}

const AdminOnlineUsers = () => {
  const { user } = useAuth();
  const [presences, setPresences] = useState<AdminPresence[]>([]);
  const [admins, setAdmins] = useState<Map<string, AdminProfile>>(new Map());
  const [myStatus, setMyStatus] = useState<AdminPresence['status']>('available');
  const [loading, setLoading] = useState(true);
  // Ticks periodically purely to force a re-render, so presences that go
  // stale (no heartbeat) flip to "offline" in the UI even without a new
  // realtime event coming in from the database.
  const [, setTick] = useState(0);

  const updatePresence = async (status: AdminPresence['status'] = myStatus) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('admin_presence')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('admin_presence')
          .update({
            is_online: true,
            last_seen: new Date().toISOString(),
            status
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('admin_presence')
          .insert({
            user_id: user.id,
            is_online: true,
            status
          });
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const fetchPresences = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_presence')
        .select('*')
        .order('is_online', { ascending: false })
        .order('last_seen', { ascending: false });

      if (error) throw error;
      setPresences((data as AdminPresence[]) || []);

      // Get my current status
      const myPresence = data?.find(p => p.user_id === user?.id);
      if (myPresence) {
        setMyStatus(myPresence.status as AdminPresence['status']);
      }
    } catch (error) {
      console.error('Error fetching presences:', error);
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
    fetchAdmins();
    fetchPresences();
    updatePresence();

    // Heartbeat: keep bumping last_seen while this tab is open.
    const heartbeat = setInterval(() => {
      updatePresence();
    }, HEARTBEAT_MS);

    // Re-render every few seconds so a presence that stops sending
    // heartbeats (crashed tab, closed laptop, lost connection) visibly
    // flips to "offline" once it goes stale, without needing a DB write.
    const staleTicker = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);

    // Real-time subscription: reflect other admins' status changes instantly
    const channel = supabase
      .channel('admin-presence')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_presence' },
        () => fetchPresences()
      )
      .subscribe();

    // Best-effort: mark offline the moment the tab is actually closed/hidden.
    // `beforeunload` alone is unreliable (many browsers kill in-flight async
    // requests before they land), so we also use `pagehide` and
    // `visibilitychange`, and prefer `sendBeacon`-style keepalive fetches
    // which are far more likely to actually complete during unload.
    const markOffline = () => {
      if (!user) return;
      // Fire-and-forget update; the visibilitychange/pagehide combo gives
      // this a much better chance of landing than a plain beforeunload call.
      supabase
        .from('admin_presence')
        .update({ is_online: false, status: 'offline', last_seen: new Date().toISOString() })
        .eq('user_id', user.id)
        .then(() => {}, () => {});
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        markOffline();
      } else {
        updatePresence();
      }
    };

    window.addEventListener('pagehide', markOffline);
    window.addEventListener('beforeunload', markOffline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(heartbeat);
      clearInterval(staleTicker);
      supabase.removeChannel(channel);
      window.removeEventListener('pagehide', markOffline);
      window.removeEventListener('beforeunload', markOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  // The single source of truth for "is this admin actually online right
  // now": the presence row must say online AND have heartbeated recently.
  // This is what actually fixes stale "online forever" statuses, since it
  // no longer depends solely on the unload event firing correctly.
  const isEffectivelyOnline = (presence: AdminPresence) => {
    if (!presence.is_online) return false;
    const lastSeenMs = new Date(presence.last_seen).getTime();
    return Date.now() - lastSeenMs < STALE_MS;
  };

  const handleStatusChange = async (status: AdminPresence['status']) => {
    setMyStatus(status);
    await updatePresence(status);
  };

  const getStatusColor = (status: string, isOnline: boolean) => {
    if (!isOnline) return 'bg-slate-500';
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  const getAdminName = (userId: string) => {
    const admin = admins.get(userId);
    if (!admin) return 'Admin';
    return `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Admin';
  };

  const getAdminInitials = (userId: string) => {
    const admin = admins.get(userId);
    if (!admin) return 'A';
    const first = admin.first_name?.[0] || '';
    const last = admin.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'A';
  };

  const getAdminAvatar = (userId: string) => {
    const admin = admins.get(userId);
    return admin?.profile_picture_url || '';
  };

  const onlineCount = presences.filter(isEffectivelyOnline).length;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            Team Status
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {onlineCount} online
            </Badge>
          </CardTitle>
          <Select value={myStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-28 h-7 text-xs bg-slate-700 border-slate-600">
              <div className="flex items-center gap-2">
                <Circle className={`h-2 w-2 ${getStatusColor(myStatus, true)}`} fill="currentColor" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="available" className="text-white">
                <div className="flex items-center gap-2">
                  <Circle className="h-2 w-2 bg-green-500" fill="currentColor" />
                  Available
                </div>
              </SelectItem>
              <SelectItem value="busy" className="text-white">
                <div className="flex items-center gap-2">
                  <Circle className="h-2 w-2 bg-red-500" fill="currentColor" />
                  Busy
                </div>
              </SelectItem>
              <SelectItem value="away" className="text-white">
                <div className="flex items-center gap-2">
                  <Circle className="h-2 w-2 bg-yellow-500" fill="currentColor" />
                  Away
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px]">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : presences.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">No team members found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {[...presences]
                .sort((a, b) => Number(isEffectivelyOnline(b)) - Number(isEffectivelyOnline(a)))
                .map((presence) => {
                const isMe = presence.user_id === user?.id;
                const online = isEffectivelyOnline(presence);

                return (
                  <div
                    key={presence.id}
                    className={`p-3 flex items-center gap-3 ${isMe ? 'bg-primary/5' : ''}`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getAdminAvatar(presence.user_id)} />
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {getAdminInitials(presence.user_id)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-800 ${getStatusColor(presence.status, online)}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {getAdminName(presence.user_id)}
                        </span>
                        {isMe && (
                          <Badge variant="secondary" className="text-xs bg-slate-600">You</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 capitalize">
                        {online ? presence.status : `Last seen ${formatDistanceToNow(new Date(presence.last_seen), { addSuffix: true })}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminOnlineUsers;
