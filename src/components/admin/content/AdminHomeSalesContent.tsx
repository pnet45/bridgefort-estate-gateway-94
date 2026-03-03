import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home } from 'lucide-react';

const AdminHomeSalesContent = () => {
  const [homes, setHomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomes = async () => {
      const { data } = await supabase
        .from('estate')
        .select('*')
        .eq('property_category', 'home')
        .eq('is_for_sale', true)
        .order('created_at', { ascending: false });
      setHomes(data || []);
      setLoading(false);
    };
    fetchHomes();
  }, []);

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Home className="h-5 w-5" /> Homes for Sale ({homes.length})
      </h3>
      <p className="text-slate-400 text-sm">
        Homes are managed via the Properties tab. Filter by property_category = 'home' and is_for_sale = true.
      </p>
      {homes.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No homes for sale found. Add them in the Properties tab with category "home".</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {homes.map(home => (
            <Card key={home.id} className="bg-slate-700/50 border-slate-600">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-white">{home.name}</h4>
                <p className="text-sm text-slate-400">{home.location}</p>
                <div className="flex gap-2 mt-2">
                  {home.bedrooms && <Badge variant="outline">{home.bedrooms} bed</Badge>}
                  {home.bathrooms && <Badge variant="outline">{home.bathrooms} bath</Badge>}
                  {home.promo_price && <Badge variant="secondary">₦{home.promo_price.toLocaleString()}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminHomeSalesContent;
