import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building2, DollarSign, FileText, Mail, UserCheck, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

const AdminDashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProperties: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalBlogs: 0,
    pendingApprovals: 0,
    contactMessages: 0,
    trainingEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: usersCount },
          { count: propertiesCount },
          { data: ordersData },
          { count: blogsCount },
          { count: pendingCount },
          { count: messagesCount },
          { count: eventsCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('estate').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total_amount, payment_status'),
          supabase.from('posts').select('*', { count: 'exact', head: true }),
          supabase.from('pending_admin_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('responded', false),
          supabase.from('training_events').select('*', { count: 'exact', head: true })
        ]);

        const totalRevenue = ordersData?.reduce((sum, order) => {
          if (order.payment_status === 'completed' || order.payment_status === 'success') {
            return sum + (order.total_amount || 0);
          }
          return sum;
        }, 0) || 0;

        setStats({
          totalUsers: usersCount || 0,
          totalProperties: propertiesCount || 0,
          totalRevenue,
          totalOrders: ordersData?.length || 0,
          totalBlogs: blogsCount || 0,
          pendingApprovals: pendingCount || 0,
          contactMessages: messagesCount || 0,
          trainingEvents: eventsCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel('stats-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_admin_requests' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-800 rounded-xl animate-pulse" />
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
