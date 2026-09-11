import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  Search,
  RefreshCw,
  Users,
  Eye,
  Loader2,
  CreditCard,
  FileText,
  Copy,
  Share2,
  Download,
  MessageCircle,
  Mail,
  Send,
  X,
  QrCode,
  Filter,
  Phone,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
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
  pbo_referral_code?: string | null;
  phone_number?: string | null;
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
  return normalized === 'approved' || normalized === 'paid' || normalized === 'active'
    ? 'default'
    : 'secondary';
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const referralUrl = (code: string) => {
  const url = new URL('/auth', window.location.origin);
  url.searchParams.set('ref', code);
  return url.toString();
};

const AdminEstateSubscribers: React.FC = () => {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [estate, setEstate] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Subscriber | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [referralBusy, setReferralBusy] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const referralCardRef = useRef<HTMLDivElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_estate_subscribers', {
        _search: query.trim() || null,
        _estate_code: estate === 'all' ? null : estate,
      });
      if (error) throw error;

      const subscribers = ((data || []) as Subscriber[]).map((row) => ({
        ...row,
        pbo_referral_code: null,
        phone_number: null,
      }));

      // The subscriber RPC deliberately returns subscription/payment data only.
      // Enrich the directory with the referral code and phone from the client profile.
      const clientIds = subscribers
        .map((row) => row.client_id)
        .filter((id): id is string => Boolean(id));

      if (clientIds.length) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, pbo_referral_code, phone_number')
          .in('id', clientIds);

        if (!profileError) {
          const profileMap = new Map(
            (profiles || []).map((profile) => [profile.id, profile])
          );
          subscribers.forEach((row) => {
            const profile = row.client_id ? profileMap.get(row.client_id) : undefined;
            row.pbo_referral_code = profile?.pbo_referral_code || null;
            row.phone_number = profile?.phone_number || null;
          });
        }
      }

      setRows(subscribers);
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

  const openSubscriber = async (row: Subscriber) => {
    setSelected(row);
    setHistory([]);
    setReferralCopied(false);

    if (row.pbo_referral_code && qrCanvasRef.current) {
      try {
        await QRCode.toCanvas(qrCanvasRef.current, referralUrl(row.pbo_referral_code), {
          width: 190,
          margin: 2,
          errorCorrectionLevel: 'M',
        });
      } catch {
        // QR is regenerated by the effect below when the dialog mounts.
      }
    }

    if (!row.order_id) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_subscriber_history', {
        _order_id: row.order_id,
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

  useEffect(() => {
    let cancelled = false;
    const code = selected?.pbo_referral_code;
    if (!code) return;

    const draw = async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (cancelled || !qrCanvasRef.current) return;
      try {
        await QRCode.toCanvas(qrCanvasRef.current, referralUrl(code), {
          width: 190,
          margin: 2,
          errorCorrectionLevel: 'M',
        });
      } catch {
        if (!cancelled) {
          toast({
            title: 'QR code unavailable',
            description: 'The referral code can still be copied and shared as text.',
            variant: 'destructive',
          });
        }
      }
    };

    draw();
    return () => {
      cancelled = true;
    };
  }, [selected?.pbo_referral_code]);

  const estates = useMemo(
    () => Array.from(new Map(rows.map((r) => [r.estate_code, r.estate_name])).entries()),
    [rows]
  );

  const referralCode = selected?.pbo_referral_code || '';
  const shareText = selected && referralCode
    ? `Join me with Bridgefort Homes. Use my referral code ${referralCode} to get started: ${referralUrl(referralCode)}`
    : '';

  const copyReferral = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setReferralCopied(true);
      toast({ title: 'Referral code copied' });
      window.setTimeout(() => setReferralCopied(false), 2200);
    } catch {
      toast({ title: 'Could not copy referral code', description: 'Please copy it manually.', variant: 'destructive' });
    }
  };

  const shareReferral = async () => {
    if (!shareText) return;
    setReferralBusy(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Bridgefort Homes Referral',
          text: shareText,
          url: referralUrl(referralCode),
        });
      } else {
        await copyReferral();
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        toast({ title: 'Could not share referral', variant: 'destructive' });
      }
    } finally {
      setReferralBusy(false);
    }
  };

  const downloadReferralImage = async () => {
    if (!referralCardRef.current || !referralCode) return;
    setReferralBusy(true);
    try {
      const canvas = await html2canvas(referralCardRef.current, {
        backgroundColor: '#07111f',
        scale: Math.min(3, window.devicePixelRatio || 2),
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `bridgefort-referral-${referralCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'Referral image created' });
    } catch (error: any) {
      toast({ title: 'Could not create referral image', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setReferralBusy(false);
    }
  };

  const shareReferralImage = async () => {
    if (!referralCardRef.current || !referralCode) return;
    setReferralBusy(true);
    try {
      const canvas = await html2canvas(referralCardRef.current, {
        backgroundColor: '#07111f',
        scale: Math.min(3, window.devicePixelRatio || 2),
        useCORS: true,
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Unable to create image');

      const file = new File([blob], `bridgefort-referral-${referralCode}.png`, { type: 'image/png' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          title: 'Bridgefort Homes Referral',
          text: shareText,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = file.name;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        toast({ title: 'Image downloaded', description: 'Your device does not support image sharing, so the card was downloaded instead.' });
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        toast({ title: 'Could not share referral image', description: error?.message || 'Please try again.', variant: 'destructive' });
      }
    } finally {
      setReferralBusy(false);
    }
  };

  const openSocial = (network: 'whatsapp' | 'telegram' | 'facebook' | 'x' | 'email') => {
    if (!shareText) return;
    const url = referralUrl(referralCode);
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);
    const targets: Record<typeof network, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encodedText}`,
      email: `mailto:?subject=${encodeURIComponent('Bridgefort Homes Referral')}&body=${encodedText}`,
    };
    window.open(targets[network], '_blank', 'noopener,noreferrer');
  };

  const clearFilters = () => {
    setQuery('');
    setEstate('all');
    setFiltersOpen(false);
    if (estate === 'all') window.setTimeout(load, 0);
  };

  return (
    <Card className="border-slate-700 bg-slate-950 text-white shadow-xl">
      <CardHeader className="border-b border-slate-700 bg-white/[0.03] p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
              <Users className="h-5 w-5 shrink-0 text-primary" />
              Estate Subscribers
              <Badge className="bg-primary/20 text-primary">{rows.length}</Badge>
            </CardTitle>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
              Search subscribers, review payments, balances and referral details from one responsive directory.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={load}
            disabled={loading}
            className="shrink-0 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Refresh subscribers"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-3 sm:p-4">
        {/* Responsive search/filter controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
                placeholder="Search name, subscription no. or email"
                className="h-10 border-slate-700 bg-slate-950 pl-9 text-sm text-white placeholder:text-slate-500"
                aria-label="Search estate subscribers"
              />
            </div>
            <Button onClick={load} disabled={loading} className="h-10 bg-primary text-white hover:bg-primary/90 sm:px-5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Search</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFiltersOpen((open) => !open)}
              className="h-10 border-slate-700 bg-slate-950 text-slate-200 hover:bg-white/10 hover:text-white sm:hidden"
            >
              <Filter className="mr-2 h-4 w-4" /> Filters
              <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          <div className={`${filtersOpen ? 'mt-2 flex' : 'hidden'} flex-col gap-2 sm:mt-0 sm:flex sm:flex-row sm:items-center`}>
            <label className="sr-only" htmlFor="estate-filter">Filter by estate</label>
            <select
              id="estate-filter"
              value={estate}
              onChange={(e) => setEstate(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/50 sm:w-auto sm:min-w-[190px]"
            >
              <option value="all">All Estates</option>
              {estates.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            {(query || estate !== 'all') && (
              <Button type="button" variant="ghost" onClick={clearFilters} className="h-10 justify-start text-slate-400 hover:bg-white/10 hover:text-white sm:justify-center">
                <X className="mr-2 h-4 w-4" /> Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Desktop/tablet directory */}
        <div className="hidden overflow-x-auto rounded-xl border border-slate-800 md:block">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-3 py-3 font-medium">Subscriber</th>
                <th className="px-3 py-3 font-medium">Estate</th>
                <th className="px-3 py-3 font-medium">Sub. No.</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Plots</th>
                <th className="px-3 py-3 font-medium">Order Total</th>
                <th className="px-3 py-3 font-medium">Paid</th>
                <th className="px-3 py-3 font-medium">Outstanding</th>
                <th className="px-3 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && rows.length === 0 ? (
                <LoadingRow />
              ) : rows.length === 0 ? (
                <EmptyRow colSpan={9} />
              ) : rows.map((row) => (
                <tr key={`${row.subscription_number}-${row.order_id || row.client_id || row.subscriber_name}`} className="hover:bg-white/[0.03]">
                  <td className="px-3 py-3">
                    <div className="font-medium text-white">{row.subscriber_name}</div>
                    <div className="max-w-[220px] truncate text-xs text-slate-400">{row.client_email || row.phone_number || '—'}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-300">{row.estate_name}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-300">{row.subscription_number}</td>
                  <td className="px-3 py-3"><Badge variant={statusVariant(row.subscription_status)}>{row.subscription_status}</Badge></td>
                  <td className="px-3 py-3 text-slate-300">{row.plot_count}</td>
                  <td className="px-3 py-3 text-slate-300">{money(row.order_total)}</td>
                  <td className="px-3 py-3 font-medium text-emerald-400">{money(row.amount_paid)}</td>
                  <td className="px-3 py-3 font-medium text-amber-400">{money(row.outstanding_balance)}</td>
                  <td className="px-3 py-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => openSubscriber(row)} className="border-slate-700 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white">
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile subscriber cards */}
        <div className="space-y-3 md:hidden">
          {loading && rows.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-10 text-center text-slate-400">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading subscribers…
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-10 text-center text-slate-400">
              <Users className="mx-auto mb-2 h-7 w-7 opacity-60" />
              <p className="font-medium text-slate-200">No subscribers found</p>
              <p className="mt-1 text-xs">Try another name, subscription number or estate.</p>
            </div>
          ) : rows.map((row) => (
            <div key={`${row.subscription_number}-${row.order_id || row.client_id || row.subscriber_name}`} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{row.subscriber_name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{row.client_email || row.phone_number || 'No contact details'}</p>
                </div>
                <Badge variant={statusVariant(row.subscription_status)} className="shrink-0">{row.subscription_status}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <MobileMetric label="Estate" value={row.estate_name} />
                <MobileMetric label="Subscription" value={row.subscription_number} mono />
                <MobileMetric label="Plots" value={String(row.plot_count)} />
                <MobileMetric label="Plan" value={row.payment_plan || '—'} />
                <MobileMetric label="Paid" value={money(row.amount_paid)} positive />
                <MobileMetric label="Outstanding" value={money(row.outstanding_balance)} warning />
              </div>

              <Button onClick={() => openSubscriber(row)} className="mt-3 h-10 w-full bg-primary text-white hover:bg-primary/90">
                <Eye className="mr-2 h-4 w-4" /> View subscriber
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] overflow-y-auto border-slate-700 bg-slate-950 p-0 text-white sm:max-w-3xl">
          <DialogHeader className="border-b border-slate-800 px-4 py-4 sm:px-6">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-5 w-5 text-primary" />
              <span className="truncate">{selected?.subscriber_name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 sm:text-sm">
              Subscription details, payment history and referral sharing.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 p-4 sm:p-6">
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Subscription overview</h4>
                  <Badge variant={statusVariant(selected.subscription_status)}>{selected.subscription_status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Detail label="Subscription No." value={selected.subscription_number} mono />
                  <Detail label="Estate" value={selected.estate_name} />
                  <Detail label="Payment Plan" value={selected.payment_plan || '—'} />
                  <Detail label="Plots" value={String(selected.plot_count)} />
                  <Detail label="Subscribed" value={formatDate(selected.subscribed_at)} />
                  <Detail label="Order Total" value={money(selected.order_total)} />
                  <Detail label="Amount Paid" value={money(selected.amount_paid)} positive />
                  <Detail label="Outstanding" value={money(selected.outstanding_balance)} warning />
                  <Detail label="Email" value={selected.client_email || '—'} />
                  <Detail label="Phone" value={selected.phone_number || '—'} />
                </div>
              </section>

              {/* Referral */}
              <section className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-3 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-white"><Share2 className="h-4 w-4 text-primary" /> Referral sharing</h4>
                    <p className="mt-1 text-xs text-slate-400">Copy the code, share the referral link or send the branded QR image.</p>
                  </div>
                  {referralCode && (
                    <Badge className="bg-primary/15 font-mono text-primary">{referralCode}</Badge>
                  )}
                </div>

                {referralCode ? (
                  <>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <div className="flex min-w-0 flex-1 items-center rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5">
                        <span className="min-w-0 flex-1 truncate font-mono text-sm font-semibold tracking-wide text-white">{referralCode}</span>
                        <Button variant="ghost" size="sm" onClick={copyReferral} className="ml-2 shrink-0 text-slate-300 hover:bg-white/10 hover:text-white">
                          {referralCopied ? <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-400" /> : <Copy className="mr-1.5 h-4 w-4" />}
                          {referralCopied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <Button onClick={shareReferral} disabled={referralBusy} className="bg-primary text-white hover:bg-primary/90">
                        {referralBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />} Share link
                      </Button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <SocialButton label="WhatsApp" icon={<MessageCircle className="h-4 w-4" />} onClick={() => openSocial('whatsapp')} />
                      <SocialButton label="Telegram" icon={<Send className="h-4 w-4" />} onClick={() => openSocial('telegram')} />
                      <SocialButton label="Facebook" icon={<Users className="h-4 w-4" />} onClick={() => openSocial('facebook')} />
                      <SocialButton label="X" icon={<X className="h-4 w-4" />} onClick={() => openSocial('x')} />
                      <SocialButton label="Email" icon={<Mail className="h-4 w-4" />} onClick={() => openSocial('email')} />
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          <QrCode className="h-4 w-4 text-primary" /> QR code
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex h-[202px] w-[202px] shrink-0 items-center justify-center rounded-lg bg-white p-1">
                            <canvas ref={qrCanvasRef} aria-label={`QR code for ${referralCode}`} />
                          </div>
                          <div className="space-y-2 text-xs leading-5 text-slate-400">
                            <p>Scan this code to open the Bridgefort signup page with the referral code attached.</p>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={downloadReferralImage} disabled={referralBusy} className="border-slate-700 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white">
                                <Download className="mr-2 h-4 w-4" /> Download image
                              </Button>
                              <Button variant="outline" size="sm" onClick={shareReferralImage} disabled={referralBusy} className="border-slate-700 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white">
                                <Share2 className="mr-2 h-4 w-4" /> Share image
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Exportable branded card. It remains in the DOM so html2canvas can capture it. */}
                      <div ref={referralCardRef} className="w-full overflow-hidden rounded-xl border border-slate-700 bg-[#07111f] p-4 shadow-lg">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Bridgefort Homes</div>
                        <div className="mt-3 text-lg font-bold text-white">You're invited</div>
                        <p className="mt-1 text-xs leading-5 text-slate-400">Join Bridgefort Homes using this referral code.</p>
                        <div className="mt-3 flex items-center justify-center rounded-lg bg-white p-2">
                          <canvas
                            className="h-[150px] w-[150px]"
                            ref={(node) => {
                              // Keep the visible QR canvas as the source and copy it into this card.
                              if (node && qrCanvasRef.current) {
                                const context = node.getContext('2d');
                                if (context) context.drawImage(qrCanvasRef.current, 0, 0, 150, 150);
                              }
                            }}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 rounded-lg border border-slate-700 bg-white/[0.04] p-2 text-center">
                          <div className="text-[10px] uppercase tracking-wide text-slate-400">Referral code</div>
                          <div className="mt-1 font-mono text-base font-bold tracking-wider text-white">{referralCode}</div>
                        </div>
                        <div className="mt-3 text-center text-[10px] text-slate-500">www.bridgeforthomes.com</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-3 rounded-lg border border-dashed border-slate-700 bg-slate-950/60 px-3 py-4 text-sm text-slate-400">
                    This subscriber does not currently have a Bridgefort Realtor referral code on their profile.
                  </div>
                )}
              </section>

              {/* Responsive payment history */}
              <section>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <CreditCard className="h-4 w-4 text-primary" /> Payment history
                </h4>
                {historyLoading ? (
                  <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-5 text-sm text-slate-400">
                    <FileText className="h-4 w-4 shrink-0" /> No payment records found for this subscription.
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto rounded-xl border border-slate-800 sm:block">
                      <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="bg-slate-900 text-slate-300">
                          <tr>
                            <th className="px-3 py-3 font-medium">Type</th>
                            <th className="px-3 py-3 font-medium">Amount</th>
                            <th className="px-3 py-3 font-medium">Status</th>
                            <th className="px-3 py-3 font-medium">Date</th>
                            <th className="px-3 py-3 font-medium">Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {history.map((item) => (
                            <tr key={item.payment_id} className="hover:bg-white/[0.03]">
                              <td className="px-3 py-3 text-slate-300">
                                {item.documentation_name || item.payment_type}{item.installment_number ? ` #${item.installment_number}` : ''}
                              </td>
                              <td className="px-3 py-3 font-medium text-slate-200">{money(item.amount)}</td>
                              <td className="px-3 py-3"><Badge variant={statusVariant(item.status)}>{item.status}</Badge></td>
                              <td className="px-3 py-3 text-slate-400">{formatDate(item.payment_date)}</td>
                              <td className="max-w-[220px] truncate px-3 py-3 font-mono text-xs text-slate-400">{item.reference || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-2 sm:hidden">
                      {history.map((item) => (
                        <div key={item.payment_id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-white">
                                {item.documentation_name || item.payment_type}{item.installment_number ? ` #${item.installment_number}` : ''}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">{formatDate(item.payment_date)}</p>
                            </div>
                            <Badge variant={statusVariant(item.status)} className="shrink-0">{item.status}</Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <MobileMetric label="Amount" value={money(item.amount)} />
                            <MobileMetric label="Installment" value={item.installment_status || '—'} />
                          </div>
                          <div className="mt-2 rounded-md bg-slate-950 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500">Reference</p>
                            <p className="mt-0.5 break-all font-mono text-[11px] text-slate-400">{item.reference || '—'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const MobileMetric: React.FC<{ label: string; value: string; mono?: boolean; positive?: boolean; warning?: boolean }> = ({ label, value, mono, positive, warning }) => (
  <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-2">
    <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    <div className={`mt-0.5 truncate font-medium ${mono ? 'font-mono text-[11px]' : 'text-xs'} ${positive ? 'text-emerald-400' : warning ? 'text-amber-400' : 'text-slate-200'}`} title={value}>
      {value}
    </div>
  </div>
);

const Detail: React.FC<{ label: string; value: string; mono?: boolean; positive?: boolean; warning?: boolean }> = ({ label, value, mono, positive, warning }) => (
  <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2.5 sm:px-3">
    <div className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">{label}</div>
    <div className={`mt-0.5 break-words font-medium ${mono ? 'font-mono text-xs' : 'text-sm'} ${positive ? 'text-emerald-400' : warning ? 'text-amber-400' : 'text-white'}`}>
      {value}
    </div>
  </div>
);

const SocialButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void }> = ({ label, icon, onClick }) => (
  <Button type="button" variant="outline" size="sm" onClick={onClick} className="border-slate-700 bg-slate-950 text-slate-200 hover:bg-white/10 hover:text-white">
    {icon}<span className="ml-1.5">{label}</span>
  </Button>
);

const LoadingRow = () => (
  <tr>
    <td colSpan={9} className="px-3 py-10 text-center text-slate-400">
      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      <span className="mt-2 block text-xs">Loading subscribers…</span>
    </td>
  </tr>
);

const EmptyRow: React.FC<{ colSpan: number }> = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="px-3 py-10 text-center text-slate-400">
      <Users className="mx-auto mb-2 h-6 w-6 opacity-60" />
      No subscribers found.
    </td>
  </tr>
);

export default AdminEstateSubscribers;
