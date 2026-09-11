import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, RefreshCw, Users, Eye, Loader2, CreditCard, FileText, Copy, Share2, Download, MessageCircle, Mail, Send, X, QrCode, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from '@/hooks/use-toast';

type Subscriber = {
  subscription_number: string; subscriber_name: string; estate_name: string; estate_code: string;
  client_id: string | null; order_id: string | null; subscription_status: string;
  payment_plan: string | null; subscription_amount: number; subscribed_at: string;
  client_email: string | null; plot_count: number; order_total: number; amount_paid: number;
  outstanding_balance: number; pbo_referral_code?: string | null; phone_number?: string | null;
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
const referralUrl = (code: string) => `${window.location.origin}/auth?ref=${encodeURIComponent(code)}`;
const qrUrl = (code: string) => `https://quickchart.io/qr?text=${encodeURIComponent(referralUrl(code))}&size=420&margin=2`;

const AdminEstateSubscribers: React.FC = () => {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [estate, setEstate] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Subscriber | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [referralBusy, setReferralBusy] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const referralCardRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_estate_subscribers', {
        _search: query.trim() || null,
        _estate_code: estate === 'all' ? null : estate,
      });
      if (error) throw error;
      const subscribers = ((data || []) as Subscriber[]).map((r) => ({ ...r, pbo_referral_code: null, phone_number: null }));
      const ids = subscribers.map((r) => r.client_id).filter((id): id is string => Boolean(id));
      if (ids.length) {
        const { data: profiles, error: profileError } = await supabase.from('profiles')
          .select('id, pbo_referral_code, phone_number').in('id', ids);
        if (!profileError) {
          const map = new Map((profiles || []).map((p) => [p.id, p]));
          subscribers.forEach((r) => {
            const p = r.client_id ? map.get(r.client_id) : undefined;
            r.pbo_referral_code = p?.pbo_referral_code || null;
            r.phone_number = p?.phone_number || null;
          });
        }
      }
      setRows(subscribers);
    } catch (e: any) {
      toast({ title: 'Could not load subscribers', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const openSubscriber = async (row: Subscriber) => {
    setSelected(row); setHistory([]); setQrReady(false); setReferralCopied(false);
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
  useEffect(() => { if (selected?.pbo_referral_code) setQrReady(false); }, [selected?.pbo_referral_code]);

  const estates = useMemo(() => Array.from(new Map(rows.map((r) => [r.estate_code, r.estate_name])).entries()), [rows]);
  const code = selected?.pbo_referral_code || '';
  const link = code ? referralUrl(code) : '';
  const shareText = selected && code ? `Join me with Bridgefort Homes. Use my referral code ${code} to get started: ${link}` : '';

  const copyReferral = async () => {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); setReferralCopied(true); toast({ title: 'Referral code copied' }); window.setTimeout(() => setReferralCopied(false), 2200); }
    catch { toast({ title: 'Could not copy referral code', description: 'Please copy it manually.', variant: 'destructive' }); }
  };

  const shareReferral = async () => {
    if (!shareText) return;
    setReferralBusy(true);
    try {
      if (navigator.share) await navigator.share({ title: 'Bridgefort Homes Referral', text: shareText, url: link });
      else await copyReferral();
    } catch (e: any) { if (e?.name !== 'AbortError') toast({ title: 'Could not share referral', variant: 'destructive' }); }
    finally { setReferralBusy(false); }
  };

  const makeReferralImage = async () => {
    if (!referralCardRef.current || !code) throw new Error('Referral card is not ready');
    return html2canvas(referralCardRef.current, { backgroundColor: '#07111f', scale: Math.min(3, window.devicePixelRatio || 2), useCORS: true, logging: false });
  };

  const downloadReferralImage = async () => {
    setReferralBusy(true);
    try {
      const canvas = await makeReferralImage();
      const a = document.createElement('a'); a.download = `bridgefort-referral-${code}.png`; a.href = canvas.toDataURL('image/png'); a.click();
      toast({ title: 'Referral image created' });
    } catch (e: any) { toast({ title: 'Could not create referral image', description: e?.message || 'Please try again.', variant: 'destructive' }); }
    finally { setReferralBusy(false); }
  };

  const shareReferralImage = async () => {
    setReferralBusy(true);
    try {
      const canvas = await makeReferralImage();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Unable to create image');
      const file = new File([blob], `bridgefort-referral-${code}.png`, { type: 'image/png' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: 'Bridgefort Homes Referral', text: shareText, files: [file] });
      } else {
        const a = document.createElement('a'); a.download = file.name; a.href = URL.createObjectURL(blob); a.click();
        window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast({ title: 'Image downloaded', description: 'Direct image sharing is not supported on this device.' });
      }
    } catch (e: any) { if (e?.name !== 'AbortError') toast({ title: 'Could not share referral image', description: e?.message || 'Please try again.', variant: 'destructive' }); }
    finally { setReferralBusy(false); }
  };

  const social = (network: 'whatsapp' | 'telegram' | 'facebook' | 'x' | 'email') => {
    if (!shareText) return;
    const t = encodeURIComponent(shareText); const u = encodeURIComponent(link);
    const target = {
      whatsapp: `https://wa.me/?text=${t}`,
      telegram: `https://t.me/share/url?url=${u}&text=${t}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      x: `https://twitter.com/intent/tweet?text=${t}`,
      email: `mailto:?subject=${encodeURIComponent('Bridgefort Homes Referral')}&body=${t}`,
    }[network];
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const clearFilters = () => { setQuery(''); setEstate('all'); setFiltersOpen(false); if (estate === 'all') window.setTimeout(load, 0); };

  return <Card className="border-slate-700 bg-slate-950 text-white shadow-xl">
    <CardHeader className="border-b border-slate-700 bg-white/[0.03] p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg"><Users className="h-5 w-5 text-primary"/> Estate Subscribers <Badge className="bg-primary/20 text-primary">{rows.length}</Badge></CardTitle><p className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">Search subscribers, review payments, balances and referral details from one responsive directory.</p></div>
        <Button variant="ghost" size="icon" onClick={load} disabled={loading} className="shrink-0 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Refresh subscribers">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4"/>}</Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 p-3 sm:p-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Search name, subscription no. or email" className="h-10 border-slate-700 bg-slate-950 pl-9 text-sm text-white placeholder:text-slate-500"/></div>
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

    <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] overflow-y-auto border-slate-700 bg-slate-950 p-0 text-white sm:max-w-3xl"><DialogHeader className="border-b border-slate-800 px-4 py-4 sm:px-6"><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/><span className="truncate">{selected?.subscriber_name}</span></DialogTitle><DialogDescription className="text-xs text-slate-400">Subscription details, payment history and referral sharing.</DialogDescription></DialogHeader>
      {selected && <div className="space-y-5 p-4 sm:p-6">
        <section><div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-semibold">Subscription overview</h4><Badge variant={statusVariant(selected.subscription_status)}>{selected.subscription_status}</Badge></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3"><Detail label="Subscription No." value={selected.subscription_number} mono/><Detail label="Estate" value={selected.estate_name}/><Detail label="Payment Plan" value={selected.payment_plan || '—'}/><Detail label="Plots" value={String(selected.plot_count)}/><Detail label="Subscribed" value={date(selected.subscribed_at)}/><Detail label="Order Total" value={money(selected.order_total)}/><Detail label="Amount Paid" value={money(selected.amount_paid)} good/><Detail label="Outstanding" value={money(selected.outstanding_balance)} warn/><Detail label="Email" value={selected.client_email || '—'}/><Detail label="Phone" value={selected.phone_number || '—'}/></div></section>

        <section className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-3 sm:p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="flex items-center gap-2 text-sm font-semibold"><Share2 className="h-4 w-4 text-primary"/>Referral sharing</h4><p className="mt-1 text-xs text-slate-400">Copy the code, share the link, or send the branded QR card.</p></div>{code && <Badge className="font-mono text-primary">{code}</Badge>}</div>
          {code ? <><div className="mt-3 flex flex-col gap-2 sm:flex-row"><div className="flex min-w-0 flex-1 items-center rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5"><span className="min-w-0 flex-1 truncate font-mono font-semibold">{code}</span><Button variant="ghost" size="sm" onClick={copyReferral} className="ml-2 shrink-0">{referralCopied ? <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-400"/> : <Copy className="mr-1.5 h-4 w-4"/>}{referralCopied ? 'Copied' : 'Copy'}</Button></div><Button onClick={shareReferral} disabled={referralBusy} className="bg-primary text-white hover:bg-primary/90"><Share2 className="mr-2 h-4 w-4"/>Share link</Button></div>
            <div className="mt-3 flex flex-wrap gap-2"><Social label="WhatsApp" icon={<MessageCircle className="h-4 w-4"/>} onClick={() => social('whatsapp')}/><Social label="Telegram" icon={<Send className="h-4 w-4"/>} onClick={() => social('telegram')}/><Social label="Facebook" icon={<Users className="h-4 w-4"/>} onClick={() => social('facebook')}/><Social label="X" icon={<X className="h-4 w-4"/>} onClick={() => social('x')}/><Social label="Email" icon={<Mail className="h-4 w-4"/>} onClick={() => social('email')}/></div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]"><div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><QrCode className="h-4 w-4 text-primary"/>QR code</div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex h-[202px] w-[202px] shrink-0 items-center justify-center rounded-lg bg-white p-1">{!qrReady && <Loader2 className="absolute h-6 w-6 animate-spin text-slate-500"/>}<img src={qrUrl(code)} alt={`QR code for ${code}`} className="h-[190px] w-[190px]" onLoad={() => setQrReady(true)} onError={() => { setQrReady(false); toast({ title: 'QR code could not load', description: 'The referral link can still be shared.', variant: 'destructive' }); }}/></div><div className="space-y-2 text-xs leading-5 text-slate-400"><p>Scanning opens the Bridgefort signup page with this referral code attached.</p><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={downloadReferralImage} disabled={referralBusy || !qrReady}><Download className="mr-2 h-4 w-4"/>Download image</Button><Button variant="outline" size="sm" onClick={shareReferralImage} disabled={referralBusy || !qrReady}><Share2 className="mr-2 h-4 w-4"/>Share image</Button></div></div></div></div>
              <div ref={referralCardRef} className="w-full overflow-hidden rounded-xl border border-slate-700 bg-[#07111f] p-4"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Bridgefort Homes</div><div className="mt-3 text-lg font-bold text-white">You're invited</div><p className="mt-1 text-xs leading-5 text-slate-400">Join Bridgefort Homes using this referral code.</p><div className="mt-3 flex items-center justify-center rounded-lg bg-white p-2"><img src={qrUrl(code)} alt="" className="h-[150px] w-[150px]"/></div><div className="mt-3 rounded-lg border border-slate-700 bg-white/[0.04] p-2 text-center"><div className="text-[10px] uppercase tracking-wide text-slate-400">Referral code</div><div className="mt-1 font-mono text-base font-bold tracking-wider text-white">{code}</div></div><div className="mt-3 text-center text-[10px] text-slate-500">www.bridgeforthomes.com</div></div></div>
          </> : <div className="mt-3 rounded-lg border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-400">This subscriber does not currently have a Bridgefort Realtor referral code on their profile.</div>}
        </section>

        <section><h4 className="mb-2 flex items-center gap-2 text-sm font-semibold"><CreditCard className="h-4 w-4 text-primary"/>Payment history</h4>{historyLoading ? <div className="rounded-xl border border-slate-800 py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin"/></div> : !history.length ? <div className="rounded-xl border border-slate-800 px-3 py-5 text-sm text-slate-400"><FileText className="mr-2 inline h-4 w-4"/>No payment records found for this subscription.</div> : <><div className="hidden overflow-x-auto rounded-xl border border-slate-800 sm:block"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-900"><tr><th className="px-3 py-3">Type</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Reference</th></tr></thead><tbody className="divide-y divide-slate-800">{history.map((h) => <tr key={h.payment_id}><td className="px-3 py-3">{h.documentation_name || h.payment_type}{h.installment_number ? ` #${h.installment_number}` : ''}</td><td className="px-3 py-3">{money(h.amount)}</td><td className="px-3 py-3"><Badge variant={statusVariant(h.status)}>{h.status}</Badge></td><td className="px-3 py-3 text-slate-400">{date(h.payment_date)}</td><td className="max-w-[220px] truncate px-3 py-3 font-mono text-xs text-slate-400">{h.reference || '—'}</td></tr>)}</tbody></table></div><div className="space-y-2 sm:hidden">{history.map((h) => <div key={h.payment_id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{h.documentation_name || h.payment_type}{h.installment_number ? ` #${h.installment_number}` : ''}</p><p className="text-xs text-slate-500">{date(h.payment_date)}</p></div><Badge variant={statusVariant(h.status)}>{h.status}</Badge></div><div className="mt-3 grid grid-cols-2 gap-2"><Metric label="Amount" value={money(h.amount)}/><Metric label="Installment" value={h.installment_status || '—'}/></div><div className="mt-2 rounded-md bg-slate-950 px-2 py-2"><p className="text-[10px] uppercase text-slate-500">Reference</p><p className="break-all font-mono text-[11px] text-slate-400">{h.reference || '—'}</p></div></div>)}</div></>}</section>
      </div>}
    </DialogContent></Dialog>
  </Card>;
};

const Metric: React.FC<{ label: string; value: string; mono?: boolean; good?: boolean; warn?: boolean }> = ({ label, value, mono, good, warn }) => <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-2"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className={`mt-0.5 truncate font-medium ${mono ? 'font-mono text-[11px]' : 'text-xs'} ${good ? 'text-emerald-400' : warn ? 'text-amber-400' : 'text-slate-200'}`}>{value}</div></div>;
const Detail: React.FC<{ label: string; value: string; mono?: boolean; good?: boolean; warn?: boolean }> = ({ label, value, mono, good, warn }) => <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2.5"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className={`mt-0.5 break-words font-medium ${mono ? 'font-mono text-xs' : 'text-sm'} ${good ? 'text-emerald-400' : warn ? 'text-amber-400' : 'text-white'}`}>{value}</div></div>;
const Social: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => <Button type="button" variant="outline" size="sm" onClick={onClick} className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-white/10 hover:text-white">{icon}<span className="ml-1.5">{label}</span></Button>;
const LoadingRow = () => <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400"><Loader2 className="mx-auto h-5 w-5 animate-spin"/><span className="mt-2 block text-xs">Loading subscribers…</span></td></tr>;
const EmptyRow: React.FC<{ colSpan: number }> = ({ colSpan }) => <tr><td colSpan={colSpan} className="px-3 py-10 text-center text-slate-400"><Users className="mx-auto mb-2 h-6 w-6 opacity-60"/>No subscribers found.</td></tr>;

export default AdminEstateSubscribers;
