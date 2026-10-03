import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Download, FileText, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';
import jsPDF from 'jspdf';

type Lead = {
  id: string; name: string; email: string | null; phone: string | null; source: string; status: string; priority: string;
  assigned_to: string | null; estate_interest: string | null; estate_id: string | null; listing_id: string | null;
  conversion_value: number | null; closed_at: string | null; outcome_reason: string | null; closing_notes: string | null;
  order_id: string | null; payment_id: string | null; created_at: string;
};
type FollowUp = { id: string; lead_id: string; scheduled_at: string; completed_at: string | null; cancelled_at: string | null; action_type: string; notes: string | null; completion_notes: string | null };
type Activity = { id: string; lead_id: string; activity_type: string; description: string; created_at: string };
type Member = { id: string; first_name: string | null; last_name: string | null; email: string | null };

const UNASSIGNED = '__none';
const naira = (v: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v);
const propertyOf = (l: Lead) => l.estate_interest || 'Unspecified';
const strip = (s: string | null) => (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const AdminInquiryAnalytics: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [property, setProperty] = useState('all');
  const [agent, setAgent] = useState('all');
  const [status, setStatus] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const [l, f, a, r] = await Promise.all([
      supabase.from('crm_leads').select('id,name,email,phone,source,status,priority,assigned_to,estate_interest,estate_id,listing_id,conversion_value,closed_at,outcome_reason,closing_notes,order_id,payment_id,created_at').order('created_at', { ascending: false }),
      supabase.from('crm_follow_ups').select('id,lead_id,scheduled_at,completed_at,cancelled_at,action_type,notes,completion_notes'),
      supabase.from('crm_lead_activities').select('id,lead_id,activity_type,description,created_at').order('created_at', { ascending: true }),
      supabase.from('user_roles').select('user_id').in('role', ['admin', 'staff', 'super_admin']),
    ]);
    setLeads((l.data || []) as Lead[]);
    setFollowUps((f.data || []) as FollowUp[]);
    setActivities((a.data || []) as Activity[]);
    const ids = [...new Set([...(r.data || []).map(x => x.user_id), ...((l.data || []) as Lead[]).map(x => x.assigned_to).filter(Boolean) as string[]])];
    if (ids.length) {
      const { data } = await supabase.from('profiles').select('id,first_name,last_name,email').in('id', ids);
      setMembers((data || []) as Member[]);
    }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const agentName = useCallback((id: string | null) => {
    if (!id) return 'Unassigned';
    const m = members.find(x => x.id === id);
    return m ? ([m.first_name, m.last_name].filter(Boolean).join(' ') || m.email || 'Staff') : 'Staff';
  }, [members]);

  const properties = useMemo(() => [...new Set(leads.map(propertyOf))].sort(), [leads]);

  const filtered = useMemo(() => {
    const start = new Date(`${from}T00:00:00`).getTime();
    const end = new Date(`${to}T23:59:59`).getTime();
    return leads.filter(l => {
      const t = new Date(l.created_at).getTime();
      if (t < start || t > end) return false;
      if (property !== 'all' && propertyOf(l) !== property) return false;
      if (agent !== 'all' && (agent === UNASSIGNED ? l.assigned_to !== null : l.assigned_to !== agent)) return false;
      if (status !== 'all' && l.status !== status) return false;
      return true;
    });
  }, [leads, from, to, property, agent, status]);

  const ids = useMemo(() => new Set(filtered.map(l => l.id)), [filtered]);
  const fFollow = useMemo(() => followUps.filter(f => ids.has(f.lead_id)), [followUps, ids]);
  const fActs = useMemo(() => activities.filter(a => ids.has(a.lead_id)), [activities, ids]);

  const stats = useMemo(() => {
    const won = filtered.filter(l => l.status === 'won');
    const lost = filtered.filter(l => l.status === 'lost');
    const closed = won.length + lost.length;
    const now = Date.now();
    return {
      total: filtered.length, won: won.length, lost: lost.length,
      winRate: closed ? Math.round((won.length / closed) * 100) : 0,
      lossRate: closed ? Math.round((lost.length / closed) * 100) : 0,
      wonValue: won.reduce((s, l) => s + Number(l.conversion_value || 0), 0),
      statusChanges: fActs.filter(a => a.activity_type === 'status_change' || a.activity_type === 'conversion').length,
      fuTotal: fFollow.length,
      fuDone: fFollow.filter(f => f.completed_at).length,
      fuCancelled: fFollow.filter(f => f.cancelled_at).length,
      fuOverdue: fFollow.filter(f => !f.completed_at && !f.cancelled_at && new Date(f.scheduled_at).getTime() < now).length,
    };
  }, [filtered, fFollow, fActs]);

  const volume = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(l => { const d = format(new Date(l.created_at), 'MMM d'); map.set(d, (map.get(d) || 0) + 1); });
    return [...map.entries()].reverse().map(([date, count]) => ({ date, count }));
  }, [filtered]);

  const breakdown = useCallback((keyFn: (l: Lead) => string) => {
    const map = new Map<string, { key: string; total: number; won: number; lost: number; value: number; followUps: number }>();
    filtered.forEach(l => {
      const k = keyFn(l);
      const row = map.get(k) || { key: k, total: 0, won: 0, lost: 0, value: 0, followUps: 0 };
      row.total++;
      if (l.status === 'won') { row.won++; row.value += Number(l.conversion_value || 0); }
      if (l.status === 'lost') row.lost++;
      row.followUps += fFollow.filter(f => f.lead_id === l.id).length;
      map.set(k, row);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [filtered, fFollow]);

  const byProperty = useMemo(() => breakdown(propertyOf), [breakdown]);
  const byAgent = useMemo(() => breakdown(l => agentName(l.assigned_to)), [breakdown, agentName]);

  const historyOf = (id: string) => activities.filter(a => a.lead_id === id && (a.activity_type === 'status_change' || a.activity_type === 'conversion'))
    .map(a => `${format(new Date(a.created_at), 'yyyy-MM-dd')}: ${a.description}`).join(' | ');
  const followOf = (id: string) => followUps.filter(f => f.lead_id === id)
    .map(f => `${format(new Date(f.scheduled_at), 'yyyy-MM-dd')} ${f.action_type} [${f.completed_at ? 'done' : f.cancelled_at ? 'cancelled' : 'pending'}]${f.notes ? ` ${strip(f.notes)}` : ''}${f.completion_notes ? ` -> ${strip(f.completion_notes)}` : ''}`).join(' | ');

  const exportCSV = () => {
    const headers = ['Lead ID', 'Name', 'Email', 'Phone', 'Source', 'Property', 'Assigned Agent', 'Priority', 'Status', 'Created', 'Status History', 'Follow-ups', 'Outcome Value (NGN)', 'Closed At', 'Outcome Reason', 'Closing Notes', 'Order ID', 'Payment ID'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filtered.map(l => [l.id, l.name, l.email, l.phone, l.source, propertyOf(l), agentName(l.assigned_to), l.priority, l.status,
      format(new Date(l.created_at), 'yyyy-MM-dd HH:mm'), historyOf(l.id), followOf(l.id), l.conversion_value ?? '', l.closed_at ? format(new Date(l.closed_at), 'yyyy-MM-dd') : '',
      l.outcome_reason, strip(l.closing_notes), l.order_id, l.payment_id].map(esc).join(','));
    const blob = new Blob([[headers.map(esc).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inquiries_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 36;
    let y = M;
    const ensure = (h: number) => { if (y + h > H - M) { doc.addPage(); y = M; } };
    doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.text('PWAN Bridgefort — Inquiry Report', M, y); y += 18;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${from} to ${to}  |  Property: ${property === 'all' ? 'All' : property}  |  Agent: ${agent === 'all' ? 'All' : agent === UNASSIGNED ? 'Unassigned' : agentName(agent)}  |  Status: ${status}  |  Generated ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, M, y); y += 16;
    doc.text(`Total: ${stats.total}   Won: ${stats.won}   Lost: ${stats.lost}   Win rate: ${stats.winRate}%   Won value: NGN ${stats.wonValue.toLocaleString()}   Follow-ups: ${stats.fuTotal} (${stats.fuDone} done, ${stats.fuOverdue} overdue)`, M, y); y += 20;

    filtered.forEach(l => {
      const lines: string[] = [
        `Contact: ${l.email || '—'} / ${l.phone || '—'}   Source: ${l.source}   Property: ${propertyOf(l)}   Agent: ${agentName(l.assigned_to)}   Priority: ${l.priority}   Created: ${format(new Date(l.created_at), 'yyyy-MM-dd')}`,
      ];
      const h = historyOf(l.id); if (h) lines.push(`Status history: ${h}`);
      const f = followOf(l.id); if (f) lines.push(`Follow-ups: ${f}`);
      if (l.status === 'won' || l.status === 'lost') lines.push(`Outcome: ${l.status.toUpperCase()}${l.conversion_value ? ` NGN ${Number(l.conversion_value).toLocaleString()}` : ''}${l.closed_at ? ` on ${format(new Date(l.closed_at), 'yyyy-MM-dd')}` : ''} — ${l.outcome_reason || ''}${l.closing_notes ? ` | ${strip(l.closing_notes)}` : ''}${l.order_id ? ` | Order ${l.order_id}` : ''}${l.payment_id ? ` | Payment ${l.payment_id}` : ''}`);
      const wrapped = lines.flatMap(t => doc.splitTextToSize(t, W - M * 2 - 10) as string[]);
      ensure(16 + wrapped.length * 11 + 8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text(`${l.name}  [${l.status.toUpperCase()}]`, M, y); y += 13;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      wrapped.forEach(t => { doc.text(t, M + 10, y); y += 11; });
      doc.setDrawColor(200); doc.line(M, y, W - M, y); y += 8;
    });
    if (!filtered.length) doc.text('No inquiries match the selected filters.', M, y);
    doc.save(`inquiries_${from}_to_${to}.pdf`);
  };

  const Table = ({ title, rows }: { title: string; rows: ReturnType<typeof breakdown> }) => (
    <Card className="bg-slate-900/40 border-slate-700">
      <CardHeader className="pb-2"><CardTitle className="text-sm text-white">{title}</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-slate-500"><th className="py-1">Name</th><th>Leads</th><th>Follow-ups</th><th>Won</th><th>Lost</th><th>Win rate</th><th>Value</th></tr></thead>
          <tbody>
            {rows.map(r => { const c = r.won + r.lost; return (
              <tr key={r.key} className="border-t border-slate-800 text-slate-300">
                <td className="py-1.5 pr-2">{r.key}</td><td>{r.total}</td><td>{r.followUps}</td><td>{r.won}</td><td>{r.lost}</td>
                <td>{c ? `${Math.round((r.won / c) * 100)}%` : '—'}</td><td>{naira(r.value)}</td>
              </tr>); })}
            {!rows.length && <tr><td colSpan={7} className="py-4 text-center text-slate-500">No data</td></tr>}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-white flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Inquiry Analytics</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2"><Download className="h-4 w-4" />CSV</Button>
            <Button size="sm" onClick={exportPDF} className="gap-2"><FileText className="h-4 w-4" />PDF</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1"><Label className="text-slate-400 text-xs">From</Label><Input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-slate-400 text-xs">To</Label><Input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-slate-400 text-xs">Property</Label>
            <Select value={property} onValueChange={setProperty}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="all">All properties</SelectItem>{properties.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-slate-400 text-xs">Agent</Label>
            <Select value={agent} onValueChange={setAgent}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="all">All agents</SelectItem><SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
              {members.map(m => <SelectItem key={m.id} value={m.id}>{agentName(m.id)}</SelectItem>)}
            </SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-slate-400 text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent></Select></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {[
            ['Inquiries', stats.total], ['Status changes', stats.statusChanges], ['Follow-ups', stats.fuTotal], ['Completed', stats.fuDone],
            ['Overdue', stats.fuOverdue], ['Win rate', `${stats.winRate}%`], ['Loss rate', `${stats.lossRate}%`], ['Won value', naira(stats.wonValue)],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <p className="text-xs text-slate-400">{k}</p><p className="text-lg font-bold text-white truncate">{v}</p>
            </div>
          ))}
        </div>

        <Card className="bg-slate-900/40 border-slate-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-white">Inquiry volume</CardTitle></CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Table title="By property" rows={byProperty} />
          <Table title="By agent" rows={byAgent} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInquiryAnalytics;
