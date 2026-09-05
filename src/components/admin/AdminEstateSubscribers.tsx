import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, RefreshCw, Users, Eye, Loader2, CreditCard, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Subscriber = {
  subscription_number: string;
  subscriber_name: string;
  estate_name: string;
  estate_code: string;
  client_id: string | null;
  order_id: string | null;
  subscription_status: string;
  payment_plan: string | null;
  subscription_amount: number;
  subscribed_at: string;
  client_email: string | null;
  plot_count: number;
  order_total: number;
  amount_paid: number;
  outstanding_balance: number;
};

type History = {
  payment_id: string;
  payment_type: string;
  amount: number;
  reference: string | null;
  status: string;
  payment_date: string;
  description: string | null;
  installment_number: number | null;
  installment_status: string | null;
  installment_amount_paid: number | null;
  installment_amount_due: number | null;
  documentation_name: string | null;
};

const money = (value: number) => `₦${Number(value || 0).toLocaleString('en-NG')}`;

const statusVariant = (s?: string): 'default' | 'secondary' => {
  const normalized = String(s || '').toLowerCase();
  return normalized === 'approved' || normalized === 'paid' ? 'default' : 'secondary';
};

const AdminEstateSubscribers: React.FC = () => {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [estate, setEstate] = useState('all');
  const [selected, setSelected] = useState<Subscriber | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_estate_subscribers', {
        _search: query.trim() || null,
        _estate_code: estate === 'all' ? null : estate,
      });
      if (error) throw error;
      setRows((data || []) as Subscriber[]);
    } catch (e: any) {
      toast({
        title: 'Could not load subscribers',
        description: e?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openSubscriber = async (r: Subscriber) => {
    setSelected(r);
    setHistory([]);
    if (!r.order_id) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_subscriber_history', {
        _order_id: r.order_id,
      });
      if (error) throw error;
      setHistory((data || []) as History[]);
    } catch (e: any) {
      toast({
        title: 'Could not load subscriber history',
        description: e?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [estate]); // eslint-disable-line react-hooks/exhaustive-deps

  const estates = useMemo(
    () => Array.from(new Map(rows.map((r) => [r.estate_code, r.estate_name])).entries()),
    [rows]
  );

  return (
    <Card className="border-slate-700 bg-slate-950 text-white shadow-xl">
      <CardHeader className="border-b border-slate-700 bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Estate Subscribers
              <Badge className="bg-primary/20 text-primary">{rows.length}</Badge>
            </CardTitle>
            <p className="mt-1 text-sm text-slate-300">
              Search and review subscribers, plots, payments and outstanding balances.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={load}
            disabled={loading}
            className="text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Refresh subscribers"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder="Search by name, subscription no., email…"
              className="border-slate-700 bg-slate-900 pl-9 text-white placeholder:text-slate-500"
            />
          </div>
          <select
            value={estate}
            onChange={(e) => setEstate(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <option value="all">All Estates</option>
            {estates.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          <Button onClick={load} disabled={loading} className="bg-primary text-white hover:bg-primary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">Search</span>
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-3 py-2 font-medium">Subscriber</th>
                <th className="px-3 py-2 font-medium">Estate</th>
                <th className="px-3 py-2 font-medium">Sub. No.</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Plots</th>
                <th className="px-3 py-2 font-medium">Order Total</th>
                <th className="px-3 py-2 font-medium">Paid</th>
                <th className="px-3 py-2 font-medium">Outstanding</th>
                <th className="px-3 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.subscription_number} className="hover:bg-white/[0.03]">
                    <td className="px-3 py-2">
                      <div className="font-medium text-white">{r.subscriber_name}</div>
                      <div className="text-xs text-slate-400">{r.client_email || '—'}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-300">{r.estate_name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-300">{r.subscription_number}</td>
                    <td className="px-3 py-2">
                      <Badge variant={statusVariant(r.subscription_status)}>{r.subscription_status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-slate-300">{r.plot_count}</td>
                    <td className="px-3 py-2 text-slate-300">{money(r.order_total)}</td>
                    <td className="px-3 py-2 text-emerald-400">{money(r.amount_paid)}</td>
                    <td className="px-3 py-2 text-amber-400">{money(r.outstanding_balance)}</td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openSubscriber(r)}
                        aria-label={`View ${r.subscriber_name}`}
                        className="text-slate-300 hover:bg-white/10 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-slate-700 bg-slate-950 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {selected?.subscriber_name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Subscription details and payment history.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <Detail label="Subscription No." value={selected.subscription_number} />
                <Detail label="Estate" value={selected.estate_name} />
                <Detail label="Status" value={selected.subscription_status} />
                <Detail label="Payment Plan" value={selected.payment_plan || '—'} />
                <Detail label="Plots" value={String(selected.plot_count)} />
                <Detail label="Subscribed At" value={new Date(selected.subscribed_at).toLocaleDateString()} />
                <Detail label="Order Total" value={money(selected.order_total)} />
                <Detail label="Amount Paid" value={money(selected.amount_paid)} />
                <Detail label="Outstanding" value={money(selected.outstanding_balance)} />
                <Detail label="Email" value={selected.client_email || '—'} />
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <CreditCard className="h-4 w-4 text-primary" /> Payment History
                </h4>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-4 text-sm text-slate-400">
                    <FileText className="h-4 w-4" /> No payment records found for this subscription.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-slate-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900 text-slate-300">
                        <tr>
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">Amount</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 font-medium">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {history.map((h) => (
                          <tr key={h.payment_id}>
                            <td className="px-3 py-2 text-slate-300">
                              {h.documentation_name || h.payment_type}
                              {h.installment_number ? ` #${h.installment_number}` : ''}
                            </td>
                            <td className="px-3 py-2 text-slate-300">{money(h.amount)}</td>
                            <td className="px-3 py-2">
                              <Badge variant={statusVariant(h.status)}>{h.status}</Badge>
                            </td>
                            <td className="px-3 py-2 text-slate-400">
                              {new Date(h.payment_date).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 font-mono text-xs text-slate-400">
                              {h.reference || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
    <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
    <div className="mt-0.5 font-medium text-white">{value}</div>
  </div>
);

export default AdminEstateSubscribers;
