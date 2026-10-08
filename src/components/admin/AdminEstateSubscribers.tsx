import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, RefreshCw, Users, Eye, Loader2, CreditCard, FileText, X, Filter, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Subscriber = {
  subscription_number: string; subscriber_name: string; estate_name: string; estate_code: string;
  client_id: string | null; order_id: string | null; subscription_status: string;
  payment_plan: string | null; subscription_amount: number; subscribed_at: string;
  client_email: string | null; phone_number: string | null; plot_count: number; order_total: number;
  amount_paid: number; outstanding_balance: number; pbo_referral_code: string | null;
  order_payment_status: string | null; payment_reference: string | null;
};

type History = {
  payment_id: string; payment_type: string; amount: number; reference: string | null;
  status: string; payment_date: string; description: string | null; installment_number: number | null;
  installment_status: string | null; installment_amount_paid: number | null;
  installment_amount_due: number | null; documentation_name: string | null;
};

const money = (value: number) => `₦${Number(value || 0).toLocaleString('en-NG')}`;
const date = (value?: string | null) => value && !Number.isNaN(new Date(value).getTime())
  ? new Date(value).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const statusVariant = (s?: string): 'default' | 'secondary' => ['approved', 'paid', 'active'].includes(String(s || '').toLowerCase()) ? 'default' : 'secondary';

const AdminEstateSubscribers: React.FC = () => {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [estate, setEstate] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
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
      const subscribers = ((data || []) as Subscriber[]).map((r) => ({
        ...r,
        client_email: r.client_email || null,
        phone_number: r.phone_number || null,
        pbo_referral_code: r.pbo_referral_code || null,
      }));
      const ids = subscribers.map((r) => r.client_id).filter((id): id is string => Boolean(id));
      if (ids.length) {
        const { data: profiles, error: profileError } = await supabase.from('profiles')
          .select('id, first_name, last_name, phone_number, pbo_referral_code')
          .in('id', ids);
        if (!profileError) {
          const map = new Map((profiles || []).map((p) => [p.id, p]));
          subscribers.forEach((r) => {
            const p = r.client_id ? map.get(r.client_id) : undefined;
            if (!p) return;
            const profileName = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || r.subscriber_name;
            r.subscriber_name = r.subscriber_name || profileName || 'Unnamed Subscriber';
            r.client_email = r.client_email || null;
                r.phone_number = r.phone_number || p.phone_number || null;
            r.pbo_referral_code = r.pbo_referral_code || p.pbo_referral_code || null;
          });
        }
      }
      setRows(subscribers);
    } catch (e: any) {
      toast({ title: 'Could not load subscribers', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const openSubscriber = async (row: Subscriber) => {
    setSelected(row); setHistory([]);
    if (!row.order_id) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_subscriber_history', { _order_id: row.order_id });
      if (error) throw error;
      setHistory((data || []) as History[]);
    } catch (e: any) {
      toast({ title: 'Could not load subscriber history', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally { setHistoryLoading(false); }
  };

  useEffect(() => { load(); }, [estate]); // eslint-disable-line react-hooks/exhaustive-deps

  const estates = useMemo(() => Array.from(new Map(rows.map((r) => [r.estate_code, r.estate_name])).entries()), [rows]);

  const clearFilters = () => { setQuery(''); setEstate('all'); setFiltersOpen(false); if (estate === 'all') window.setTimeout(load, 0); };

  return <Card className="border-slate-700 bg-slate-950 text-white shadow-xl">
    <CardHeader className="border-b border-slate-700 bg-white/[0.03] p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg"><Users className="h-5 w-5 text-primary"/> Estate Subscribers <Badge className="bg-primary/20 text-primary">{rows.length}</Badge></CardTitle><p className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">Search subscribers, review payments and balances from one responsive directory.</p></div>
        <Button variant="ghost" size="icon" onClick={load} disabled={loading} className="shrink-0 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Refresh subscribers">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4"/>}</Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 p-3 sm:p-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Search name, subscription no., email, phone or referral code" className="h-10 border-slate-700 bg-slate-950 pl-9 text-sm text-white placeholder:text-slate-500"/></div>
          <Button onClick={load} disabled={loading} className="h-10 bg-primary text-white hover:bg-primary/90"><Search className="h-4 w-4"/><span className="ml-2">Search</span></Button>
          <Button type="button" variant="outline" onClick={() => setFiltersOpen((v) => !v)} className="h-10 border-slate-700 bg-slate-950 text-slate-200 hover:bg-white/10 hover:text-white sm:hidden"><Filter className="mr-2 h-4 w-4"/>Filters<ChevronDown className={`ml-auto h-4 w-4 ${filtersOpen ? 'rotate-180' : ''}`}/></Button>
        </div>
        <div className={`${filtersOpen ? 'mt-2 flex' : 'hidden'} flex-col gap-2 sm:mt-0 sm:flex sm:flex-row sm:items-center`}>
          <select value={estate} onChange={(e) => setEstate(e.target.value)} aria-label="Filter by estate" className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none sm:w-auto sm:min-w-[190px]"><option value="all">All Estates</option>{estates.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select>
          {(query || estate !== 'all') && <Button type="button" variant="ghost" onClick={clearFilters} className="h-10 justify-start text-slate-400 hover:bg-white/10 hover:text-white sm:justify-center"><X className="mr-2 h-4 w-4"/>Clear filters</Button>}
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-800 md:block"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-900 text-slate-300"><tr><th className="px-3 py-3 font-medium">Subscriber</th><th className="px-3 py-3 font-medium">Estate</th><th className="px-3 py-3 font-medium">Sub. No.</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Plots</th><th className="px-3 py-3 font-medium">Order Total</th><th className="px-3 py-3 font-medium">Paid</th><th className="px-3 py-3 font-medium">Outstanding</th><th className="px-3 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-800">
        {loading && !rows.length ? <LoadingRow/> : !rows.length ? <EmptyRow colSpan={9}/> : rows.map((r) => <tr key={`${r.subscription_number}-${r.order_id || r.client_id || r.subscriber_name}`} className="hover:bg-white/[0.03]"><td className="px-3 py-3"><div className="font-medium text-white">{r.subscriber_name}</div><div className="max-w-[220px] truncate text-xs text-slate-400">{r.client_email || r.phone_number || '—'}</div></td><td className="px-3 py-3 text-slate-300">{r.estate_name}</td><td className="px-3 py-3 font-mono text-xs">{r.subscription_number}</td><td className="px-3 py-3"><Badge variant={statusVariant(r.subscription_status)}>{r.subscription_status}</Badge></td><td className="px-3 py-3">{r.plot_count}</td><td className="px-3 py-3">{money(r.order_total)}</td><td className="px-3 py-3 font-medium text-emerald-400">{money(r.amount_paid)}</td><td className="px-3 py-3 font-medium text-amber-400">{money(r.outstanding_balance)}</td><td className="px-3 py-3 text-right"><Button variant="outline" size="sm" onClick={() => openSubscriber(r)} className="border-slate-700 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white"><Eye className="mr-2 h-4 w-4"/>View</Button></td></tr>)}</tbody></table></div>

      <div className="space-y-3 md:hidden">{loading && !rows.length ? <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-400"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin"/>Loading subscribers…</div> : !rows.length ? <div className="rounded-xl border border-slate-800 p-8 text-center text-slate-400"><Users className="mx-auto mb-2 h-7 w-7 opacity-60"/><p className="font-medium text-slate-200">No subscribers found</p><p className="mt-1 text-xs">Try another search or estate.</p></div> : rows.map((r) => <div key={`${r.subscription_number}-${r.order_id || r.client_id || r.subscriber_name}`} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{r.subscriber_name}</p><p className="truncate text-xs text-slate-400">{r.client_email || r.phone_number || 'No contact details'}</p></div><Badge variant={statusVariant(r.subscription_status)} className="shrink-0">{r.subscription_status}</Badge></div><div className="mt-3 grid grid-cols-2 gap-2"><Metric label="Estate" value={r.estate_name}/><Metric label="Subscription" value={r.subscription_number} mono/><Metric label="Plots" value={String(r.plot_count)}/><Metric label="Plan" value={r.payment_plan || '—'}/><Metric label="Paid" value={money(r.amount_paid)} good/><Metric label="Outstanding" value={money(r.outstanding_balance)} warn/></div><Button onClick={() => openSubscriber(r)} className="mt-3 h-10 w-full bg-primary text-white hover:bg-primary/90"><Eye className="mr-2 h-4 w-4"/>View subscriber</Button></div>)}</div>
    </CardContent>

    <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] overflow-y-auto border-slate-700 bg-slate-950 p-0 text-white sm:max-w-3xl"><DialogHeader className="border-b border-slate-800 px-4 py-4 sm:px-6"><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/><span className="truncate">{selected?.subscriber_name}</span></DialogTitle><DialogDescription className="text-xs text-slate-400">Subscription details and payment history.</DialogDescription></DialogHeader>
      {selected && <div className="space-y-5 p-4 sm:p-6">
        <section><div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-semibold">Subscription overview</h4><Badge variant={statusVariant(selected.subscription_status)}>{selected.subscription_status}</Badge></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3"><Detail label="Subscription No." value={selected.subscription_number} mono/><Detail label="Estate" value={selected.estate_name}/><Detail label="Payment Plan" value={selected.payment_plan || '—'}/><Detail label="Plots" value={String(selected.plot_count)}/><Detail label="Subscribed" value={date(selected.subscribed_at)}/><Detail label="Order Total" value={money(selected.order_total)}/><Detail label="Amount Paid" value={money(selected.amount_paid)} good/><Detail label="Outstanding" value={money(selected.outstanding_balance)} warn/><Detail label="Email" value={selected.client_email || '—'}/><Detail label="Phone" value={selected.phone_number || '—'}/><Detail label="Payment Status" value={selected.order_payment_status || '—'}/><Detail label="Payment Reference" value={selected.payment_reference || '—'} mono/></div></section>

        <section><h4 className="mb-2 flex items-center gap-2 text-sm font-semibold"><CreditCard className="h-4 w-4 text-primary"/>Payment history</h4>{historyLoading ? <div className="rounded-xl border border-slate-800 py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin"/></div> : !history.length ? <div className="rounded-xl border border-slate-800 px-3 py-5 text-sm text-slate-400"><FileText className="mr-2 inline h-4 w-4"/>No payment records found for this subscription.</div> : <><div className="hidden overflow-x-auto rounded-xl border border-slate-800 sm:block"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-900"><tr><th className="px-3 py-3">Type</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Reference</th></tr></thead><tbody className="divide-y divide-slate-800">{history.map((h) => <tr key={h.payment_id}><td className="px-3 py-3">{h.documentation_name || h.payment_type}{h.installment_number ? ` #${h.installment_number}` : ''}</td><td className="px-3 py-3">{money(h.amount)}</td><td className="px-3 py-3"><Badge variant={statusVariant(h.status)}>{h.status}</Badge></td><td className="px-3 py-3 text-slate-400">{date(h.payment_date)}</td><td className="max-w-[220px] truncate px-3 py-3 font-mono text-xs text-slate-400">{h.reference || '—'}</td></tr>)}</tbody></table></div><div className="space-y-2 sm:hidden">{history.map((h) => <div key={h.payment_id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{h.documentation_name || h.payment_type}{h.installment_number ? ` #${h.installment_number}` : ''}</p><p className="text-xs text-slate-500">{date(h.payment_date)}</p></div><Badge variant={statusVariant(h.status)}>{h.status}</Badge></div><div className="mt-3 grid grid-cols-2 gap-2"><Metric label="Amount" value={money(h.amount)}/><Metric label="Installment" value={h.installment_status || '—'}/></div><div className="mt-2 rounded-md bg-slate-950 px-2 py-2"><p className="text-[10px] uppercase text-slate-500">Reference</p><p className="break-all font-mono text-[11px] text-slate-400">{h.reference || '—'}</p></div></div>)}</div></>}</section>
      </div>}
    </DialogContent></Dialog>
  </Card>;
};

const Metric: React.FC<{ label: string; value: string; mono?: boolean; good?: boolean; warn?: boolean }> = ({ label, value, mono, good, warn }) => <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-2"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className={`mt-0.5 truncate font-medium ${mono ? 'font-mono text-[11px]' : 'text-xs'} ${good ? 'text-emerald-400' : warn ? 'text-amber-400' : 'text-slate-200'}`}>{value}</div></div>;
const Detail: React.FC<{ label: string; value: string; mono?: boolean; good?: boolean; warn?: boolean }> = ({ label, value, mono, good, warn }) => <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2.5"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className={`mt-0.5 break-words font-medium ${mono ? 'font-mono text-xs' : 'text-sm'} ${good ? 'text-emerald-400' : warn ? 'text-amber-400' : 'text-white'}`}>{value}</div></div>;
const LoadingRow = () => <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400"><Loader2 className="mx-auto h-5 w-5 animate-spin"/><span className="mt-2 block text-xs">Loading subscribers…</span></td></tr>;
const EmptyRow: React.FC<{ colSpan: number }> = ({ colSpan }) => <tr><td colSpan={colSpan} className="px-3 py-10 text-center text-slate-400"><Users className="mx-auto mb-2 h-6 w-6 opacity-60"/>No subscribers found.</td></tr>;

export default AdminEstateSubscribers;
