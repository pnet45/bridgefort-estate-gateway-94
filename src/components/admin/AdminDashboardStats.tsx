import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building2, DollarSign, FileText, Mail, UserCheck, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Stats {
  totalUsers: number;
  totalProperties: number;
  totalRevenue: number;
  totalOrders: number;
  totalBlogs: number;
  pendingApprovals: number;
  contactMessages: number;
  trainingEvents: number;
}

type RefreshKey = 'users' | 'properties' | 'orders' | 'blogs' | 'approvals' | 'messages' | 'events';

const REFRESH_KEYS: RefreshKey[] = [
  'users',
  'properties',
  'orders',
  'blogs',
  'approvals',
  'messages',
  'events',
];

const AdminDashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProperties: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalBlogs: 0,
    pendingApprovals: 0,
    contactMessages: 0,
    trainingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const requestVersions: Record<RefreshKey, number> = {
      users: 0,
      properties: 0,
      orders: 0,
      blogs: 0,
      approvals: 0,
      messages: 0,
      events: 0,
    };

    // Keep admin-only metrics in component memory. Never put profiles, orders,
    // payment totals, or approval/message counts in the public browser cache.
    const refreshMetric = async (key: RefreshKey) => {
      const requestVersion = ++requestVersions[key];

      try {
        switch (key) {
          case 'users': {
            const { count, error } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true });
            if (error) throw error;
            if (mounted && requestVersions.users === requestVersion) {
              setStats((previous) => ({ ...previous, totalUsers: count ?? 0 }));
            }
            break;
          }
          case 'properties': {
            const { count, error } = await supabase
              .from('estate')
              .select('*', { count: 'exact', head: true });
            if (error) throw error;
            if (mounted && requestVersions.properties === requestVersion) {
              setStats((previous) => ({ ...previous, totalProperties: count ?? 0 }));
            }
            break;
          }
          case 'orders': {
            const { data, error } = await supabase
              .from('orders')
              .select('total_amount, payment_status');
            if (error) throw error;
            const orders = data ?? [];
            const totalRevenue = orders.reduce((sum, order) => {
              if (order.payment_status === 'completed' || order.payment_status === 'success') {
                return sum + (order.total_amount || 0);
              }
              return sum;
            }, 0);
            if (mounted && requestVersions.orders === requestVersion) {
              setStats((previous) => ({
                ...previous,
                totalRevenue,
                totalOrders: orders.length,
              }));
            }
            break;
          }
          case 'blogs': {
            const { count, error } = await supabase
              .from('posts')
              .select('*', { count: 'exact', head: true });
            if (error) throw error;
            if (mounted && requestVersions.blogs === requestVersion) {
              setStats((previous) => ({ ...previous, totalBlogs: count ?? 0 }));
            }
            break;
          }
          case 'approvals': {
            const { count, error } = await supabase
              .from('pending_admin_requests')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'pending');
            if (error) throw error;
            if (mounted && requestVersions.approvals === requestVersion) {
              setStats((previous) => ({ ...previous, pendingApprovals: count ?? 0 }));
            }
            break;
          }
          case 'messages': {
            const { count, error } = await supabase
              .from('contact_messages')
              .select('*', { count: 'exact', head: true })
              .eq('responded', false);
            if (error) throw error;
            if (mounted && requestVersions.messages === requestVersion) {
              setStats((previous) => ({ ...previous, contactMessages: count ?? 0 }));
            }
            break;
          }
          case 'events': {
            const { count, error } = await supabase
              .from('training_events')
              .select('*', { count: 'exact', head: true });
            if (error) throw error;
            if (mounted && requestVersions.events === requestVersion) {
              setStats((previous) => ({ ...previous, trainingEvents: count ?? 0 }));
            }
            break;
          }
        }
      } catch (error) {
        // A failed background refresh must not blank a previously loaded metric.
        console.error(`Error refreshing admin dashboard metric (${key}):`, error);
      }
    };

    const loadInitialStats = async () => {
      await Promise.all(REFRESH_KEYS.map((key) => refreshMetric(key)));
      if (mounted) setLoading(false);
    };

    void loadInitialStats();

    // Realtime is enabled for estate, posts and training_events in the
    // current database publication. Refresh only those metrics on table events.
    const channel = supabase
      .channel('stats-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estate' }, () => { void refreshMetric('properties'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => { void refreshMetric('blogs'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_events' }, () => { void refreshMetric('events'); })
      .subscribe();

    // The current Realtime publication does not include profiles, orders,
    // pending_admin_requests or contact_messages. Refresh these admin-only
    // metrics while the dashboard is visible without changing production DB
    // publication settings or persisting private data in browser storage.
    const refreshNonRealtimeMetrics = () => {
      if (document.visibilityState !== 'visible' || !navigator.onLine) return;
      void Promise.all([
        refreshMetric('users'),
        refreshMetric('orders'),
        refreshMetric('approvals'),
        refreshMetric('messages'),
      ]);
    };
    const pollId = window.setInterval(refreshNonRealtimeMetrics, 60_000);
    window.addEventListener('focus', refreshNonRealtimeMetrics);
    window.addEventListener('online', refreshNonRealtimeMetrics);
    document.addEventListener('visibilitychange', refreshNonRealtimeMetrics);

    return () => {
      mounted = false;
      window.clearInterval(pollId);
      window.removeEventListener('focus', refreshNonRealtimeMetrics);
      window.removeEventListener('online', refreshNonRealtimeMetrics);
      document.removeEventListener('visibilitychange', refreshNonRealtimeMetrics);
      void supabase.removeChannel(channel);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Properties',
      value: stats.totalProperties.toLocaleString(),
      icon: Building2,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
      iconColor: 'text-green-400'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Blog Posts',
      value: stats.totalBlogs.toLocaleString(),
      icon: FileText,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      iconColor: 'text-indigo-400'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toLocaleString(),
      icon: UserCheck,
      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      iconColor: 'text-yellow-400'
    },
    {
      title: 'Unread Messages',
      value: stats.contactMessages.toLocaleString(),
      icon: Mail,
      color: 'bg-red-500/10 text-red-400 border-red-500/20',
      iconColor: 'text-red-400'
    },
    {
      title: 'Training Events',
      value: stats.trainingEvents.toLocaleString(),
      icon: Calendar,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      iconColor: 'text-cyan-400'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Loading dashboard statistics">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-slate-700/50 bg-slate-800/60 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className={`border ${stat.color} bg-slate-800/50`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminDashboardStats;
