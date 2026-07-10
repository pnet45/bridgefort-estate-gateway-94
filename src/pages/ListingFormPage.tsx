import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingForm from '@/components/listings/ListingForm';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ListingFormPage = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
      if (error || !data) { toast.error('Listing not found'); return navigate('/listings/my'); }
      setData(data);
      setLoading(false);
    })();
  }, [id, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20 pb-12">
        <div className="container-custom max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">{id ? 'Edit Listing' : 'Post a New Listing'}</h1>
          <p className="text-muted-foreground mb-6">
            {id ? 'Edits will be re-reviewed by an admin before going live.' : 'Your listing will be reviewed by an admin before being published.'}
          </p>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <ListingForm listingId={id} initialData={data || undefined} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingFormPage;
