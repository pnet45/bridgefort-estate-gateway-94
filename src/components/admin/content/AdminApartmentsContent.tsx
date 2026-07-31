import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';

const AdminApartmentsContent = () => {
  const navigate = useNavigate();
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Building className="h-5 w-5" /> Apartments for Rent ({apartments.length})
        </h3>
        <Button onClick={() => navigate('/admin?tab=properties&new=apartment')} className="gap-2">
          <Plus className="h-4 w-4" /> Create Apartment Listing
        </Button>
      </div>
      <p className="text-slate-400 text-sm">
        Apartments are listed here automatically once created and marked as available for rent.
      </p>
      {apartments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-4">No apartments for rent yet.</p>
          <Button variant="outline" onClick={() => navigate('/admin?tab=properties&new=apartment')} className="gap-2">
            <Plus className="h-4 w-4" /> Create your first listing
          </Button>
        </div>
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
