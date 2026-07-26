import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SavedSearch {
  id: string;
  label: string;
  location: string | null;
  type: string | null;
  min_price: number | null;
  max_price: number | null;
  created_at: string;
}

const formatPrice = (n: number | null) => (typeof n === 'number' ? `₦${n.toLocaleString()}` : null);

/**
 * Lets a user see and remove the searches they've saved for alerts (feature
 * #4). Matching + notification is handled entirely server-side by the
 * trg_notify_saved_search_matches trigger — see
 * 20260728000000_saved_searches_with_alerts.sql — this component is just the
 * management UI on top of that table.
 */
const SavedSearchesList = () => {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Cast: saved_searches is introduced by a migration and isn't in the
    // generated Supabase types until they're regenerated against the live schema.
    const { data, error } = await (supabase.from('saved_searches') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load saved searches:', error);
    } else {
      setSearches((data || []) as SavedSearch[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await (supabase.from('saved_searches') as any).delete().eq('id', id);
    setDeletingId(null);

    if (error) {
      toast({ title: 'Could not remove search', description: error.message, variant: 'destructive' });
      return;
    }
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  if (!user) return null;

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellRing size={20} className="text-estate-purple" />
          Saved Searches & Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" size={18} /> Loading…
          </div>
        ) : searches.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            You haven't saved any searches yet. Use the search bar and check "Save this search & get
            alerts" to get notified about new matching listings.
          </p>
        ) : (
          <ul className="space-y-2">
            {searches.map((s) => {
              const min = formatPrice(s.min_price);
              const max = formatPrice(s.max_price);
              const criteria = [s.location, s.type, min || max ? `${min ?? 'Any'} – ${max ?? 'Any'}` : null]
                .filter(Boolean)
                .join(' • ');
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 bg-foreground/5"
                >
                  <div>
                    <p className="font-medium text-foreground">{s.label}</p>
                    {criteria && <p className="text-xs text-muted-foreground">{criteria}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    aria-label={`Remove saved search "${s.label}"`}
                  >
                    {deletingId === s.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} className="text-destructive" />
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedSearchesList;
