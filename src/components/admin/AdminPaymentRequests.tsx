import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { Loader2, CreditCard, RefreshCw, Search, History } from 'lucide-react';
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
  admin_notes?: string | null;
  created_at: string;
}

interface ProfileLite {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface AuditEntry {
  id: string;
  payment_request_id: string;
  admin_id: string | null;
  action: string;
  previous_status: string | null;
  new_status: string;
  reason: string | null;
  amount: number | null;
  created_at: string;
}

const AdminPaymentRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, ProfileLite>>({});
  const [auditByRequest, setAuditByRequest] = useState<Record<string, AuditEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [decision, setDecision] = useState<{ req: PaymentRequest; status: 'approved' | 'rejected' } | null>(null);
  const [reason, setReason] = useState('');
  const [historyFor, setHistoryFor] = useState<PaymentRequest | null>(null);

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

      const { data: auditData } = await supabase
        .from('payment_request_audit_log' as any)
        .select('*')
        .order('created_at', { ascending: false });
      const auditMap: Record<string, AuditEntry[]> = {};
      ((auditData || []) as any[]).forEach((a: AuditEntry) => {
        (auditMap[a.payment_request_id] ||= []).push(a);
      });
      setAuditByRequest(auditMap);
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

  const confirmDecision = async () => {
    if (!decision) return;
    const { req, status } = decision;
    if (status === 'rejected' && !reason.trim()) {
      toast({ title: 'Reason required', description: 'Please state why this payment is rejected.', variant: 'destructive' });
      return;
    }
    setProcessingId(req.id);
    try {
      const { error } = await supabase
        .from('payment_requests')
        .update({
          status,
          admin_notes: reason.trim() || null,
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

      // Immutable-ish trail of who decided what, when, and why.
      await supabase.from('payment_request_audit_log' as any).insert({
        payment_request_id: req.id,
        admin_id: user?.id ?? null,
        action: status === 'approved' ? 'approve' : 'reject',
        previous_status: req.status,
        new_status: status,
        reason: reason.trim() || null,
        amount: req.amount,
      });

      await supabase.from('notifications').insert({
        user_id: req.user_id,
        audience: 'user',
        type: 'payment_status',
        title: status === 'approved' ? 'Payment approved' : 'Payment rejected',
        message: status === 'approved'
          ? `Your payment of ₦${Number(req.amount).toLocaleString()} has been approved.${reason.trim() ? ` Note: ${reason.trim()}` : ''}`
          : `Your payment of ₦${Number(req.amount).toLocaleString()} was rejected.${reason.trim() ? ` Reason: ${reason.trim()}` : ' Please contact support.'}`,
        link: '/dashboard',
      });

      // Email is best-effort — a delivery failure must not undo the decision.
      const { error: emailError } = await supabase.functions.invoke('send-payment-decision-email', {
        body: { payment_request_id: req.id, status, reason: reason.trim() || null },
      });
      if (emailError) console.error('Decision email failed:', emailError);

      await logAdminActivity({
        actionType: 'payment_request_updated',
        actionDescription: `Payment request ${status}${reason.trim() ? `: ${reason.trim()}` : ''}`,
        entityType: 'payment_request',
        entityId: req.id,
        metadata: { status, amount: req.amount, reason: reason.trim() || null },
      });

      toast({
        title: `Request ${status}`,
        description: emailError ? 'Client notified in-app (email delivery failed).' : 'Client notified by email and in-app.',
      });
      setDecision(null);
      setReason('');
      await load();
    } catch (error: any) {
      console.error('Error updating payment request:', error);
      toast({ title: 'Update failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const nameFor = (userId: string) => {
    const p = profilesById[userId];
    return p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : '';
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minAmount ? Number(minAmount) : null;
    const max = maxAmount ? Number(maxAmount) : null;
    const from = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

    return requests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (min !== null && Number(r.amount) < min) return false;
      if (max !== null && Number(r.amount) > max) return false;
      const created = new Date(r.created_at).getTime();
      if (from !== null && created < from) return false;
      if (to !== null && created > to) return false;
      if (q) {
        const haystack = [
          nameFor(r.user_id),
          r.reference || '',
          r.description || '',
          r.type || '',
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [requests, profilesById, statusFilter, typeFilter, search, minAmount, maxAmount, fromDate, toDate]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <Badge className={map[status] || 'bg-slate-100 text-slate-800'}>{status}</Badge>;
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const filteredTotal = filtered.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const resetFilters = () => {
    setStatusFilter('pending');
    setTypeFilter('all');
    setSearch('');
    setMinAmount('');
    setMaxAmount('');
    setFromDate('');
    setToDate('');
  };

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
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={resetFilters}>
              Reset
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid gap-2 mt-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, reference, description…"
              className="pl-8 bg-slate-900 text-white border-slate-600 placeholder:text-slate-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-900 text-white border-slate-600"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-slate-900 text-white border-slate-600"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="agrovest">Agrovest</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="Min ₦"
              className="bg-slate-900 text-white border-slate-600 placeholder:text-slate-500" />
            <Input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="Max ₦"
              className="bg-slate-900 text-white border-slate-600 placeholder:text-slate-500" />
          </div>
          <div className="flex gap-2">
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="bg-slate-900 text-white border-slate-600" />
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="bg-slate-900 text-white border-slate-600" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {filtered.length} request{filtered.length === 1 ? '' : 's'} · Total ₦{filteredTotal.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No payment requests match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">User</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
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
                  const history = auditByRequest[r.id] || [];
                  return (
                    <TableRow key={r.id} className="border-slate-700">
                      <TableCell className="text-white">{nameFor(r.user_id) || r.user_id}</TableCell>
                      <TableCell className="text-slate-300 text-xs capitalize">{(r.type || '').replace(/_/g, ' ')}</TableCell>
                      <TableCell className="text-white font-semibold">₦{Number(r.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-slate-300 text-xs">{r.description || '—'}</TableCell>
                      <TableCell className="text-slate-400 text-xs">{r.reference || '—'}</TableCell>
                      <TableCell className="text-slate-300 text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {r.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={processingId === r.id}
                                onClick={() => { setReason(''); setDecision({ req: r, status: 'approved' }); }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={processingId === r.id}
                                onClick={() => { setReason(''); setDecision({ req: r, status: 'rejected' }); }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {history.length > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-300 hover:text-white gap-1"
                              onClick={() => setHistoryFor(r)}
                            >
                              <History className="h-3.5 w-3.5" /> Log ({history.length})
                            </Button>
                          )}
                          {r.status !== 'pending' && history.length === 0 && (
                            <span className="text-xs text-slate-500">No actions</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!decision} onOpenChange={(open) => { if (!open) { setDecision(null); setReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision?.status === 'approved' ? 'Approve payment' : 'Reject payment'}
            </DialogTitle>
            <DialogDescription>
              {decision && (
                <>₦{Number(decision.req.amount).toLocaleString()} · {nameFor(decision.req.user_id) || 'Client'} · {decision.req.type}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder={decision?.status === 'approved'
              ? 'Optional note for the client and the audit log'
              : 'Required: why is this payment being rejected?'}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDecision(null); setReason(''); }}>Cancel</Button>
            <Button
              onClick={confirmDecision}
              disabled={!!processingId}
              className={decision?.status === 'approved' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {processingId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm & notify client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!historyFor} onOpenChange={(open) => { if (!open) setHistoryFor(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit log</DialogTitle>
            <DialogDescription>Every approve/reject action recorded for this request.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {(auditByRequest[historyFor?.id || ''] || []).map((a) => (
              <div key={a.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium capitalize">{a.action}</span>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {a.previous_status || '—'} → {a.new_status}
                  {a.amount != null && ` · ₦${Number(a.amount).toLocaleString()}`}
                </p>
                {a.reason && <p className="mt-2">{a.reason}</p>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminPaymentRequests;
