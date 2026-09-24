import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, ArrowRight, CalendarClock, CheckCircle2, CircleDollarSign, Clock3, Phone, RefreshCw, Target, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import AdminCRMLeads from '@/components/admin/AdminCRMLeads';

type Lead = { id: string; name: string; status: string; source: string; priority: string; conversion_value: number | null; estate_interest: string | null; assigned_to: string | null; created_at: string };
type FollowUp = { id: string; lead_id: string; scheduled_at: string; action_type: string; notes: string | null; completed_at: string | null; cancelled_at: string | null };

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const formatNaira = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
const titleCase = (value: string) => value.replace(/[_-]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

const AdminCRMWorkspace: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    const [{ data: leadRows, error: leadError }, { data: followUpRows, error: followUpError }] = await Promise.all([
      supabase.from('crm_leads').select('id,name,status,source,priority,conversion_value,estate_interest,assigned_to,created_at').order('created_at', { ascending: false }),
      supabase.from('crm_follow_ups').select('id,lead_id,scheduled_at,action_type,notes,completed_at,cancelled_at').is('completed_at', null).is('cancelled_at', null).order('scheduled_at', { ascending: true }),
    ]);
    if (!leadError) setLeads((leadRows || []) as Lead[]);
    if (!followUpError) setFollowUps((followUpRows || []) as FollowUp[]);
    setLoading(false);
  }, []);

  useEffect(() => { void loadWorkspace(); }, [loadWorkspace]);

  const metrics = useMemo(() => {
    const closed = leads.filter(lead => lead.status === 'won' || lead.status === 'lost');
    const won = leads.filter(lead => lead.status === 'won');
    const today = new Date().toDateString();
    return {
      total: leads.length,
      newLeads: leads.filter(lead => lead.status === 'new').length,
      qualified: leads.filter(lead => lead.status === 'qualified').length,
      won: won.length,
      overdue: followUps.filter(item => new Date(item.scheduled_at).getTime() < Date.now()).length,
      today: followUps.filter(item => new Date(item.scheduled_at).toDateString() === today).length,
      winRate: closed.length ? Math.round((won.length / closed.length) * 100) : 0,
      wonValue: won.reduce((sum, lead) => sum + Number(lead.conversion_value || 0), 0),
    };
  }, [leads, followUps]);

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
    <div className="space-y-5">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2"><Target className="h-5 w-5 text-primary" />CRM Workspace</CardTitle>
              <p className="text-sm text-slate-400 mt-1">One place to see the sales pipeline, follow-ups and conversion activity.</p>
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
              <div key={item.label} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <div className="flex items-center gap-2 text-slate-400"><item.icon className="h-4 w-4" /><span className="text-xs">{item.label}</span></div>
                <p className="text-lg font-bold text-white mt-1 truncate">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="xl:col-span-2 bg-slate-900/40 border-slate-700">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-white">Pipeline</CardTitle></CardHeader>
              <CardContent><div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
                {pipeline.map(item => <div key={item.status} className="rounded-md bg-slate-800 p-3"><p className="text-xs text-slate-400">{titleCase(item.status)}</p><p className="text-xl font-semibold text-white">{item.count}</p></div>)}
              </div></CardContent>
            </Card>
            <Card className="bg-slate-900/40 border-slate-700">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-white">Lead Sources</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {sourceBreakdown.length === 0 && <p className="text-sm text-slate-500">No lead data yet.</p>}
                {sourceBreakdown.map(([source, count]) => <div key={source} className="flex items-center justify-between text-sm"><span className="text-slate-300">{titleCase(source)}</span><Badge variant="secondary">{count}</Badge></div>)}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900/40 border-slate-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-white flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-400" />Follow-ups requiring attention</CardTitle>
                <span className="text-xs text-slate-500">Overdue + due today</span>
              </div>
            </CardHeader>
            <CardContent>
              {attention.length === 0 ? <div className="py-5 text-center text-sm text-slate-500">No overdue or due-today follow-ups.</div> : (
                <div className="divide-y divide-slate-800">
                  {attention.map(({ followUp, lead }) => {
                    const overdue = new Date(followUp.scheduled_at).getTime() < Date.now();
                    return <div key={followUp.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2"><span className="font-medium text-white truncate">{lead?.name}</span><Badge className={overdue ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}>{overdue ? 'Overdue' : 'Today'}</Badge></div>
                        <p className="text-xs text-slate-400 mt-1">{titleCase(followUp.action_type)} · {format(new Date(followUp.scheduled_at), 'MMM d, h:mm a')}{lead?.estate_interest ? ` · ${lead.estate_interest}` : ''}</p>
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
      <AdminCRMLeads />
    </div>
  );
};

export default AdminCRMWorkspace;
