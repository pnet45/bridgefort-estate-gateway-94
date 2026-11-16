import React, { useCallback, useEffect, useRef, useState } from 'react';
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

type StatKey = keyof Stats;

const INITIAL_STATS: Stats = {
  totalUsers: 0,
  totalProperties: 0,
  totalRevenue: 0,
  totalOrders: 0,
  totalBlogs: 0,
  pendingApprovals: 0,
  contactMessages: 0,
  trainingEvents: 0,
};

const AdminDashboardStats = () => {
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const requestVersions = useRef<Record<StatKey, number>>({
    totalUsers: 0,
    totalProperties: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalBlogs: 0,
    pendingApprovals: 0,
    contactMessages: 0,
    trainingEvents: 0,
  });

  // Admin metrics remain request-scoped in memory; they are never written to
  // the public browser cache. A table event refreshes only its own metric.
  const fetchOrdersMetrics = useCallback(async () => {
    const ordersVersion = ++requestVersions.current.totalOrders;
    const revenueVersion = ++requestVersions.current.totalRevenue;

    try {
      const [{ count, error: countError }, { data, error: revenueError }] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders')
          .select('total_amount')
          .in('payment_status', ['completed', 'success']),
      ]);
      if (countError) throw countError;
      if (revenueError) throw revenueError;

      const totalRevenue = (data || []).reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0,
      );

      if (requestVersions.current.totalOrders === ordersVersion) {
        setStats((previous) => ({ ...previous, totalOrders: count || 0 }));
      }
      if (requestVersions.current.totalRevenue === revenueVersion) {
        setStats((previous) => ({ ...previous, totalRevenue }));
      }
    } catch (error) {
      console.error('Error refreshing admin dashboard order metrics:', error);
    }
  }, []);

  const fetchMetric = useCallback(async (key: Exclude<StatKey, 'totalRevenue' | 'totalOrders'>) => {
    const requestVersion = ++requestVersions.current[key];

    try {
      let value = 0;

      switch (key) {
        case 'totalUsers': {
          const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
          if (error) throw error;
          value = count || 0;
          break;
        }
        case 'totalProperties': {
          const { count, error } = await supabase
            .from('estate')
            .select('*', { count: 'exact', head: true });
          if (error) throw error;
          value = count || 0;
          break;
        }
        case 'totalBlogs': {
          const { count, error } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });
          if (error) throw error;
          value = count || 0;
          break;
        }
        case 'pendingApprovals': {
          const { count, error } = await supabase
            .from('pending_admin_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
          if (error) throw error;
          value = count || 0;
          break;
        }
        case 'contactMessages': {
          const { count, error } = await supabase
            .from('contact_messages')
            .select('*', { count: 'exact', head: true })
            .eq('responded', false);
          if (error) throw error;
          value = count || 0;
          break;
        }
        case 'trainingEvents': {
          const { count, error } = await supabase
            .from('training_events')
            .select('*', { count: 'exact', head: true });
          if (error) throw error;
          value = count || 0;
          break;
        }
      }

      // Ignore an older response if a newer event-triggered request completed first.
      if (requestVersions.current[key] === requestVersion) {
        setStats((previous) => ({ ...previous, [key]: value }));
      }
    } catch (error) {
      console.error(`Error refreshing admin dashboard metric "${key}":`, error);
    }
  }, []);
  useEffect(() => {
    let active = true;
    const metricKeys: StatKey[] = [
      'totalUsers',
      'totalProperties',
      'totalBlogs',
      'pendingApprovals',
      'contactMessages',
      'trainingEvents',
    ];

    const loadInitialStats = async () => {
      await Promise.all([
        ...metricKeys.map((key) => fetchMetric(key)),
        fetchOrdersMetrics(),
      ]);
      if (active) setLoading(false);
    };

    void loadInitialStats();

    const channel = supabase
      .channel('admin-dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => void fetchMetric('totalUsers'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estate' }, () => void fetchMetric('totalProperties'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => void fetchOrdersMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => void fetchMetric('totalBlogs'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_admin_requests' }, () => void fetchMetric('pendingApprovals'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => void fetchMetric('contactMessages'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'training_events' }, () => void fetchMetric('trainingEvents'))
      .subscribe();

    return () => {
      active = false;
      metricKeys.forEach((key) => {
        requestVersions.current[key] += 1;
      });
      void supabase.removeChannel(channel);
    };
  }, [fetchMetric, fetchOrdersMetrics]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', iconColor: 'text-blue-400' },
    { title: 'Properties', value: stats.totalProperties.toLocaleString(), icon: Building2, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', iconColor: 'text-emerald-400' },
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-green-500/10 text-green-400 border-green-500/20', iconColor: 'text-green-400' },
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: TrendingUp, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', iconColor: 'text-purple-400' },
    { title: 'Blog Posts', value: stats.totalBlogs.toLocaleString(), icon: FileText, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', iconColor: 'text-indigo-400' },
    { title: 'Pending Approvals', value: stats.pendingApprovals.toLocaleString(), icon: UserCheck, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', iconColor: 'text-yellow-400' },
    { title: 'Unread Messages', value: stats.contactMessages.toLocaleString(), icon: Mail, color: 'bg-red-500/10 text-red-400 border-red-500/20', iconColor: 'text-red-400' },
    { title: 'Training Events', value: stats.trainingEvents.toLocaleString(), icon: Calendar, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', iconColor: 'text-cyan-400' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Loading dashboard statistics">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-28 rounded-xl bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className={`border ${stat.color} bg-slate-800/50`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-slate-400">{stat.title}</p>
                <p className="mt-1 break-words text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`shrink-0 rounded-lg p-3 ${stat.color}`}>
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
