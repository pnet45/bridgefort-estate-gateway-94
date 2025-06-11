
import React, { useEffect, useState } from 'react';
import InspectionBookingForm from './InspectionBookingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Calendar, FileText, User, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [inspectionBookings, setInspectionBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInspectionBookings();
    }
  }, [user]);

  const fetchInspectionBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('inspection_bookings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inspection bookings:', error);
        return;
      }

      setInspectionBookings(data || []);
    } catch (error) {
      console.error('Error fetching inspection bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const approvedInspections = inspectionBookings.filter(booking => booking.status === 'approved');
  const pendingInspections = inspectionBookings.filter(booking => booking.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Properties</CardTitle>
            <Home className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Properties in your portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspections</CardTitle>
            <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inspectionBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Total inspection bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Available documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Approved Inspections Section */}
      {approvedInspections.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Approved Inspections
            </CardTitle>
            <CardDescription className="text-green-600">
              Your inspection requests have been approved! Please note the scheduled dates and times.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedInspections.map((booking) => (
                <div key={booking.id} className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-green-800">{booking.estate_name}</h4>
                      <p className="text-sm text-green-600">
                        Date: {new Date(booking.inspection_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-green-600">
                        Time: {booking.inspection_time}
                      </p>
                      {booking.message && (
                        <p className="text-sm text-gray-600 mt-2">
                          Message: {booking.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Approved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Inspections Section */}
      {pendingInspections.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-5 w-5" />
              Pending Inspections
            </CardTitle>
            <CardDescription className="text-yellow-600">
              Your inspection requests are being reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInspections.map((booking) => (
                <div key={booking.id} className="bg-white p-4 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-yellow-800">{booking.estate_name}</h4>
                      <p className="text-sm text-yellow-600">
                        Requested Date: {new Date(booking.inspection_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-yellow-600">
                        Requested Time: {booking.inspection_time}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">Pending</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Book inspections and manage your real estate journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <InspectionBookingForm onBookingCreated={fetchInspectionBookings} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
