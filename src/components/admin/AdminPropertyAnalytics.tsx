import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  BarChart3, Eye, MessageSquare, DollarSign, TrendingUp, 
  RefreshCw, Calendar, Building, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface PropertyStats {
  property_id: string;
  property_name: string;
  views: number;
  inquiries: number;
  sales: number;
}

interface TimeSeriesData {
  date: string;
  views: number;
  inquiries: number;
  sales: number;
}

interface AnalyticsEvent {
  id: string;
  property_id: string;
  event_type: string;
  created_at: string;
  metadata: any;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminPropertyAnalytics() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [propertyStats, setPropertyStats] = useState<PropertyStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([]);
  const [totals, setTotals] = useState({ views: 0, inquiries: 0, sales: 0, revenue: 0 });

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('estate')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Fetch analytics events
      let query = supabase
        .from('property_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (selectedProperty !== 'all') {
        query = query.eq('property_id', selectedProperty);
      }

      const { data: events, error } = await query;
      if (error) throw error;

      setRecentEvents((events || []).slice(0, 50));

      // Calculate property stats
      const statsMap = new Map<string, PropertyStats>();
      
      for (const event of events || []) {
        const prop = properties.find(p => p.id === event.property_id);
        const propName = prop?.name || 'Unknown Property';
        
        if (!statsMap.has(event.property_id)) {
          statsMap.set(event.property_id, {
            property_id: event.property_id,
            property_name: propName,
            views: 0,
            inquiries: 0,
            sales: 0,
          });
        }
        
        const stats = statsMap.get(event.property_id)!;
        switch (event.event_type) {
          case 'view':
            stats.views++;
            break;
          case 'inquiry':
            stats.inquiries++;
            break;
          case 'sale':
            stats.sales++;
            break;
        }
      }

      const statsArray = Array.from(statsMap.values())
        .sort((a, b) => (b.views + b.inquiries + b.sales) - (a.views + a.inquiries + a.sales));
      setPropertyStats(statsArray);

      // Calculate totals
      const totalViews = statsArray.reduce((sum, s) => sum + s.views, 0);
      const totalInquiries = statsArray.reduce((sum, s) => sum + s.inquiries, 0);
      const totalSales = statsArray.reduce((sum, s) => sum + s.sales, 0);

      // Fetch completed orders for revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startDate.toISOString())
        .in('payment_status', ['completed', 'success']);

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      setTotals({ views: totalViews, inquiries: totalInquiries, sales: totalSales, revenue: totalRevenue });

      // Calculate time series data
      const timeMap = new Map<string, TimeSeriesData>();
      const days = parseInt(dateRange);
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        timeMap.set(dateStr, { date: dateStr, views: 0, inquiries: 0, sales: 0 });
      }

      for (const event of events || []) {
        const dateStr = event.created_at.split('T')[0];
        if (timeMap.has(dateStr)) {
          const data = timeMap.get(dateStr)!;
          switch (event.event_type) {
            case 'view':
              data.views++;
              break;
            case 'inquiry':
              data.inquiries++;
              break;
            case 'sale':
              data.sales++;
              break;
          }
        }
      }

      const timeData = Array.from(timeMap.values())
        .sort((a, b) => a.date.localeCompare(b.date));
      setTimeSeriesData(timeData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (properties.length > 0 || selectedProperty === 'all') {
      fetchAnalytics();
    }
  }, [selectedProperty, dateRange, properties]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const pieData = propertyStats.slice(0, 6).map((stat, index) => ({
    name: stat.property_name.length > 15 ? stat.property_name.slice(0, 15) + '...' : stat.property_name,
    value: stat.views + stat.inquiries + stat.sales,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/30 rounded-lg">
            <BarChart3 className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Property Analytics</h2>
            <p className="text-sm text-slate-400">Track views, inquiries, and sales metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all" className="text-white">All Properties</SelectItem>
              {properties.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-white">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="7" className="text-white">Last 7 days</SelectItem>
              <SelectItem value="30" className="text-white">Last 30 days</SelectItem>
              <SelectItem value="90" className="text-white">Last 90 days</SelectItem>
              <SelectItem value="365" className="text-white">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Views</p>
                <p className="text-2xl font-bold text-white">{totals.views.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>Active tracking</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Inquiries</p>
                <p className="text-2xl font-bold text-white">{totals.inquiries.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
              <span>{totals.views > 0 ? Math.round((totals.inquiries / totals.views) * 100) : 0}% conversion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Sales</p>
                <p className="text-2xl font-bold text-white">{totals.sales.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
              <span>{totals.inquiries > 0 ? Math.round((totals.sales / totals.inquiries) * 100) : 0}% close rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totals.revenue)}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>From completed orders</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Views" />
                  <Line type="monotone" dataKey="inquiries" stroke="#f59e0b" strokeWidth={2} dot={false} name="Inquiries" />
                  <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} dot={false} name="Sales" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No data available for selected period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Distribution */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Top Properties by Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No property data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property Stats Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Property Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {propertyStats.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No analytics data yet</p>
                <p className="text-sm mt-1">Property views and interactions will appear here</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                    <th className="pb-3 font-medium">Property</th>
                    <th className="pb-3 font-medium text-center">Views</th>
                    <th className="pb-3 font-medium text-center">Inquiries</th>
                    <th className="pb-3 font-medium text-center">Sales</th>
                    <th className="pb-3 font-medium text-right">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyStats.map((stat) => (
                    <tr key={stat.property_id} className="border-b border-slate-700/50 text-sm">
                      <td className="py-3 text-white">{stat.property_name}</td>
                      <td className="py-3 text-center text-blue-400">{stat.views}</td>
                      <td className="py-3 text-center text-yellow-400">{stat.inquiries}</td>
                      <td className="py-3 text-center text-green-400">{stat.sales}</td>
                      <td className="py-3 text-right text-slate-300">
                        {stat.views > 0 ? Math.round((stat.inquiries / stat.views) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
