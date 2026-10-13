import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, ArrowRight, CalendarClock, CheckCircle2, CircleDollarSign, Clock3, Phone, RefreshCw, Target, TrendingUp, Users, BriefcaseBusiness, PanelLeftClose, PanelLeftOpen, ListChecks, BrainCircuit, BarChart3, UserRoundSearch } from 'lucide-react';
import { format } from 'date-fns';
import AdminCRMLeads from '@/components/admin/AdminCRMLeads';
import AdminCustomer360 from '@/components/admin/AdminCustomer360';
import AdminLeadAIAssistant from '@/components/admin/AdminLeadAIAssistant';
import AdminInquiryAnalytics from '@/components/admin/AdminInquiryAnalytics';

type Lead = { id: string; name: string; phone: string | null; status: string; source: string; priority: string; conversion_value: number | null; estate_interest: string | null; assigned_to: string | null; created_at: string };
type FollowUp = { id: string; lead_id: string; scheduled_at: string; action_type: string; notes: string | null; completed_at: string | null; cancelled_at: string | null };
type Journey = { id: string; service_type: string; status: string; priority: string; source: string | null; assigned_to: string | null; lead_id: string | null; customer_id: string | null; updated_at: string };

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const formatNaira = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
const titleCase = (value: string) => value.replace(/[_-]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

const AdminCRMWorkspace: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [crmNavCollapsed, setCrmNavCollapsed] = useState(false);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    const [{ data: leadRows, error: leadError }, { data: followUpRows, error: followUpError }, { data: journeyRows, error: journeyError }] = await Promise.all([
      supabase.from('crm_leads').select('id,name,phone,status,source,priority,conversion_value,estate_interest,assigned_to,created_at').order('created_at', { ascending: false }),
      supabase.from('crm_follow_ups').select('id,lead_id,scheduled_at,action_type,notes,completed_at,cancelled_at').is('completed_at', null).is('cancelled_at', null).order('scheduled_at', { ascending: true }),
      supabase.from('service_journeys').select('id,service_type,status,priority,source,assigned_to,lead_id,customer_id,updated_at').order('updated_at', { ascending: false }).limit(100),
    ]);
    if (!leadError) setLeads((leadRows || []) as Lead[]);
    if (!followUpError) setFollowUps((followUpRows || []) as FollowUp[]);
    if (!journeyError) setJourneys((journeyRows || []) as Journey[]);
    setLoading(false);
  }, []);

  useEffect(() => { void loadWorkspace(); }, [loadWorkspace]);

  const metrics = useMemo(() => {
    const closed = leads.filter(lead => lead.status === 'won' || lead.status === 'lost');
    const won = leads.filter(lead => lead.status === 'won');
    const today = new Date().toDateString();
    return {
      total: leads.length,
      journeys: journeys.length,
      newLeads: leads.filter(lead => lead.status === 'new').length,
      qualified: leads.filter(lead => lead.status === 'qualified').length,
      won: won.length,
      overdue: followUps.filter(item => new Date(item.scheduled_at).getTime() < Date.now()).length,
      today: followUps.filter(item => new Date(item.scheduled_at).toDateString() === today).length,
      winRate: closed.length ? Math.round((won.length / closed.length) * 100) : 0,
      wonValue: won.reduce((sum, lead) => sum + Number(lead.conversion_value || 0), 0),
    };
  }, [leads, followUps, journeys]);

  const pipeline = useMemo(() => STATUSES.map(status => ({ status, count: leads.filter(lead => lead.status === status).length })), [leads]);

  const sourceBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    leads.forEach(lead => counts.set(lead.source || 'other', (counts.get(lead.source || 'other') || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [leads]);

  const attention = useMemo(() => {
    const leadMap = new Map(leads.map(lead => [lead.id, lead]));
    return followUps.filter(item => new Date(item.scheduled_at).getTime() <= Date.now()).slice(0, 8)
      .map(item => ({ followUp: item, lead: leadMap.get(item.lead_id) })).filter(item => item.lead);
  }, [leads, followUps]);

  return (
    <div className={`grid grid-cols-1 gap-5 lg:items-start ${crmNavCollapsed ? "lg:grid-cols-[4.25rem_minmax(0,1fr)]" : "lg:grid-cols-[14rem_minmax(0,1fr)]"}`}>
      <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-2 mb-3"><p className={`text-xs font-bold uppercase tracking-wider text-slate-500 ${crmNavCollapsed ? "lg:hidden" : ""}`}>CRM workspace</p><Button type="button" variant="ghost" size="icon" className="hidden lg:inline-flex text-slate-600 hover:bg-slate-100" onClick={() => setCrmNavCollapsed(value => !value)} aria-label={crmNavCollapsed ? "Expand CRM submenu" : "Collapse CRM submenu"}>{crmNavCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</Button></div>
        {[{ id: "crm-overview", label: "Overview", icon: Target }, { id: "crm-pipeline", label: "Sales pipeline", icon: ListChecks }, { id: "crm-journeys", label: "Service journeys", icon: BriefcaseBusiness }, { id: "crm-followups", label: "Follow-ups", icon: CalendarClock }, { id: "crm-ai", label: "Leo AI assistant", icon: BrainCircuit }, { id: "crm-analytics", label: "Inquiry analytics", icon: BarChart3 }, { id: "crm-leads", label: "Lead management", icon: Users }, { id: "crm-customer360", label: "Customer 360", icon: UserRoundSearch }].map(item => <button key={item.id} type="button" onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })} title={crmNavCollapsed ? item.label : undefined} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1 text-left text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-900 transition-colors ${crmNavCollapsed ? "lg:justify-center lg:px-2" : ""}`}><item.icon className="h-4 w-4 shrink-0" /><span className={crmNavCollapsed ? "lg:hidden" : ""}>{item.label}</span></button>)}
      </aside>
      <div className="min-w-0 space-y-5">
      <Card id="crm-overview" className="bg-white border-slate-200 shadow-sm scroll-mt-28">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-slate-900 flex items-center gap-2"><Target className="h-5 w-5 text-primary" />CRM Workspace</CardTitle>
              <p className="text-sm text-slate-600 mt-1">One place to see the sales pipeline, follow-ups and conversion activity.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void loadWorkspace()} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            {[
              { label: 'Total Leads', value: metrics.total, icon: Users },
              { label: 'New', value: metrics.newLeads, icon: Activity },
              { label: 'Qualified', value: metrics.qualified, icon: TrendingUp },
              { label: 'Won', value: metrics.won, icon: CheckCircle2 },
              { label: 'Overdue', value: metrics.overdue, icon: AlertCircle },
              { label: 'Today', value: metrics.today, icon: CalendarClock },
              { label: 'Win Rate', value: `${metrics.winRate}%`, icon: Target },
              { label: 'Won Value', value: formatNaira(metrics.wonValue), icon: CircleDollarSign },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-slate-600"><item.icon className="h-4 w-4" /><span className="text-xs">{item.label}</span></div>
                <p className="text-lg font-bold text-slate-900 mt-1 truncate">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card id="crm-pipeline" className="xl:col-span-2 bg-white border-slate-200 shadow-sm scroll-mt-28">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-900">Pipeline</CardTitle></CardHeader>
              <CardContent><div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
                {pipeline.map(item => <div key={item.status} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-600">{titleCase(item.status)}</p><p className="text-xl font-semibold text-slate-900">{item.count}</p></div>)}
              </div></CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm scroll-mt-28">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-900">Lead Sources</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {sourceBreakdown.length === 0 && <p className="text-sm text-slate-500">No lead data yet.</p>}
                {sourceBreakdown.map(([source, count]) => <div key={source} className="flex items-center justify-between text-sm"><span className="text-slate-700">{titleCase(source)}</span><Badge variant="secondary">{count}</Badge></div>)}
              </CardContent>
            </Card>
          </div>



          <Card id="crm-journeys" className="bg-white border-slate-200 shadow-sm scroll-mt-28">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-primary" />Service Journeys</CardTitle>
                <span className="text-xs text-slate-600">{metrics.journeys} linked service records</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {Array.from(new Set(journeys.map(j => j.service_type))).slice(0,5).map(type => {
                  const count = journeys.filter(j => j.service_type === type).length;
                  const active = journeys.filter(j => j.service_type === type && !['CONVERTED','LOST','CLOSED','COMPLETED','CANCELLED','DECLINED','EXPIRED'].includes(j.status)).length;
                  return <div key={type} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-600">{titleCase(type)}</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{count}</p>
                    <p className="text-[11px] text-slate-600">{active} active</p>
                  </div>;
                })}
                {journeys.length === 0 && <p className="col-span-full py-4 text-center text-sm text-slate-500">Service journeys will appear here as customers interact with Bridgefort services.</p>}
              </div>
            </CardContent>
          </Card>

          <Card id="crm-followups" className="bg-white border-slate-200 shadow-sm scroll-mt-28">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-400" />Follow-ups requiring attention</CardTitle>
                <span className="text-xs text-slate-600">Overdue + due today</span>
              </div>
            </CardHeader>
            <CardContent>
              {attention.length === 0 ? <div className="py-5 text-center text-sm text-slate-500">No overdue or due-today follow-ups.</div> : (
                <div className="divide-y divide-slate-200">
                  {attention.map(({ followUp, lead }) => {
                    const overdue = new Date(followUp.scheduled_at).getTime() < Date.now();
                    return <div key={followUp.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2"><span className="font-medium text-slate-900 truncate">{lead?.name}</span><Badge className={overdue ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-900 border border-amber-200'}>{overdue ? 'Overdue' : 'Today'}</Badge></div>
                        <p className="text-xs text-slate-600 mt-1">{titleCase(followUp.action_type)} · {format(new Date(followUp.scheduled_at), 'MMM d, h:mm a')}{lead?.estate_interest ? ` · ${lead.estate_interest}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">{lead?.phone && <Phone className="h-3.5 w-3.5" />}<ArrowRight className="h-3.5 w-3.5" /></div>
                    </div>;
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <div id="crm-ai" className="min-w-0 scroll-mt-28"><AdminLeadAIAssistant /></div>
      <div id="crm-analytics" className="min-w-0 scroll-mt-28"><AdminInquiryAnalytics /></div>
      <div id="crm-leads" className="min-w-0 scroll-mt-28"><AdminCRMLeads /></div>
      <div id="crm-customer360" className="min-w-0 scroll-mt-28"><AdminCustomer360 /></div>
      </div>
    </div>
  );
};

export default AdminCRMWorkspace;
