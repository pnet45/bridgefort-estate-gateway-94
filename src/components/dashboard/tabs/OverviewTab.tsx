
import React from 'react';
import SavedCartItems from '../SavedCartItems';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OverviewTabProps {
  inspections: any[];
  fetchUserData: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ inspections }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <SavedCartItems />
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {inspections.slice(0, 3).map((inspection: any) => (
            <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">{inspection.estate_name}</p>
                <p className="text-xs text-gray-600">
                  {new Date(inspection.inspection_date).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={inspection.status === 'confirmed' ? 'default' : 'secondary'}>
                {inspection.status}
              </Badge>
            </div>
          ))}
          {inspections.length === 0 && (
            <p className="text-gray-600 text-center py-4">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default OverviewTab;
