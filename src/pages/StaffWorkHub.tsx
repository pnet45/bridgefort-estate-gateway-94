import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { CalendarCheck, ClipboardList, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';

const db = supabase as any;
type AssignedTask = { id: string; title: string; description: string | null; department: string; priority: string; status: string; due_date: string | null; blocker: string | null; evidence_url: string | null; completion_notes: string | null };
type Report = { id: string; report_date: string; tasks_completed: string; challenges: string; support_required: string; next_actions: string; evidence_url: string | null; submitted_at: string };
const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500';
const labelClass = 'mb-1 block text-xs font-semibold text-slate-700';
const today = () => { const date = new Date(); return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); };

const StaffWorkHub: React.FC = () => {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reportForm, setReportForm] = useState({ report_date: today(), tasks_completed: '', challenges: '', support_required: '', next_actions: '', evidence_url: '' });

  const load = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    const [taskResult, reportResult] = await Promise.all([
      db.from('hr_tasks').select('id,title,description,department,priority,status,due_date,blocker,evidence_url,completion_notes').eq('assigned_to', user.id).order('due_date', { ascending: true, nullsFirst: false }),
      db.from('hr_daily_reports').select('*').eq('staff_user_id', user.id).order('report_date', { ascending: false }).limit(30),
    ]);
    if (taskResult.error) toast({ title: 'Assigned tasks could not load', description: taskResult.error.message, variant: 'destructive' });
    if (reportResult.error) toast({ title: 'Your reports could not load', description: reportResult.error.message, variant: 'destructive' });
    setTasks((taskResult.data || []) as AssignedTask[]);
    setReports((reportResult.data || []) as Report[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { void load(); }, [load]);

  const updateTask = async (task: AssignedTask, patch: Record<string, unknown>) => {
    const result = await db.from('hr_tasks').update(patch).eq('id', task.id);
    if (result.error) { toast({ title: 'Task update failed', description: result.error.message, variant: 'destructive' }); return; }
    toast({ title: 'Task updated' });
    await load();
  };

  const submitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    if (!reportForm.tasks_completed.trim() && !reportForm.challenges.trim() && !reportForm.next_actions.trim()) {
      toast({ title: 'Add an execution update', description: 'Record completed work, a challenge or your next action.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const result = await db.from('hr_daily_reports').upsert({ ...reportForm, staff_user_id: user.id, evidence_url: reportForm.evidence_url || null, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'staff_user_id,report_date' });
    setSaving(false);
    if (result.error) { toast({ title: 'Report could not be submitted', description: result.error.message, variant: 'destructive' }); return; }
    toast({ title: 'Daily report submitted' });
    setReportForm({ report_date: today(), tasks_completed: '', challenges: '', support_required: '', next_actions: '', evidence_url: '' });
    await load();
  };

  const field = (label: string, value: string, onChange: (value: string) => void, type = 'text') => <label className="block"><span className={labelClass}>{label}</span><input className={inputClass} type={type} value={value} onChange={event => onChange(event.target.value)} /></label>;
  const area = (label: string, value: string, onChange: (value: string) => void, placeholder: string) => <label className="block"><span className={labelClass}>{label}</span><textarea className={inputClass + ' min-h-24 resize-y'} rows={3} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>;

  return <main className="min-h-screen bg-slate-50 px-3 py-6 text-slate-900 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Link to="/dashboard" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Staff self-service</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">My tasks and daily report</h1><p className="mt-1 text-sm text-slate-600">Welcome{profile?.first_name ? ', ' + profile.first_name : ''}. Track your assigned work and keep management informed of progress and blockers.</p></div><Button variant="outline" onClick={() => void load()} disabled={loading} className="gap-2 self-start"><RefreshCw className={loading?'h-4 w-4 animate-spin':'h-4 w-4'} />Refresh</Button></div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-slate-950"><ClipboardList className="h-5 w-5" />My assigned tasks</CardTitle><p className="text-sm text-slate-600">Update execution status, blockers and evidence. Task ownership and deadlines are managed by your supervisor.</p></CardHeader><CardContent className="space-y-3">
          {loading?<p className="py-8 text-center text-sm text-slate-500">Loading assigned tasks…</p>:tasks.length===0?<div className="rounded-xl border border-dashed border-slate-300 p-8 text-center"><ClipboardList className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold">No tasks assigned to your account</p><p className="mt-1 text-sm text-slate-500">Ask your supervisor to link your staff record and assign work to your signed-in account.</p></div>:tasks.map(task=>{const overdue=task.due_date&&task.due_date<today()&&!['completed','cancelled'].includes(task.status);return <article key={task.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{task.title}</h3>{overdue&&<Badge className="border border-red-200 bg-red-50 text-red-800">Overdue</Badge>}<Badge variant="secondary">{task.priority}</Badge></div><p className="mt-1 text-xs text-slate-600">{task.department}{task.due_date?' · Due '+task.due_date:' · No deadline'}</p>{task.description&&<p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{task.description}</p>}</div><div className="w-full sm:w-40"><label className={labelClass}>Status</label><select className={inputClass} value={task.status} onChange={event=>void updateTask(task,{status:event.target.value})}>{[{value:'not_started',label:'Not started'},{value:'in_progress',label:'In progress'},{value:'blocked',label:'Blocked'},{value:'completed',label:'Completed'},{value:'cancelled',label:'Cancelled'}].map(status=><option key={status.value} value={status.value}>{status.label}</option>)}</select></div></div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"><label><span className={labelClass}>Blocker / challenge</span><input className={inputClass} defaultValue={task.blocker||''} placeholder="What is blocking progress?" onBlur={event=>{if(event.target.value!==(task.blocker||''))void updateTask(task,{blocker:event.target.value||null});}} /></label><label><span className={labelClass}>Evidence link</span><input className={inputClass} defaultValue={task.evidence_url||''} placeholder="Link to completed output" onBlur={event=>{if(event.target.value!==(task.evidence_url||''))void updateTask(task,{evidence_url:event.target.value||null});}} /></label><label className="sm:col-span-2"><span className={labelClass}>Completion note / outcome</span><input className={inputClass} defaultValue={task.completion_notes||''} placeholder="What was delivered or remains outstanding?" onBlur={event=>{if(event.target.value!==(task.completion_notes||''))void updateTask(task,{completion_notes:event.target.value||null});}} /></label></div>
          </article>;})}
        </CardContent></Card>
        <Card className="h-fit border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-slate-950"><CalendarCheck className="h-5 w-5" />Submit daily report</CardTitle><p className="text-sm text-slate-600">Record completed work, challenges, support required and next actions. Resubmitting a date updates that day's report.</p></CardHeader><CardContent><form className="space-y-3" onSubmit={submitReport}>
          {field('Report date',reportForm.report_date,value=>setReportForm(s=>({...s,report_date:value})),'date')}{area('Tasks completed and outcomes',reportForm.tasks_completed,value=>setReportForm(s=>({...s,tasks_completed:value})),'What did you complete today, and what was the result?')}{area('Challenges / blockers',reportForm.challenges,value=>setReportForm(s=>({...s,challenges:value})),'What could not be completed and why?')}{area('Support required',reportForm.support_required,value=>setReportForm(s=>({...s,support_required:value})),'What decision, access or support do you need?')}{area('Next actions',reportForm.next_actions,value=>setReportForm(s=>({...s,next_actions:value})),'What are your next steps?')}{field('Evidence URL',reportForm.evidence_url,value=>setReportForm(s=>({...s,evidence_url:value})),'url')}<Button type="submit" disabled={saving} className="w-full">{saving?'Submitting…':'Submit daily report'}</Button>
        </form></CardContent></Card>
      </div>
      <Card className="border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-slate-950">My recent reports</CardTitle><p className="text-sm text-slate-600">Your own submissions only. Management can review these through the authorised CRM workspace.</p></CardHeader><CardContent className="space-y-3">
        {reports.length===0?<p className="py-5 text-center text-sm text-slate-500">No reports submitted yet.</p>:reports.map(report=><article key={report.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{report.report_date}</p><span className="text-xs text-slate-500">{new Date(report.submitted_at).toLocaleString()}</span></div>{report.tasks_completed&&<p className="mt-2 whitespace-pre-wrap text-sm"><strong>Completed:</strong> {report.tasks_completed}</p>}{report.challenges&&<p className="mt-2 whitespace-pre-wrap text-sm text-amber-900"><strong>Challenges:</strong> {report.challenges}</p>}{report.support_required&&<p className="mt-2 whitespace-pre-wrap text-sm"><strong>Support required:</strong> {report.support_required}</p>}{report.next_actions&&<p className="mt-2 whitespace-pre-wrap text-sm"><strong>Next actions:</strong> {report.next_actions}</p>}</article>)}
      </CardContent></Card>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />You can only see tasks assigned to your signed-in account and reports you submitted. If your task list is empty, ask an authorised administrator to link your staff register record to your existing account.</p>
    </div>
  </main>;
};

export default StaffWorkHub;
