
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';

const PropertiesTab = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Building size={20} />
        My Properties
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600">No properties found. Start browsing our available properties to make your first purchase.</p>
    </CardContent>
  </Card>
);

export default PropertiesTab;
