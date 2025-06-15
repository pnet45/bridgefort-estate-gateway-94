
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import InspectionBookingForm from '../InspectionBookingForm';

interface InspectionsTabProps {
  inspections: any[];
  fetchUserData: () => void;
}

const InspectionsTab: React.FC<InspectionsTabProps> = ({ inspections, fetchUserData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <InspectionBookingForm onBookingCreated={fetchUserData} />
    <Card>
      <CardHeader>
        <CardTitle>My Inspection Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {inspections.map((inspection: any) => (
            <div key={inspection.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{inspection.estate_name}</h4>
                <Badge variant={inspection.status === 'confirmed' ? 'default' : 'secondary'}>
                  {inspection.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Date: {new Date(inspection.inspection_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Time: {inspection.inspection_time}
              </p>
              {inspection.message && (
                <p className="text-sm text-gray-600">
                  Message: {inspection.message}
                </p>
              )}
            </div>
          ))}
          {inspections.length === 0 && (
            <p className="text-gray-600">No inspection bookings found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default InspectionsTab;
