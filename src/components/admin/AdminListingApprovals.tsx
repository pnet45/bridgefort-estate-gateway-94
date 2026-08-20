import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Home, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ListingRequest {
  id: string; title: string; description: string | null; city: string | null; region: string | null;
  estate: string | null; address: string | null; property_type: string | null; price_amount: number | null;
  price_currency: string | null; owner_name: string | null; owner_phone: string | null; owner_email: string | null;
  photos: string[] | null; moderation_status: string; rejection_reason: string | null; submitted_at: string | null;
  created_at: string | null; created_by: string | null;
}

const AdminListingApprovals: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ListingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [decision, setDecision] = useState<{ listing: ListingRequest; action: 'approve' | 'reject' } | null>(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('listings')
        .select('id,title,description,city,region,estate,address,property_type,price_amount,price_currency,owner_name,owner_phone,owner_email,photos,moderation_status,rejection_reason,submitted_at,created_at,created_by')
        .eq('moderation_status', 'pending').order('submitted_at', { ascending: false });
      if (error) throw error;
      setRequests((data || []) as ListingRequest[]);
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Could not load listing requests', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const confirmDecision = async () => {
    if (!decision || !user) return;
    if (decision.action === 'reject' && !reason.trim()) {
      toast({ title: 'Reason required', description: 'Please explain why the listing is rejected.', variant: 'destructive' }); return;
    }
    setProcessing(decision.listing.id);
    try {
      const approved = decision.action === 'approve';
      const { error } = await supabase.from('listings').update({
        moderation_status: approved ? 'approved' : 'rejected', is_published: approved,
        rejection_reason: approved ? null : reason.trim(), approved_by: approved ? user.id : null,
        approved_at: approved ? new Date().toISOString() : null,
      }).eq('id', decision.listing.id).eq('moderation_status', 'pending');
      if (error) throw error;

      if (decision.listing.created_by) {
        await supabase.from('notifications').insert({
          user_id: decision.listing.created_by, audience: 'user', type: 'listing_status',
          title: approved ? 'Listing approved' : 'Listing rejected',
          message: approved ? `Your listing “${decision.listing.title}” has been approved and is now live.` : `Your listing “${decision.listing.title}” was rejected. ${reason.trim()}`,
          link: '/listings/my',
        });
      }

      toast({ title: approved ? 'Listing approved' : 'Listing rejected', description: approved ? 'The listing is now public.' : 'The owner can review the rejection reason.' });
      setDecision(null); setReason(''); await load();
    } catch (error: any) {
      toast({ title: 'Decision failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally { setProcessing(null); }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-white flex items-center gap-2"><Home className="h-5 w-5" /> Listing Requests <Badge className="bg-amber-500 text-amber-950">{requests.length} pending</Badge></CardTitle>
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
        </div>
        <p className="text-sm text-slate-400">Review user-submitted listings before they appear publicly.</p>
      </CardHeader>
      <CardContent>
        {loading ? <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-white" /></div> : requests.length === 0 ? (
          <div className="py-12 text-center text-slate-400"><CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-400" /><p>No pending listing requests.</p></div>
        ) : <div className="space-y-4">{requests.map((listing) => (
          <div key={listing.id} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-48 h-32 rounded-xl overflow-hidden bg-slate-800 shrink-0">{listing.photos?.[0] ? <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center"><Home className="h-8 w-8 text-slate-600" /></div>}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white text-lg">{listing.title}</h3><Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/20">Pending</Badge></div>
                <p className="text-sm text-slate-400 mt-1">{[listing.property_type, listing.city, listing.estate, listing.region].filter(Boolean).join(' · ')}</p>
                <p className="text-lg font-bold text-white mt-2">{listing.price_currency || 'NGN'} {Number(listing.price_amount || 0).toLocaleString()}</p>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">{listing.description || 'No description provided.'}</p>
                <div className="mt-3 text-xs text-slate-500">Owner: {listing.owner_name || '—'} · {listing.owner_phone || listing.owner_email || 'No contact supplied'}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.photos?.[0] && <Button size="sm" variant="outline" className="border-slate-600 text-slate-200" onClick={() => window.open(listing.photos![0], '_blank')}><ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View photo</Button>}
                  <Button size="sm" onClick={() => setDecision({ listing, action: 'approve' })} disabled={!!processing}><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDecision({ listing, action: 'reject' })} disabled={!!processing}><XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject</Button>
                </div>
              </div>
            </div>
          </div>
        ))}</div>}
      </CardContent>
      <Dialog open={!!decision} onOpenChange={(open) => { if (!open) { setDecision(null); setReason(''); } }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle>{decision?.action === 'approve' ? 'Approve listing?' : 'Reject listing?'}</DialogTitle><DialogDescription className="text-slate-400">{decision?.listing.title}</DialogDescription></DialogHeader>
          {decision?.action === 'reject' && <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain what the owner needs to correct..." className="bg-slate-800 border-slate-700 text-white" />}
          <DialogFooter><Button variant="outline" className="border-slate-600 text-slate-200" onClick={() => setDecision(null)}>Cancel</Button><Button variant={decision?.action === 'reject' ? 'destructive' : 'default'} onClick={confirmDecision} disabled={!!processing}>{processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}{decision?.action === 'approve' ? 'Approve & Publish' : 'Reject Listing'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminListingApprovals;
