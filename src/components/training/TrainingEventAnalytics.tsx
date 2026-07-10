import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TrainingEventAnalyticsProps {
  eventId: string;
  eventTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AnalyticsData {
  totalRegistrations: number;
  totalAttendance: number;
  completionRate: number;
  certificatesIssued: number;
  attendanceByDate: Array<{ date: string; count: number }>;
}

const COLORS = ['#1e3a8a', '#dc2626', '#d4af37', '#059669'];

const TrainingEventAnalytics = ({ eventId, eventTitle, open, onOpenChange }: TrainingEventAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRegistrations: 0,
    totalAttendance: 0,
    completionRate: 0,
    certificatesIssued: 0,
    attendanceByDate: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && eventId) {
      fetchAnalytics();
    }
  }, [open, eventId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch registrations count
      const { count: registrationsCount } = await supabase
        .from('training_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_title', eventTitle);

      // Fetch attendance data
      const { data: attendanceData } = await supabase
        .from('training_attendance')
        .select('*')
        .eq('event_id', eventId);

      const attendedCount = attendanceData?.filter(a => a.attended).length || 0;
      const completedCount = attendanceData?.filter(a => a.completed).length || 0;
      const certificatesCount = attendanceData?.filter(a => a.certificate_issued).length || 0;

      const completionRate = attendanceData && attendanceData.length > 0 
        ? (completedCount / attendanceData.length) * 100 
        : 0;

      // Group attendance by date
      const attendanceByDate = attendanceData?.reduce((acc: any[], curr) => {
        if (curr.attendance_date) {
          const date = new Date(curr.attendance_date).toLocaleDateString();
          const existing = acc.find(item => item.date === date);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ date, count: 1 });
          }
        }
        return acc;
      }, []) || [];

      setAnalytics({
        totalRegistrations: registrationsCount || 0,
        totalAttendance: attendedCount,
        completionRate: Math.round(completionRate),
        certificatesIssued: certificatesCount,
        attendanceByDate,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Attended', value: analytics.totalAttendance },
    { name: 'Registered', value: Math.max(0, analytics.totalRegistrations - analytics.totalAttendance) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            Analytics: {eventTitle}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{analytics.totalRegistrations}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{analytics.totalAttendance}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.totalRegistrations > 0 
                      ? `${Math.round((analytics.totalAttendance / analytics.totalRegistrations) * 100)}% attendance rate`
                      : 'No data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{analytics.completionRate}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{analytics.certificatesIssued}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Attendance vs Registration Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attendance vs Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Attendance by Date Bar Chart */}
              {analytics.attendanceByDate.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance by Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.attendanceByDate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrainingEventAnalytics;
