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

    // Update presence periodically
    const interval = setInterval(() => {
      updatePresence();
    }, 30000); // Every 30 seconds

    // Real-time subscription
    const channel = supabase
      .channel('admin-presence')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_presence' },
        () => fetchPresences()
      )
      .subscribe();

    // Set offline on page unload
    const handleUnload = async () => {
      if (user) {
        await supabase
          .from('admin_presence')
          .update({ is_online: false, status: 'offline' })
          .eq('user_id', user.id);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user]);

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

  const onlineCount = presences.filter(p => p.is_online).length;

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
              {presences.map((presence) => {
                const isMe = presence.user_id === user?.id;
                
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
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-800 ${getStatusColor(presence.status, presence.is_online)}`}
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
                        {presence.is_online ? presence.status : `Last seen ${formatDistanceToNow(new Date(presence.last_seen), { addSuffix: true })}`}
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
