import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, TrendingUp, Award } from 'lucide-react';

interface RegistrationStats {
  totalRegistrations: number;
  eventStats: { eventTitle: string; count: number }[];
  categoryStats: { category: string; count: number }[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const TrainingAnalyticsTab = () => {
  const [stats, setStats] = useState<RegistrationStats>({
    totalRegistrations: 0,
    eventStats: [],
    categoryStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all registrations
      const { data: registrations, error: regError } = await supabase
        .from('training_registrations')
        .select('*');

      if (regError) throw regError;

      // Fetch all events
      const { data: events, error: eventsError } = await supabase
        .from('training_events')
        .select('*');

      if (eventsError) throw eventsError;

      // Calculate total registrations
      const totalRegistrations = registrations?.length || 0;

      // Calculate registrations by event
      const eventCounts: Record<string, number> = {};
      registrations?.forEach(reg => {
        const title = reg.event_title || 'Unknown Event';
        eventCounts[title] = (eventCounts[title] || 0) + 1;
      });

      const eventStats = Object.entries(eventCounts).map(([eventTitle, count]) => ({
        eventTitle,
        count
      }));

      // Calculate registrations by category (from events)
      const categoryCounts: Record<string, number> = {};
      events?.forEach(event => {
        const category = event.category || 'Uncategorized';
        // Count how many registrations this event has
        const regsForEvent = registrations?.filter(reg => reg.event_title === event.title).length || 0;
        categoryCounts[category] = (categoryCounts[category] || 0) + regsForEvent;
      });

      const categoryStats = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count
      }));

      setStats({
        totalRegistrations,
        eventStats,
        categoryStats
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              All-time training registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Events with registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Categories</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoryStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Training categories offered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations by Event */}
        <Card>
          <CardHeader>
            <CardTitle>Registrations by Event</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.eventStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.eventStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="eventTitle" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Registrations" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No event data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registrations by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Event Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Event Registration Details</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.eventStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Event Title</th>
                    <th className="text-right py-3 px-4">Registrations</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.eventStats
                    .sort((a, b) => b.count - a.count)
                    .map((event, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{event.eventTitle}</td>
                        <td className="text-right py-3 px-4 font-semibold">{event.count}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No registration data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingAnalyticsTab;
