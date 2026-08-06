import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { Loader2, CreditCard, RefreshCw } from 'lucide-react';
import { logAdminActivity } from '@/utils/logAdminActivity';

interface PaymentRequest {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  reference: string | null;
  related_payment_id: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

interface ProfileLite {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

const AdminPaymentRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: reqData, error } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (reqData || []) as PaymentRequest[];
      setRequests(rows);

      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);
        const map: Record<string, ProfileLite> = {};
        (profileData || []).forEach((p: any) => { map[p.id] = p; });
        setProfilesById(map);
      }
    } catch (error) {
      console.error('Error loading payment requests:', error);
      toast({ title: 'Error', description: 'Could not load payment requests.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (req: PaymentRequest, status: 'approved' | 'rejected') => {
    setProcessingId(req.id);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({
          status,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', req.id);
      if (error) throw error;

      // Approving/rejecting flips the linked payment plan, which is what
      // unlocks (or blocks) the purchase/installments in the client dashboard.
      if (req.related_payment_id) {
        await supabase
          .from('payments')
          .update({ status: status === 'approved' ? 'active' : 'rejected' })
          .eq('id', req.related_payment_id);
      }

      // Property / documentation / Agrovest checkout payments also carry an
      // order and (for docs) a documentation-fee record keyed by reference.
      if (req.reference) {
        await supabase
          .from('orders')
          .update({
            payment_status: status === 'approved' ? 'paid' : 'rejected',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_reference', req.reference);

        await supabase
          .from('estate_documentation_payments')
          .update({
            status: status === 'approved' ? 'completed' : 'rejected',
            updated_at: new Date().toISOString(),
          })
          .eq('reference', req.reference);
      }


      await supabase.from('notifications').insert({
        user_id: req.user_id,
        audience: 'user',
        type: 'payment_status',
        title: status === 'approved' ? 'Payment approved' : 'Payment rejected',
        message: status === 'approved'
          ? `Your payment of ₦${Number(req.amount).toLocaleString()} has been approved.`
          : `Your payment of ₦${Number(req.amount).toLocaleString()} was rejected. Please contact support.`,
        link: '/cart',
      });

      await logAdminActivity({
        actionType: 'payment_request_updated',
        actionDescription: `Payment request ${status}`,
        entityType: 'payment_request',
        entityId: req.id,
        metadata: { status, amount: req.amount },
      });

      toast({ title: `Request ${status}` });
      await load();
    } catch (error: any) {
      console.error('Error updating payment request:', error);
      toast({ title: 'Update failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = statusFilter === 'all' ? requests : requests.filter((r) => r.status === statusFilter);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <Badge className={map[status] || 'bg-slate-100 text-slate-800'}>{status}</Badge>;
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Payment Requests
            {pendingCount > 0 && (
              <Badge className="bg-amber-500 text-amber-950 ml-1">{pendingCount} pending</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-slate-900 text-white border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No payment requests here.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Realtor</TableHead>
                  <TableHead className="text-slate-300">Amount</TableHead>
                  <TableHead className="text-slate-300">Description</TableHead>
                  <TableHead className="text-slate-300">Reference</TableHead>
                  <TableHead className="text-slate-300">Requested</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const p = profilesById[r.user_id];
                  return (
                    <TableRow key={r.id} className="border-slate-700">
                      <TableCell className="text-white">
                        {p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown' : r.user_id}
                      </TableCell>
                      <TableCell className="text-white font-semibold">₦{Number(r.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-slate-300 text-xs">{r.description || '—'}</TableCell>
                      <TableCell className="text-slate-400 text-xs">{r.reference || '—'}</TableCell>
                      <TableCell className="text-slate-300 text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell>
                        {r.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={processingId === r.id}
                              onClick={() => updateStatus(r, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={processingId === r.id}
                              onClick={() => updateStatus(r, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">No actions</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPaymentRequests;
