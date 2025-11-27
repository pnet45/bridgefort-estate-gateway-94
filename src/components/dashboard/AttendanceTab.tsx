import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Award, Loader2 } from 'lucide-react';
import CertificateDownloadButton from '../training/CertificateDownloadButton';

interface Attendance {
  id: string;
  attended: boolean;
  completed: boolean;
  certificate_issued: boolean;
  attendance_date: string | null;
  training_events: {
    title: string;
    date: string;
    category: string;
  };
  training_registrations: {
    name: string;
    email: string;
  };
}

const AttendanceTab = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('training_attendance')
        .select(`
          *,
          training_events!event_id (
            title,
            date,
            category
          ),
          training_registrations!registration_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (id: string, attended: boolean) => {
    try {
      const { error } = await supabase
        .from('training_attendance')
        .update({ 
          attended,
          attendance_date: attended ? new Date().toISOString() : null 
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Attendance ${attended ? 'marked' : 'removed'}`);
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    }
  };

  const markCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('training_attendance')
        .update({ completed: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Training marked as completed');
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error marking completion:', error);
      toast.error('Failed to mark completion');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Attendance</h2>
      </div>

      {attendanceRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No attendance records found
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {attendanceRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {record.training_events?.title || 'N/A'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {record.training_registrations?.name} ({record.training_registrations?.email})
                    </p>
                  </div>
                  <Badge variant={record.completed ? 'default' : 'secondary'}>
                    {record.training_events?.category || 'Training'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Event Date:</span>
                      <p className="font-medium">
                        {new Date(record.training_events?.date).toLocaleDateString()}
                      </p>
                    </div>
                    {record.attendance_date && (
                      <div>
                        <span className="text-muted-foreground">Attended On:</span>
                        <p className="font-medium">
                          {new Date(record.attendance_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={record.attended ? 'default' : 'outline'}>
                      {record.attended ? 'Attended' : 'Not Attended'}
                    </Badge>
                    {record.completed && (
                      <Badge variant="default" className="bg-green-600">
                        <Award className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {record.certificate_issued && (
                      <Badge variant="default" className="bg-purple-600">
                        Certificate Issued
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {!record.attended ? (
                      <Button
                        size="sm"
                        onClick={() => markAttendance(record.id, true)}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Mark Attended
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAttendance(record.id, false)}
                        className="gap-1"
                      >
                        <X className="h-4 w-4" />
                        Remove Attendance
                      </Button>
                    )}

                    {record.attended && !record.completed && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => markCompleted(record.id)}
                        className="gap-1"
                      >
                        <Award className="h-4 w-4" />
                        Mark Completed
                      </Button>
                    )}

                    {record.completed && (
                      <CertificateDownloadButton
                        attendanceId={record.id}
                        eventTitle={record.training_events?.title || 'Training'}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;