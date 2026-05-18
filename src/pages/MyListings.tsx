import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2, Eye, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const statusVariant = (s: string) =>
  s === 'approved' ? 'default' : s === 'rejected' ? 'destructive' : 'secondary';

const MyListings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) navigate('/auth'); }, [user, authLoading, navigate]);

  const fetchMine = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setListings(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchMine(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Listing deleted');
    setListings(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20 pb-12">
        <div className="container-custom max-w-6xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold">My Listings</h1>
              <p className="text-muted-foreground">Manage your property listings and track approval status</p>
            </div>
            <Button onClick={() => navigate('/listings/new')}>
              <Plus className="w-4 h-4 mr-2" /> Post a New Listing
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : listings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg font-semibold">No listings yet</p>
              <p className="text-muted-foreground mt-1 mb-4">Post your first property to get started.</p>
              <Button onClick={() => navigate('/listings/new')}><Plus className="w-4 h-4 mr-2" /> Post a Listing</Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {listings.map(l => (
                <Card key={l.id} className="p-4 flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-40 h-32 bg-muted rounded flex items-center justify-center overflow-hidden shrink-0">
                    {l.photos?.[0] ? (
                      <img src={l.photos[0]} alt={l.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{l.title}</h3>
                        <p className="text-sm text-muted-foreground">{l.region}{l.city ? ` · ${l.city}` : ''} · {l.property_type}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant={statusVariant(l.moderation_status)}>{l.moderation_status}</Badge>
                        {l.is_published && <Badge variant="outline">Live</Badge>}
                      </div>
                    </div>
                    <p className="mt-2 font-semibold text-primary">₦{Number(l.price_amount).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">/ {l.price_period}</span></p>
                    {l.rejection_reason && (
                      <p className="mt-2 text-sm text-destructive">Reason: {l.rejection_reason}</p>
                    )}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {l.is_published && (
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/listings/${l.id}`}><Eye className="w-4 h-4 mr-1" /> View</Link>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => navigate(`/listings/edit/${l.id}`)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(l.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyListings;
