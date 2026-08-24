import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, CalendarDays, CheckCircle2, Clock3, CreditCard, FileText, Loader2, WalletCards } from 'lucide-react';

const money = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value || 0);
const asNumber = (value: unknown) => Number(value || 0);

const PropertiesTab = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [timelines, setTimelines] = useState<Record<string, any[]>>({});
  const [installments, setInstallments] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [documentationPayingId, setDocumentationPayingId] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const loadProperties = async () => {
    setLoading(true); setError('');
    const { data, error: queryError } = await supabase.from('my_properties').select('*').order('created_at', { ascending: false });
    if (queryError) { setError(queryError.message); setProperties([]); setLoading(false); return; }
    setProperties(data || []);
    const entries = await Promise.all((data || []).map(async (p: any) => {
      const [{ data: events }, { data: schedule }] = await Promise.all([
        supabase.rpc('get_my_property_payment_timeline', { _order_id: p.order_id }),
        supabase.rpc('get_my_property_installments', { _order_id: p.order_id }),
      ]);
      return [p.order_id, { events: events || [], schedule: schedule || [] }] as const;
    }));
    setTimelines(Object.fromEntries(entries.map(([id, v]) => [id, v.events])));
    setInstallments(Object.fromEntries(entries.map(([id, v]) => [id, v.schedule])));
    setLoading(false);
  };
  useEffect(() => { loadProperties(); }, []);

  const grouped = useMemo(() => properties.map((p) => {
    const total = asNumber(p.total_amount), paid = asNumber(p.amount_paid);
    const plotCount = Math.max(1, asNumber(p.quantity) || (p.plot_id ? String(p.plot_id).split(',').map((x: string) => x.trim()).filter(Boolean).length : 1));
    return { ...p, balance: Math.max(total - paid, 0), plotCount };
  }), [properties]);

  const startPayment = async (property: any) => {
    const amount = Number(amounts[property.order_id]);
    if (!amount || amount <= 0) return setError('Enter the amount you want to pay.');
    if (amount > property.balance) return setError('Payment cannot be more than your outstanding balance.');
    setPayingId(property.order_id); setError('');
    try {
      const { data: sessionData } = await supabase.auth.getSession(); const email = sessionData.session?.user?.email;
      if (!email) throw new Error('Your account email could not be found.');
      const { data, error: fnError } = await supabase.functions.invoke('paystack-initialize', { body: { email, order_id: property.order_id, amount, payment_type: 'installment', metadata: { order_id: property.order_id, payment_type: 'installment', property_name: property.property_name, plot_id: property.plot_id, quantity: property.plotCount, amount_paid_now: amount } } });
      if (fnError) throw fnError; const checkoutUrl = data?.data?.authorization_url || data?.authorization_url || data?.data?.checkout_url || data?.checkout_url;
      if (checkoutUrl) window.location.href = checkoutUrl; else throw new Error(data?.message || data?.error || 'Payment checkout could not be created.');
    } catch (e: any) { setError(e?.message || 'Unable to start payment. Please try again.'); } finally { setPayingId(null); }
  };

  const startDocumentationPayment = async (property: any) => {
    setDocumentationPayingId(property.order_id); setError('');
    try {
      const { data: request, error: requestError } = await supabase.rpc('create_documentation_payment_request', { _order_id: property.order_id });
      if (requestError) throw requestError; const paymentId = request?.payment_id;
      if (!paymentId) throw new Error('Documentation payment request could not be created.');
      const { data: checkout, error: checkoutError } = await supabase.rpc('get_documentation_payment_checkout', { _payment_id: paymentId });
      if (checkoutError) throw checkoutError;
      const { data: sessionData } = await supabase.auth.getSession(); const email = sessionData.session?.user?.email;
      if (!email) throw new Error('Your account email could not be found.');
      const { data, error: fnError } = await supabase.functions.invoke('paystack-initialize', { body: { email, order_id: property.order_id, payment_id: paymentId, amount: checkout.amount, payment_type: 'documentation', metadata: { order_id: property.order_id, payment_id: paymentId, payment_type: 'documentation', documentation_type_id: checkout.documentation_type_id, documentation_name: checkout.documentation_name, property_name: checkout.property_name, quantity: checkout.plot_count } } });
      if (fnError) throw fnError; const checkoutUrl = data?.data?.authorization_url || data?.authorization_url || data?.data?.checkout_url || data?.checkout_url;
      if (checkoutUrl) window.location.href = checkoutUrl; else throw new Error(data?.message || data?.error || 'Documentation payment checkout could not be created.');
    } catch (e: any) { setError(e?.message || 'Unable to start documentation payment. Please try again.'); } finally { setDocumentationPayingId(null); }
  };

  if (loading) return <Card className="border-white/10 bg-background/70 backdrop-blur-xl"><CardContent className="flex items-center justify-center py-16"><Loader2 className="mr-2 animate-spin" /> Loading your properties...</CardContent></Card>;

  return <div className="space-y-6"><Card className="overflow-hidden border-white/10 bg-background/70 backdrop-blur-xl shadow-xl"><CardHeader className="border-b border-white/10 bg-white/[0.03]"><CardTitle className="flex items-center gap-2"><Building size={20} /> My Properties</CardTitle><p className="text-sm text-muted-foreground">Track your estate purchases, plots, documentation, payments and progress in one place.</p></CardHeader><CardContent className="p-4 md:p-6 space-y-5">{error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}{!grouped.length ? <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-muted-foreground">No purchased property found yet. Start browsing available properties to make your first purchase.</div> : grouped.map((p) => { const paid=asNumber(p.amount_paid), total=asNumber(p.total_amount), balance=p.balance, progress=total?Math.min((paid/total)*100,100):0, events=timelines[p.order_id]||[], schedule=installments[p.order_id]||[], documentationPerPlot=asNumber(p.documentation_price)/(p.plotCount||1); return <div key={p.order_id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:p-5 shadow-lg"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">{p.property_name||'Estate Property'}</h3><Badge variant={balance<=0?'default':'secondary'}>{balance<=0?'Fully Paid':'Ongoing'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{p.property_type||'Estate Land'} • <strong>{p.plotCount} {p.plotCount===1?'Plot':'Plots'}</strong>{p.plot_id?` • ${p.plot_id}`:''}</p></div><div className="text-sm text-muted-foreground">Order #{String(p.order_id).slice(0,8)}</div></div><div className="mt-5 grid gap-3 sm:grid-cols-4"><div className="rounded-xl bg-black/10 p-3"><p className="text-xs text-muted-foreground">Plots</p><p className="font-semibold">{p.plotCount}</p></div><div className="rounded-xl bg-black/10 p-3"><p className="text-xs text-muted-foreground">Purchase Price</p><p className="font-semibold">{money(total)}</p></div><div className="rounded-xl bg-black/10 p-3"><p className="text-xs text-muted-foreground">Amount Paid</p><p className="font-semibold">{money(paid)}</p></div><div className="rounded-xl border border-primary/20 bg-primary/5 p-3"><p className="text-xs font-medium text-muted-foreground">OUTSTANDING BALANCE</p><p className="text-2xl font-extrabold tracking-tight">{money(balance)}</p></div></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Payment progress</span><span>{Math.round(progress)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-all" style={{width:`${progress}%`}} /></div></div>{schedule.length>0&&<div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-center gap-2 text-sm font-medium"><CalendarDays size={16}/> Installment Schedule</div><div className="mt-3 space-y-2">{schedule.map((s:any)=><div key={s.id||s.installment_number} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-white/10 bg-black/10 p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"><div><p className="text-sm font-medium">Installment {s.installment_number}</p>{s.due_date&&<p className="text-[11px] text-muted-foreground">Due {new Date(s.due_date).toLocaleDateString('en-NG')}</p>}</div><span className="text-xs text-muted-foreground">Due {money(asNumber(s.amount_due))}</span><span className="text-xs font-medium">Paid {money(asNumber(s.amount_paid))}</span><Badge variant={s.status==='paid'?'default':s.status==='partial'?'secondary':'outline'}>{s.status==='partial'?'PARTIAL':String(s.status||'PENDING').toUpperCase()}</Badge></div>)}</div></div>}{balance>0&&<div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="mb-3 flex items-center gap-2 text-sm font-medium"><WalletCards size={16}/> Flexible installment payment</div><p className="mb-3 text-xs text-muted-foreground">Enter any amount you have available. There is no fixed installment amount, provided it does not exceed your current balance.</p><div className="flex flex-col gap-2 sm:flex-row"><Input type="number" min="1" max={balance} value={amounts[p.order_id]||''} onChange={e=>setAmounts(x=>({...x,[p.order_id]:e.target.value}))} placeholder={`Up to ${money(balance)}`}/><Button onClick={()=>startPayment(p)} disabled={payingId===p.order_id}>{payingId===p.order_id?<Loader2 className="mr-2 animate-spin" size={16}/>:<CreditCard className="mr-2" size={16}/>} Make Payment</Button></div></div>}<div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-center gap-2 text-sm font-medium"><FileText size={16}/> Complete Documentation Bundle</div><p className="mt-1 text-xs text-muted-foreground">Documentation is a complete bundle charged per plot. {money(documentationPerPlot)} × {p.plotCount} {p.plotCount===1?'plot':'plots'}.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-muted-foreground">Total Documentation Fee</p><p className="text-xl font-extrabold">{p.documentation_price>0?money(p.documentation_price):'Not set yet'}</p>{p.documentation_name&&<p className="text-xs text-muted-foreground mt-1">{p.documentation_name}</p>}</div><Button variant="outline" onClick={()=>startDocumentationPayment(p)} disabled={!p.documentation_price||p.documentation_price<=0||documentationPayingId===p.order_id}>{documentationPayingId===p.order_id?<Loader2 className="mr-2 animate-spin" size={16}/>:<CreditCard className="mr-2" size={16}/>} Pay Documentation</Button></div></div><div className="mt-5 border-t border-white/10 pt-4"><div className="flex items-center gap-2 text-sm font-medium"><Clock3 size={15}/> Payment Timeline</div><div className="mt-3 space-y-3">{!events.length?<div className="text-xs text-muted-foreground">No approved payments recorded yet.</div>:events.map((event:any)=><div key={event.event_id} className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-3"><div className="mt-0.5"><CheckCircle2 size={15}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">{event.event_label}</p><p className="text-sm font-semibold">{money(asNumber(event.amount))}</p></div><p className="mt-1 text-xs text-muted-foreground">{new Date(event.event_at).toLocaleString('en-NG')} • {event.status}</p>{event.reference&&<p className="mt-1 truncate text-[11px] text-muted-foreground">Ref: {event.reference}</p>}{event.event_type==='land'&&<p className="mt-1 text-[11px] text-muted-foreground">Balance after payment: {money(asNumber(event.balance_after))}</p>}</div></div>)}</div><div className="mt-4 grid gap-2 text-xs text-muted-foreground"><div className="flex items-center gap-2"><CalendarDays size={14}/> Order created {p.created_at?new Date(p.created_at).toLocaleDateString('en-NG'):''}</div><div className="flex items-center gap-2"><CheckCircle2 size={14}/> {balance<=0?'Property fully paid':'Payment plan in progress'}</div></div></div></div>;})}</CardContent></Card></div>;
};

export default PropertiesTab;
