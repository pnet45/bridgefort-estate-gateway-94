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
import { Loader2, Wallet, RefreshCw } from 'lucide-react';
import { logAdminActivity } from '@/utils/logAdminActivity';
import { notify } from '@/lib/notifications/notify';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string;
}

interface ProfileLite {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string;
}

const AdminWithdrawalRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: reqData, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = (reqData || []) as WithdrawalRequest[];
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
      console.error('Error loading withdrawal requests:', error);
      toast({ title: 'Error', description: 'Could not load withdrawal requests.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'paid') => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await logAdminActivity({
        actionType: 'withdrawal_request_updated',
        actionDescription: `Withdrawal request ${status}`,
        entityType: 'withdrawal_request',
        entityId: id,
        metadata: { status },
      });

      // Let the realtor know — persisted so it shows up in their
      // NotificationBell whenever they're next active, rather than relying
      // on them to check back. `silent: true` because the toast this would
      // normally bridge to is for the *recipient's* session, not the
      // admin's — the admin already sees the toast below confirming their
      // own action.
      if (status === 'paid' || status === 'rejected') {
        const request = requests.find((r) => r.id === id);
        if (request) {
          void notify({
            title: status === 'paid' ? 'Withdrawal paid' : 'Withdrawal request declined',
            message:
              status === 'paid'
                ? `Your withdrawal request for ₦${Number(request.amount).toLocaleString()} has been paid.`
                : `Your withdrawal request for ₦${Number(request.amount).toLocaleString()} was declined. Contact support if you have questions.`,
            persist: true,
            userId: request.user_id,
            audience: 'user',
            type: status === 'paid' ? 'payout' : 'withdrawal',
            silent: true,
          });
        }
      }

      toast({ title: `Request ${status}`, description: `The withdrawal request has been marked as ${status}.` });
      await load();
    } catch (error: any) {
      console.error('Error updating withdrawal request:', error);
      toast({ title: 'Update failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = statusFilter === 'all' ? requests : requests.filter((r) => r.status === statusFilter);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
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
            <Wallet className="h-5 w-5" /> Withdrawal Requests
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
                <SelectItem value="paid">Paid</SelectItem>
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
          <p className="text-slate-400 text-sm py-8 text-center">No withdrawal requests here.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Realtor</TableHead>
                  <TableHead className="text-slate-300">Amount</TableHead>
                  <TableHead className="text-slate-300">Bank Details</TableHead>
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
                      <TableCell className="text-slate-300 text-xs">
                        {r.bank_name}<br />{r.account_number}<br />{r.account_name}
                      </TableCell>
                      <TableCell className="text-slate-300 text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell>
                        {r.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={processingId === r.id}
                              onClick={() => updateStatus(r.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={processingId === r.id}
                              onClick={() => updateStatus(r.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : r.status === 'approved' ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processingId === r.id}
                            onClick={() => updateStatus(r.id, 'paid')}
                          >
                            Mark Paid
                          </Button>
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

export default AdminWithdrawalRequests;
