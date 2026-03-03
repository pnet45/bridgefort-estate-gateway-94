import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building } from 'lucide-react';

const AdminApartmentsContent = () => {
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartments = async () => {
      const { data } = await supabase
        .from('estate')
        .select('*')
        .eq('is_for_rent', true)
        .order('created_at', { ascending: false });
      setApartments(data || []);
      setLoading(false);
    };
    fetchApartments();
  }, []);

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Building className="h-5 w-5" /> Apartments for Rent ({apartments.length})
      </h3>
      <p className="text-slate-400 text-sm">
        Apartments are managed via the Properties tab. Filter by is_for_rent = true.
      </p>
      {apartments.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No apartments for rent found. Add them in the Properties tab with is_for_rent enabled.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apartments.map(apt => (
            <Card key={apt.id} className="bg-slate-700/50 border-slate-600">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-white">{apt.name}</h4>
                <p className="text-sm text-slate-400">{apt.location}</p>
                <div className="flex gap-2 mt-2">
                  {apt.bedrooms && <Badge variant="outline">{apt.bedrooms} bed</Badge>}
                  {apt.bathrooms && <Badge variant="outline">{apt.bathrooms} bath</Badge>}
                  {apt.monthly_rent && <Badge variant="secondary">₦{apt.monthly_rent.toLocaleString()}/mo</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApartmentsContent;
