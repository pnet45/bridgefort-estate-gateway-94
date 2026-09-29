import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Activity, CalendarClock, CheckCircle2, Clock3, Mail, Phone, RefreshCw, Search, User } from 'lucide-react';
import { format } from 'date-fns';

type Lead = {
  id: string; customer_id: string | null; name: string; email: string | null; phone: string | null;
  status: string; priority: string; source: string; estate_interest: string | null; created_at: string;
};
type Journey = {
  id: string; service_type: string; status: string; priority: string; outcome: string | null;
  notes: string | null; updated_at: string;
};
type ActivityRow = {
  id: string; activity_type: string; subject: string | null; notes: string | null;
  outcome: string | null; created_at: string;
};
type FollowUp = {
  id: string; scheduled_at: string; action_type: string; notes: string | null;
  completed_at: string | null; cancelled_at: string | null;
};

const titleCase = (v: string) => v.replace(/[_-]/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase());
const terminal = new Set(['CONVERTED','LOST','CLOSED','COMPLETED','CANCELLED','DECLINED','EXPIRED']);

const AdminCustomer360: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('crm_leads')
      .select('id,customer_id,name,email,phone,status,priority,source,estate_interest,created_at')
      .order('created_at', { ascending: false });
    if (!error) setLeads((data || []) as Lead[]);
    setLoading(false);
  }, []);

  useEffect(() => { void loadLeads(); }, [loadLeads]);

  const loadCustomer = useCallback(async (lead: Lead) => {
    setSelected(lead);
    setDetailsLoading(true);
    const [j, a, f] = await Promise.all([
      supabase.from('service_journeys')
        .select('id,service_type,status,priority,outcome,notes,updated_at')
        .eq('lead_id', lead.id).order('updated_at', { ascending: false }),
      supabase.from('crm_activities')
        .select('id,activity_type,subject,notes,outcome,created_at')
        .eq('lead_id', lead.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('crm_follow_ups')
        .select('id,scheduled_at,action_type,notes,completed_at,cancelled_at')
        .eq('lead_id', lead.id).order('scheduled_at', { ascending: true }),
    ]);
    setJourneys((j.data || []) as Journey[]);
    setActivities((a.data || []) as ActivityRow[]);
    setFollowUps((f.data || []) as FollowUp[]);
    setDetailsLoading(false);
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return leads.slice(0, 15);
    return leads.filter(l => [l.name,l.email,l.phone,l.estate_interest].filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q))).slice(0, 20);
  }, [leads, searchTerm]);

  const timeline = useMemo(() => [
    ...activities.map(a => ({ id: `a-${a.id}`, date: a.created_at, title: a.subject || titleCase(a.activity_type), detail: a.notes || a.outcome || 'CRM activity' })),
    ...journeys.map(j => ({ id: `j-${j.id}`, date: j.updated_at, title: `${titleCase(j.service_type)} · ${titleCase(j.status)}`, detail: j.outcome || j.notes || `Priority: ${titleCase(j.priority)}` })),
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30), [activities, journeys]);

  const active = journeys.filter(j => !terminal.has(j.status)).length;
  const next = followUps.find(f => !f.completed_at && !f.cancelled_at);

  return <Card className="bg-slate-800 border-slate-700">
    <CardHeader className="pb-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><CardTitle className="text-white flex items-center gap-2"><User className="h-5 w-5 text-primary" />Customer 360</CardTitle>
          <p className="text-sm text-slate-400 mt-1">One view of customer leads, service journeys, activities and follow-ups.</p></div>
        <Button variant="outline" size="sm" onClick={() => void loadLeads()} disabled={loading} className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4">
        <div className="space-y-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search name, email, phone..." className="pl-9 bg-slate-900 border-slate-700 text-white" /></div>
          <div className="h-[420px] overflow-y-auto space-y-2 pr-1">
            {filtered.map(lead => <button key={lead.id} type="button" onClick={() => void loadCustomer(lead)}
              className={`w-full text-left rounded-lg border p-3 ${selected?.id === lead.id ? 'border-primary bg-primary/10' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900'}`}>
              <div className="flex items-start justify-between gap-2"><span className="font-medium text-white truncate">{lead.name}</span><Badge variant="outline" className="text-[10px]">{titleCase(lead.status)}</Badge></div>
              <p className="text-xs text-slate-400 mt-1 truncate">{lead.email || lead.phone || 'No contact details'}</p>
              {lead.estate_interest && <p className="text-xs text-slate-500 mt-1 truncate">{lead.estate_interest}</p>}
            </button>)}
            {!loading && !filtered.length && <p className="py-8 text-center text-sm text-slate-500">No matching customers found.</p>}
          </div>
        </div>

        <div className="min-w-0">
          {!selected ? <div className="min-h-[420px] rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-center p-6">
            <div><User className="h-10 w-10 mx-auto text-slate-600" /><p className="text-white font-medium mt-3">Select a customer</p><p className="text-sm text-slate-500 mt-1">Their linked service history will appear here.</p></div>
          </div> : detailsLoading ? <div className="py-12 text-center text-sm text-slate-500">Loading customer history...</div> : <div className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div><h3 className="text-xl font-semibold text-white">{selected.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
                    {selected.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{selected.email}</span>}
                    {selected.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{selected.phone}</span>}
                  </div></div>
                <div className="flex gap-2"><Badge>{titleCase(selected.status)}</Badge><Badge variant="outline">{titleCase(selected.priority)}</Badge></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                <div className="rounded-lg bg-slate-800 p-3"><p className="text-[11px] text-slate-500">Active Journeys</p><p className="text-sm text-white mt-1">{active}</p></div>
                <div className="rounded-lg bg-slate-800 p-3"><p className="text-[11px] text-slate-500">Next Follow-up</p><p className="text-sm text-white mt-1">{next ? format(new Date(next.scheduled_at), 'MMM d, h:mm a') : 'None'}</p></div>
                <div className="rounded-lg bg-slate-800 p-3"><p className="text-[11px] text-slate-500">Lead Source</p><p className="text-sm text-white mt-1">{titleCase(selected.source || 'unknown')}</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Card className="bg-slate-900/40 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-white flex items-center gap-2"><Activity className="h-4 w-4" />Service Journeys</CardTitle></CardHeader><CardContent className="space-y-2">
                {!journeys.length ? <p className="text-sm text-slate-500">No linked service journeys.</p> : journeys.map(j => <div key={j.id} className="rounded-lg bg-slate-800 p-3"><div className="flex justify-between gap-2"><span className="text-sm text-white">{titleCase(j.service_type)}</span><Badge variant="outline" className="text-[10px]">{titleCase(j.status)}</Badge></div><p className="text-xs text-slate-500 mt-1">{j.outcome || j.notes || `Priority: ${titleCase(j.priority)}`}</p></div>)}
              </CardContent></Card>
              <Card className="bg-slate-900/40 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-white flex items-center gap-2"><CalendarClock className="h-4 w-4" />Follow-ups</CardTitle></CardHeader><CardContent className="space-y-2">
                {!followUps.length ? <p className="text-sm text-slate-500">No follow-ups recorded.</p> : followUps.slice(0,8).map(f => <div key={f.id} className="rounded-lg bg-slate-800 p-3"><div className="flex justify-between gap-2"><span className="text-sm text-white">{titleCase(f.action_type)}</span>{f.completed_at ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : f.cancelled_at ? <Badge variant="outline">Cancelled</Badge> : <Clock3 className="h-4 w-4 text-amber-400" />}</div><p className="text-xs text-slate-500 mt-1">{format(new Date(f.scheduled_at), 'MMM d, yyyy h:mm a')}</p></div>)}
              </CardContent></Card>
            </div>

            <Card className="bg-slate-900/40 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-white">Unified Activity Timeline</CardTitle></CardHeader><CardContent>
              {!timeline.length ? <p className="text-sm text-slate-500">No activity recorded yet.</p> : <div className="space-y-3">{timeline.map(item => <div key={item.id} className="flex gap-3"><div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" /><div><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-white">{item.title}</span><span className="text-[11px] text-slate-500">{format(new Date(item.date), 'MMM d, yyyy h:mm a')}</span></div><p className="text-xs text-slate-400 mt-1">{item.detail}</p></div></div>)}</div>}
            </CardContent></Card>
          </div>}
        </div>
      </div>
    </CardContent>
  </Card>;
};

export default AdminCustomer360;
