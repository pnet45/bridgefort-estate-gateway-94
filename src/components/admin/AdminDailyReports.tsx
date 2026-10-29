import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FileText, RefreshCw, Search, CalendarDays, UserRound, AlertCircle } from 'lucide-react';

type DailyReport = {
  id: string; staff_user_id: string; report_date: string; tasks_completed: string;
  challenges: string; support_required: string; next_actions: string; evidence_url: string | null;
  submitted_at: string; updated_at: string;
};
type StaffRecord = { user_id: string | null; first_name: string; last_name: string; department: string; job_title: string; email: string | null };
const db = supabase as any;

const AdminDailyReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [reportResult, staffResult] = await Promise.all([
      db.from('hr_daily_reports').select('*').order('report_date', { ascending: false }).limit(250),
      db.from('hr_staff_directory').select('user_id,first_name,last_name,department,job_title,email'),
    ]);
    if (reportResult.error) toast({ title: 'Reports could not be loaded', description: reportResult.error.message, variant: 'destructive' });
    if (staffResult.error) toast({ title: 'Staff details could not be loaded', description: staffResult.error.message, variant: 'destructive' });
    setReports((reportResult.data || []) as DailyReport[]);
    setStaff((staffResult.data || []) as StaffRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const staffFor = (id: string) => staff.find(person => person.user_id === id);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return reports.filter(report => {
      const person = staffFor(report.staff_user_id);
      const name = person ? `${person.first_name} ${person.last_name} ${person.department} ${person.job_title} ${person.email || ''}` : report.staff_user_id;
      const matchesQuery = !needle || [name, report.tasks_completed, report.challenges, report.support_required, report.next_actions].some(value => value.toLowerCase().includes(needle));
      return matchesQuery && (!fromDate || report.report_date >= fromDate) && (!toDate || report.report_date <= toDate);
    });
  }, [reports, staff, query, fromDate, toDate]);

  const share = (report: DailyReport) => {
    const person = staffFor(report.staff_user_id);
    const reportText = [
      'BRIDGEFORT HOMES DEVELOPMENT LTD',
      'ADMIN WORK UPDATE',
      `Staff: ${person ? `${person.first_name} ${person.last_name}` : 'Staff account'}`,
      person ? `Department / Role: ${person.department} / ${person.job_title}` : '',
      `Report date: ${report.report_date}`,
      `Submitted: ${new Date(report.submitted_at).toLocaleString()}`,
      '',
      'WORK COMPLETED',
      report.tasks_completed || 'Not provided',
      '',
      'CHALLENGES / BLOCKERS',
      report.challenges || 'None reported',
      '',
      'SUPPORT REQUIRED',
      report.support_required || 'None specified',
      '',
      'NEXT ACTIONS',
      report.next_actions || 'Not specified',
      report.evidence_url ? `\nEvidence: ${report.evidence_url}` : '',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`, '_blank', 'noopener,noreferrer');
  };

  const countToday = reports.filter(report => report.report_date === new Date().toISOString().slice(0, 10)).length;
  const countWithBlockers = reports.filter(report => report.challenges?.trim() || report.support_required?.trim()).length;

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">People & performance</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Admin Reports & Work Updates</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Review submitted daily reports, follow up on blockers and keep an auditable record of work progress.</p></div>
      <Button variant="outline" onClick={() => void load()} disabled={loading} className="gap-2 self-start"><RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />Refresh</Button>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Reports in view</p><p className="mt-1 text-2xl font-semibold">{filtered.length}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Submitted today</p><p className="mt-1 text-2xl font-semibold">{countToday}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Reports needing follow-up</p><p className="mt-1 text-2xl font-semibold">{countWithBlockers}</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Find a report</CardTitle><CardDescription>Search by staff member, department, work completed, challenge or next action.</CardDescription></CardHeader><CardContent><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]"><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search reports…" aria-label="Search reports"/><label className="text-xs font-medium">From date<Input className="mt-1" type="date" value={fromDate} onChange={event => setFromDate(event.target.value)}/></label><label className="text-xs font-medium">To date<Input className="mt-1" type="date" value={toDate} onChange={event => setToDate(event.target.value)}/></label></div></CardContent></Card>
    {loading ? <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin"/></div> : filtered.length === 0 ? <Card><CardContent className="py-12 text-center"><FileText className="mx-auto h-9 w-9 text-muted-foreground"/><p className="mt-3 font-semibold">No reports found</p><p className="mt-1 text-sm text-muted-foreground">Try another search or date range. Only reports your account is authorised to view will appear.</p></CardContent></Card> : <div className="space-y-3">{filtered.map(report => { const person = staffFor(report.staff_user_id); const hasFollowUp = Boolean(report.challenges?.trim() || report.support_required?.trim()); return <Card key={report.id} className="overflow-hidden"><CardHeader className="pb-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><CardTitle className="flex flex-wrap items-center gap-2 text-base"><UserRound className="h-4 w-4 text-amber-700"/>{person ? `${person.first_name} ${person.last_name}` : 'Staff report'}<Badge variant="outline">{person?.department || 'Department not linked'}</Badge>{hasFollowUp && <Badge className="border-amber-200 bg-amber-50 text-amber-900"><AlertCircle className="mr-1 h-3 w-3"/>Follow-up</Badge>}</CardTitle><CardDescription className="mt-1 flex flex-wrap items-center gap-2"><CalendarDays className="h-3.5 w-3.5"/>{report.report_date}{person?.job_title ? ` · ${person.job_title}` : ''} · Submitted {new Date(report.submitted_at).toLocaleString()}</CardDescription></div><Button variant="outline" size="sm" className="shrink-0" onClick={() => share(report)}>Share full report via WhatsApp</Button></div></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><section><h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Work completed</h3><p className="mt-1 whitespace-pre-wrap text-sm">{report.tasks_completed || 'Not provided'}</p></section><section><h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Challenges / blockers</h3><p className="mt-1 whitespace-pre-wrap text-sm">{report.challenges || 'None reported'}</p></section><section><h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Support required</h3><p className="mt-1 whitespace-pre-wrap text-sm">{report.support_required || 'None specified'}</p></section><section><h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Next actions</h3><p className="mt-1 whitespace-pre-wrap text-sm">{report.next_actions || 'Not specified'}</p></section>{report.evidence_url && <a className="text-sm font-medium text-amber-800 underline underline-offset-4" href={report.evidence_url} target="_blank" rel="noreferrer">Open submitted evidence</a>}</CardContent></Card>; })}</div>}
    <p className="text-xs leading-relaxed text-muted-foreground">Report visibility is enforced by Supabase row-level security. This screen does not grant additional access to reports.</p>
  </div>;
};

export default AdminDailyReports;
