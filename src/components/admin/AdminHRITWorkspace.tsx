import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Users, ClipboardList, FileText, CalendarCheck, Plus, RefreshCw, AlertTriangle, CheckCircle2, Clock3, Search } from 'lucide-react';

const db = supabase as any;
type Staff = { id: string; user_id: string | null; employee_code: string | null; first_name: string; last_name: string; email: string | null; phone: string | null; department: string; job_title: string; role_name: string | null; reports_to: string | null; emergency_contact_name: string | null; emergency_contact_phone: string | null; emergency_contact_relationship: string | null; start_date: string | null; employment_status: string };
type Task = { id: string; title: string; description: string | null; department: string; assigned_to: string | null; priority: string; status: string; due_date: string | null; completion_notes: string | null; blocker: string | null; evidence_url: string | null; created_at: string };
type JobDescription = { id: string; title: string; department: string; role_name: string; purpose: string | null; responsibilities: string[]; monthly_deliverables: string[]; performance_measures: string[]; version: number; is_active: boolean };
type DailyReport = { id: string; staff_user_id: string; report_date: string; tasks_completed: string; challenges: string; support_required: string; next_actions: string; evidence_url: string | null; submitted_at: string };
type Section = 'staff' | 'tasks' | 'reports' | 'jobs';
const DEPARTMENTS = ['Administration', 'Human Resources', 'IT Support', 'Sales', 'Customer Service', 'Legal', 'Finance', 'Marketing', 'Operations', 'Travels', 'Agro'];
const TASK_STATUSES = [{ value: 'not_started', label: 'Not started' }, { value: 'in_progress', label: 'In progress' }, { value: 'blocked', label: 'Blocked' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }];
const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500';
const labelClass = 'mb-1 block text-xs font-semibold text-slate-700';
const today = () => new Date().toLocaleDateString('en-CA');

const AdminHRITWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>('tasks');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [search, setSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('open');
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({ user_id: '', employee_code: '', first_name: '', last_name: '', email: '', phone: '', department: 'Administration', job_title: '', role_name: '', reports_to: '', emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '', start_date: '', employment_status: 'active' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', department: 'Administration', assigned_to: '', priority: 'medium', due_date: '' });
  const [jobForm, setJobForm] = useState({ title: '', department: 'Administration', role_name: '', purpose: '', responsibilities: '', monthly_deliverables: '', performance_measures: '' });
  const [reportForm, setReportForm] = useState({ report_date: today(), tasks_completed: '', challenges: '', support_required: '', next_actions: '', evidence_url: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all([
      db.from('hr_staff_directory').select('*').order('first_name'),
      db.from('hr_tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }).limit(300),
      db.from('hr_job_descriptions').select('*').order('department').order('title'),
      db.from('hr_daily_reports').select('*').order('report_date', { ascending: false }).limit(100),
    ]);
    if (results[0].error) toast({ title: 'Staff register could not load', description: results[0].error.message, variant: 'destructive' });
    if (results[1].error) toast({ title: 'Task tracker could not load', description: results[1].error.message, variant: 'destructive' });
    if (results[2].error) toast({ title: 'Job descriptions could not load', description: results[2].error.message, variant: 'destructive' });
    if (results[3].error) toast({ title: 'Daily reports could not load', description: results[3].error.message, variant: 'destructive' });
    setStaff((results[0].data || []) as Staff[]);
    setTasks((results[1].data || []) as Task[]);
    setJobs((results[2].data || []) as JobDescription[]);
    setReports((results[3].data || []) as DailyReport[]);
    setLoading(false);
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const staffByUser = useMemo(() => new Map(staff.filter(person => person.user_id).map(person => [person.user_id as string, person])), [staff]);
  const metrics = useMemo(() => ({
    staff: staff.filter(person => person.employment_status !== 'exited').length,
    open: tasks.filter(task => !['completed', 'cancelled'].includes(task.status)).length,
    overdue: tasks.filter(task => task.due_date && task.due_date < today() && !['completed', 'cancelled'].includes(task.status)).length,
    blocked: tasks.filter(task => task.status === 'blocked').length,
    reportsToday: reports.filter(report => report.report_date === today()).length,
  }), [staff, tasks, reports]);

  const saveStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!staffForm.first_name.trim() || !staffForm.last_name.trim() || !staffForm.job_title.trim()) {
      toast({ title: 'Complete the required staff details', description: 'First name, last name and job title are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = { ...staffForm, user_id: staffForm.user_id || null, employee_code: staffForm.employee_code || null, email: staffForm.email || null, phone: staffForm.phone || null, role_name: staffForm.role_name || null, reports_to: staffForm.reports_to || null, emergency_contact_name: staffForm.emergency_contact_name || null, emergency_contact_phone: staffForm.emergency_contact_phone || null, emergency_contact_relationship: staffForm.emergency_contact_relationship || null, start_date: staffForm.start_date || null, updated_at: new Date().toISOString() };
    const result = editingStaff ? await db.from('hr_staff_directory').update(payload).eq('id', editingStaff) : await db.from('hr_staff_directory').insert(payload);
    setSaving(false);
    if (result.error) { toast({ title: 'Could not save staff record', description: result.error.message, variant: 'destructive' }); return; }
    toast({ title: editingStaff ? 'Staff record updated' : 'Staff member added' });
    setEditingStaff(null);
    setStaffForm({ user_id: '', employee_code: '', first_name: '', last_name: '', email: '', phone: '', department: 'Administration', job_title: '', role_name: '', reports_to: '', emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '', start_date: '', employment_status: 'active' });
    await loadData();
  };

  const editStaff = (person: Staff) => {
    setEditingStaff(person.id);
    setStaffForm({ user_id: person.user_id || '', employee_code: person.employee_code || '', first_name: person.first_name, last_name: person.last_name, email: person.email || '', phone: person.phone || '', department: person.department, job_title: person.job_title, role_name: person.role_name || '', reports_to: person.reports_to || '', emergency_contact_name: person.emergency_contact_name || '', emergency_contact_phone: person.emergency_contact_phone || '', emergency_contact_relationship: person.emergency_contact_relationship || '', start_date: person.start_date || '', employment_status: person.employment_status });
    setSection('staff');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskForm.title.trim()) { toast({ title: 'Task title is required', variant: 'destructive' }); return; }
    setSaving(true);
    const result = await db.from('hr_tasks').insert({ ...taskForm, assigned_to: taskForm.assigned_to || null, description: taskForm.description || null, due_date: taskForm.due_date || null, created_by: user?.id });
    setSaving(false);
    if (result.error) { toast({ title: 'Task could not be created', description: result.error.message, variant: 'destructive' }); return; }
    toast({ title: 'Task assigned' });
    setTaskForm({ title: '', description: '', department: 'Administration', assigned_to: '', priority: 'medium', due_date: '' });
    await loadData();
  };

  const updateTask = async (task: Task, patch: Record<string, unknown>) => {
    const result = await db.from('hr_tasks').update(patch).eq('id', task.id);
    if (result.error) { toast({ title: 'Task update failed', description: result.error.message, variant: 'destructive' }); return; }
    toast({ title: 'Task updated' });
    await loadData();
  };

  const saveReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    if (!reportForm.tasks_completed.trim() && !reportForm.challenges.trim() && !reportForm.next_actions.trim()) {
      toast({ title: 'Add an execution update', description: 'Enter completed work, a challenge, or a next action before submitting.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const result = await db.from('hr_daily_reports').upsert({ ...reportForm, staff_user_id: user.id, evidence_url: reportForm.evidence_url || null, updated_at: new Date().toISOString(), submitted_at: new Date().toISOString() }, { onConflict: 'staff_user_id,report_date' });
    setSaving(false);
    if (result.error) { toast({ title: 'Daily report could not be submitted', description: result.error.message, variant: 'destructive' }); return; }
    toast({ title: 'Daily report submitted' });
    setReportForm({ report_date: today(), tasks_completed: '', challenges: '', support_required: '', next_actions: '', evidence_url: '' });
    await loadData();
  };

  const saveJob = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!jobForm.title.trim() || !jobForm.role_name.trim()) { toast({ title: 'Job title and role are required', variant: 'destructive' }); return; }
    const list = (value: string) => value.split('\n').map(item => item.trim()).filter(Boolean);
    setSaving(true);
    const payload = { title: jobForm.title.trim(), department: jobForm.department, role_name: jobForm.role_name.trim(), purpose: jobForm.purpose || null, responsibilities: list(jobForm.responsibilities), monthly_deliverables: list(jobForm.monthly_deliverables), performance_measures: list(jobForm.performance_measures), updated_at: new Date().toISOString() };
    const result = editingJob ? await db.from('hr_job_descriptions').update({ ...payload, version: (jobs.find(job => job.id === editingJob)?.version || 1) + 1 }).eq('id', editingJob) : await db.from('hr_job_descriptions').insert(payload);
    setSaving(false);
    if (result.error) { toast({ title: 'Job description could not be saved', description: result.error.message, variant: 'destructive' }); return; }
    toast({ title: editingJob ? 'Job description updated' : 'Job description created' });
    setEditingJob(null);
    setJobForm({ title: '', department: 'Administration', role_name: '', purpose: '', responsibilities: '', monthly_deliverables: '', performance_measures: '' });
    await loadData();
  };

  const editJob = (job: JobDescription) => {
    setEditingJob(job.id);
    setJobForm({ title: job.title, department: job.department, role_name: job.role_name, purpose: job.purpose || '', responsibilities: (job.responsibilities || []).join('\n'), monthly_deliverables: (job.monthly_deliverables || []).join('\n'), performance_measures: (job.performance_measures || []).join('\n') });
    setSection('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !search || [task.title, task.description, task.department, staffByUser.get(task.assigned_to || '')?.first_name, staffByUser.get(task.assigned_to || '')?.last_name].some(value => (value || '').toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = taskFilter === 'all' || (taskFilter === 'open' && !['completed','cancelled'].includes(task.status)) || (taskFilter === 'overdue' && !!task.due_date && task.due_date < today() && !['completed','cancelled'].includes(task.status)) || task.status === taskFilter;
    return matchesSearch && matchesFilter;
  });

  const field = (label: string, value: string, onChange: (value: string) => void, type = 'text', required = false, placeholder = '') => <label className="block"><span className={labelClass}>{label}{required ? ' *' : ''}</span><input className={inputClass} type={type} value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} /></label>;
  const area = (label: string, value: string, onChange: (value: string) => void, placeholder: string) => <label className="block"><span className={labelClass}>{label}</span><textarea className={inputClass + ' min-h-24 resize-y'} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} rows={3} /></label>;
  const selectField = (label: string, value: string, onChange: (value: string) => void, options: { value: string; label: string }[], required = false) => <label className="block"><span className={labelClass}>{label}{required ? ' *' : ''}</span><select className={inputClass} value={value} onChange={event => onChange(event.target.value)} required={required}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">People and execution</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Administration, HR & IT</h2><p className="mt-1 max-w-2xl text-sm text-slate-600">A single source for staff structure, assigned work, daily execution and monthly deliverables.</p></div>
      <Button variant="outline" onClick={() => void loadData()} disabled={loading} className="gap-2 self-start"><RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />Refresh workspace</Button>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {[{label:'Active staff',value:metrics.staff,icon:Users},{label:'Open tasks',value:metrics.open,icon:ClipboardList},{label:'Overdue',value:metrics.overdue,icon:AlertTriangle},{label:'Blocked',value:metrics.blocked,icon:Clock3},{label:'Reports today',value:metrics.reportsToday,icon:CalendarCheck}].map(item => <Card key={item.label} className="border-slate-200 bg-white shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-2 text-slate-600"><item.icon className="h-4 w-4" /><span className="text-xs">{item.label}</span></div><p className="mt-2 text-2xl font-bold text-slate-950">{item.value}</p></CardContent></Card>)}
    </div>
    <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1.5">
      {[{id:'tasks' as Section,label:'Task tracker',icon:ClipboardList},{id:'staff' as Section,label:'Staff register',icon:Users},{id:'reports' as Section,label:'Daily reports',icon:CalendarCheck},{id:'jobs' as Section,label:'Job descriptions',icon:FileText}].map(item => <button key={item.id} type="button" onClick={() => setSection(item.id)} className={'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ' + (section === item.id ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white hover:text-slate-900')}><item.icon className="h-4 w-4" />{item.label}</button>)}
    </div>
    {section === 'staff' && <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
      <Card className="border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-slate-950">Staff register</CardTitle><p className="text-sm text-slate-600">Keep roles, reporting lines and emergency contacts current. Restrict access to authorised administrators and each staff member's own record.</p></CardHeader><CardContent className="space-y-3">
        {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading staff register…</p> : staff.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center"><Users className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-800">No staff records yet</p><p className="mt-1 text-sm text-slate-500">Add the approved staff register using the form.</p></div> : staff.map(person => <div key={person.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-slate-900">{person.first_name} {person.last_name}</p><p className="text-sm text-slate-600">{person.job_title} · {person.department}</p><p className="mt-1 text-xs text-slate-500">{person.employee_code || 'No employee code'}{person.email ? ' · ' + person.email : ''}{person.phone ? ' · ' + person.phone : ''}</p></div><Button variant="outline" size="sm" onClick={() => editStaff(person)}>Edit record</Button></div><div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2"><p><strong className="text-slate-800">Reports to:</strong> {staff.find(manager => manager.id === person.reports_to)?.first_name || 'Not assigned'}</p><p><strong className="text-slate-800">Emergency contact:</strong> {person.emergency_contact_name || 'Not recorded'}{person.emergency_contact_phone ? ' · ' + person.emergency_contact_phone : ''}</p><p><strong className="text-slate-800">System account:</strong> {person.user_id ? 'Linked' : 'Not linked'}</p><p><strong className="text-slate-800">Status:</strong> {person.employment_status}</p></div></div>)}
      </CardContent></Card>
      <Card className="h-fit border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-slate-950">{editingStaff ? 'Update staff member' : 'Add staff member'}</CardTitle></CardHeader><CardContent><form className="space-y-3" onSubmit={saveStaff}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{field('First name',staffForm.first_name,v=>setStaffForm(s=>({...s,first_name:v})),'text',true)}{field('Last name',staffForm.last_name,v=>setStaffForm(s=>({...s,last_name:v})),'text',true)}{field('Employee code',staffForm.employee_code,v=>setStaffForm(s=>({...s,employee_code:v})))}{field('Linked auth user ID',staffForm.user_id,v=>setStaffForm(s=>({...s,user_id:v})),'text',false,'Paste the existing user UUID if applicable')}{field('Email',staffForm.email,v=>setStaffForm(s=>({...s,email:v})),'email')}{field('Phone',staffForm.phone,v=>setStaffForm(s=>({...s,phone:v})))}{field('Job title',staffForm.job_title,v=>setStaffForm(s=>({...s,job_title:v})),'text',true)}{field('System role',staffForm.role_name,v=>setStaffForm(s=>({...s,role_name:v})))}
        {selectField('Department',staffForm.department,v=>setStaffForm(s=>({...s,department:v})),DEPARTMENTS.map(value=>({value,label:value})))}
        {selectField('Reports to',staffForm.reports_to,v=>setStaffForm(s=>({...s,reports_to:v})),[{value:'',label:'Not assigned'},...staff.filter(p=>p.id!==editingStaff).map(p=>({value:p.id,label:p.first_name+' '+p.last_name+' — '+p.job_title}))])}
        {field('Start date',staffForm.start_date,v=>setStaffForm(s=>({...s,start_date:v})),'date')}
        {selectField('Employment status',staffForm.employment_status,v=>setStaffForm(s=>({...s,employment_status:v})),['active','probation','leave','suspended','exited'].map(value=>({value,label:value.replace('_',' ')})))}
        {field('Emergency contact name',staffForm.emergency_contact_name,v=>setStaffForm(s=>({...s,emergency_contact_name:v})))}{field('Emergency contact phone',staffForm.emergency_contact_phone,v=>setStaffForm(s=>({...s,emergency_contact_phone:v})))}{field('Relationship',staffForm.emergency_contact_relationship,v=>setStaffForm(s=>({...s,emergency_contact_relationship:v})))}</div>
        <div className="flex flex-wrap gap-2 pt-2"><Button type="submit" disabled={saving}>{saving?'Saving…':editingStaff?'Save changes':'Add staff member'}</Button>{editingStaff&&<Button type="button" variant="outline" onClick={()=>{setEditingStaff(null);setStaffForm({user_id:'',employee_code:'',first_name:'',last_name:'',email:'',phone:'',department:'Administration',job_title:'',role_name:'',reports_to:'',emergency_contact_name:'',emergency_contact_phone:'',emergency_contact_relationship:'',start_date:'',employment_status:'active'});}}>Cancel edit</Button>}</div>
      </form></CardContent></Card>
    </div>}
    {section === 'tasks' && <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <Card className="border-slate-200 bg-white shadow-sm"><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-slate-950">Central task tracker</CardTitle><p className="mt-1 text-sm text-slate-600">Every assignment has an owner, deadline, status, blocker and evidence trail.</p></div><Badge variant="secondary">{filteredTasks.length} tasks</Badge></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_180px]"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className={inputClass+' pl-9'} value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search tasks, departments or assignees" /></div><select className={inputClass} value={taskFilter} onChange={event=>setTaskFilter(event.target.value)}><option value="open">Open tasks</option><option value="overdue">Overdue</option><option value="all">All tasks</option>{TASK_STATUSES.map(status=><option key={status.value} value={status.value}>{status.label}</option>)}</select></div></CardHeader><CardContent className="space-y-3">
        {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading tasks…</p> : filteredTasks.length===0 ? <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center"><ClipboardList className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-800">No matching tasks</p><p className="mt-1 text-sm text-slate-500">Create an assignment or change the filters.</p></div> : filteredTasks.map(task=>{const assignee=staffByUser.get(task.assigned_to||'');const overdue=!!task.due_date&&task.due_date<today()&&!['completed','cancelled'].includes(task.status);return <div key={task.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-900">{task.title}</p>{overdue&&<Badge className="border border-red-200 bg-red-50 text-red-800">Overdue</Badge>}<Badge variant="secondary">{task.priority}</Badge></div><p className="mt-1 text-sm text-slate-600">{task.department}{task.due_date?' · Due '+task.due_date:' · No deadline'}</p>{task.description&&<p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{task.description}</p>}<p className="mt-2 text-xs text-slate-500">Owner: {assignee?assignee.first_name+' '+assignee.last_name:'Unassigned'}</p>{task.blocker&&<p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">Blocker: {task.blocker}</p>}{task.evidence_url&&<a className="mt-2 inline-block text-sm font-medium text-blue-700 underline" href={task.evidence_url} target="_blank" rel="noreferrer">Open evidence</a>}</div><div className="w-full sm:w-44"><label className={labelClass}>Execution status</label><select className={inputClass} value={task.status} onChange={event=>void updateTask(task,{status:event.target.value})}>{TASK_STATUSES.map(status=><option key={status.value} value={status.value}>{status.label}</option>)}</select></div></div>{task.status!=='completed'&&<div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"><label><span className={labelClass}>Blocker / challenge</span><input className={inputClass} defaultValue={task.blocker||''} placeholder="What is preventing progress?" onBlur={event=>{if(event.target.value!==(task.blocker||''))void updateTask(task,{blocker:event.target.value||null});}} /></label><label><span className={labelClass}>Evidence URL</span><input className={inputClass} defaultValue={task.evidence_url||''} placeholder="Link to file, record or output" onBlur={event=>{if(event.target.value!==(task.evidence_url||''))void updateTask(task,{evidence_url:event.target.value||null});}} /></label></div>}{task.completion_notes&&<p className="mt-2 text-sm text-slate-600">Completion note: {task.completion_notes}</p>}</div>;})}
      </CardContent></Card>
      <Card className="h-fit border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-slate-950">Assign a task</CardTitle><p className="text-sm text-slate-600">Include a clear outcome and deadline. Staff can update execution status for their own assignments.</p></CardHeader><CardContent><form className="space-y-3" onSubmit={saveTask}>
        {field('Task title',taskForm.title,v=>setTaskForm(s=>({...s,title:v})),'text',true)}{area('Description / expected outcome',taskForm.description,v=>setTaskForm(s=>({...s,description:v})),'Describe what done looks like, required evidence and any dependencies.')}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{selectField('Department',taskForm.department,v=>setTaskForm(s=>({...s,department:v})),DEPARTMENTS.map(value=>({value,label:value})))}{selectField('Priority',taskForm.priority,v=>setTaskForm(s=>({...s,priority:v})),['low','medium','high','urgent'].map(value=>({value,label:value})))}
        {selectField('Assign to staff',taskForm.assigned_to,v=>setTaskForm(s=>({...s,assigned_to:v})),[{value:'',label:'Unassigned'},...staff.filter(person=>person.user_id&&person.employment_status!=='exited').map(person=>({value:person.user_id as string,label:person.first_name+' '+person.last_name+' — '+person.job_title}))])}
        {field('Deadline',taskForm.due_date,v=>setTaskForm(s=>({...s,due_date:v})),'date')}</div>
        <Button type="submit" disabled={saving} className="w-full gap-2"><Plus className="h-4 w-4" />{saving?'Assigning…':'Create and assign task'}</Button>
      </form></CardContent></Card>
    </div>}
    {section === 'reports' && <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr]">
      <Card className="h-fit border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-slate-950">Daily execution report</CardTitle><p className="text-sm text-slate-600">Submit completed work, challenges, support needed and next actions. One report per staff member per date; resubmission updates it.</p></CardHeader><CardContent><form className="space-y-3" onSubmit={saveReport}>
        {field('Report date',reportForm.report_date,v=>setReportForm(s=>({...s,report_date:v})),'date',true)}{area('Tasks completed and outcomes',reportForm.tasks_completed,v=>setReportForm(s=>({...s,tasks_completed:v})),'List the work completed and measurable result.')}{area('Challenges / blockers',reportForm.challenges,v=>setReportForm(s=>({...s,challenges:v})),'What was delayed or could not be completed?')}{area('Support required',reportForm.support_required,v=>setReportForm(s=>({...s,support_required:v})),'Decision, resource or assistance needed.')}{area('Next actions',reportForm.next_actions,v=>setReportForm(s=>({...s,next_actions:v})),'What will you do next and by when?')}{field('Evidence link',reportForm.evidence_url,v=>setReportForm(s=>({...s,evidence_url:v})),'url')}
        <Button type="submit" disabled={saving} className="w-full">{saving?'Submitting…':'Submit daily report'}</Button>
      </form></CardContent></Card>
      <Card className="border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-slate-950">Daily reports and challenges</CardTitle><p className="text-sm text-slate-600">Management can review submissions by staff and date. Reports are private to the author and authorised HR managers.</p></CardHeader><CardContent className="space-y-3">
        {loading?<p className="py-8 text-center text-sm text-slate-500">Loading reports…</p>:reports.length===0?<div className="rounded-xl border border-dashed border-slate-300 p-8 text-center"><CalendarCheck className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-800">No reports submitted yet</p><p className="mt-1 text-sm text-slate-500">Daily reports will appear here after submission.</p></div>:reports.map(report=>{const person=staffByUser.get(report.staff_user_id);return <article key={report.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="font-semibold text-slate-900">{person?person.first_name+' '+person.last_name:report.staff_user_id===user?.id?'My report':'Staff report'}</p><span className="text-xs text-slate-500">{report.report_date} · Submitted {new Date(report.submitted_at).toLocaleString()}</span></div>{report.tasks_completed&&<div className="mt-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Completed</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{report.tasks_completed}</p></div>}{report.challenges&&<div className="mt-3 rounded-lg bg-amber-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-amber-900">Challenges</p><p className="mt-1 whitespace-pre-wrap text-sm text-amber-950">{report.challenges}</p></div>}{report.support_required&&<p className="mt-2 text-sm text-slate-700"><strong>Support needed:</strong> {report.support_required}</p>}{report.next_actions&&<p className="mt-2 text-sm text-slate-700"><strong>Next actions:</strong> {report.next_actions}</p>}{report.evidence_url&&<a className="mt-2 inline-block text-sm text-blue-700 underline" href={report.evidence_url} target="_blank" rel="noreferrer">Open evidence</a>}</article>;})}
      </CardContent></Card>
    </div>}
    {section === 'jobs' && <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr]">
      <Card className="border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-slate-950">Job descriptions and monthly deliverables</CardTitle><p className="text-sm text-slate-600">Versioned role expectations make performance reviews and monthly reporting measurable.</p></CardHeader><CardContent className="space-y-3">
        {loading?<p className="py-8 text-center text-sm text-slate-500">Loading job descriptions…</p>:jobs.length===0?<div className="rounded-xl border border-dashed border-slate-300 p-8 text-center"><FileText className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-800">No job descriptions recorded</p><p className="mt-1 text-sm text-slate-500">Add approved roles and monthly deliverables to begin.</p></div>:jobs.map(job=><article key={job.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-900">{job.title}</p><Badge variant="secondary">v{job.version}</Badge>{!job.is_active&&<Badge>Inactive</Badge>}</div><p className="mt-1 text-sm text-slate-600">{job.department} · {job.role_name}</p>{job.purpose&&<p className="mt-2 text-sm text-slate-700">{job.purpose}</p>}</div><Button variant="outline" size="sm" onClick={()=>editJob(job)}>Edit / version</Button></div><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">{[{title:'Responsibilities',items:job.responsibilities},{title:'Monthly deliverables',items:job.monthly_deliverables},{title:'Performance measures',items:job.performance_measures}].map(group=><div key={group.title} className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-600">{group.title}</p>{group.items?.length?<ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">{group.items.map((item,index)=><li key={index}>{item}</li>)}</ul>:<p className="mt-2 text-xs text-slate-500">Not defined</p>}</div>)}</div></article>)}
      </CardContent></Card>
      <Card className="h-fit border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-slate-950">{editingJob?'Update job description':'Create job description'}</CardTitle></CardHeader><CardContent><form className="space-y-3" onSubmit={saveJob}>
        {field('Job title',jobForm.title,v=>setJobForm(s=>({...s,title:v})),'text',true)}{field('Role key / designation',jobForm.role_name,v=>setJobForm(s=>({...s,role_name:v})),'text',true)}
        {selectField('Department',jobForm.department,v=>setJobForm(s=>({...s,department:v})),DEPARTMENTS.map(value=>({value,label:value})))}{area('Role purpose',jobForm.purpose,v=>setJobForm(s=>({...s,purpose:v})),'Why this role exists and the outcome it owns.')}{area('Key responsibilities (one per line)',jobForm.responsibilities,v=>setJobForm(s=>({...s,responsibilities:v})),'Core duties, one per line.')}{area('Monthly deliverables (one per line)',jobForm.monthly_deliverables,v=>setJobForm(s=>({...s,monthly_deliverables:v})),'Measurable monthly outputs and due dates.')}{area('Performance measures (one per line)',jobForm.performance_measures,v=>setJobForm(s=>({...s,performance_measures:v})),'Quality, turnaround, accuracy or completion targets.')}
        <div className="flex flex-wrap gap-2"><Button type="submit" disabled={saving}>{saving?'Saving…':editingJob?'Save new version':'Save job description'}</Button>{editingJob&&<Button type="button" variant="outline" onClick={()=>{setEditingJob(null);setJobForm({title:'',department:'Administration',role_name:'',purpose:'',responsibilities:'',monthly_deliverables:'',performance_measures:''});}}>Cancel edit</Button>}</div>
      </form></CardContent></Card>
    </div>}
    <p className="text-xs leading-relaxed text-slate-500">Access is enforced by database row-level security. Emergency contacts are limited to authorised HR managers and the relevant staff member. Daily reports are not sent by email automatically; they are recorded here for review and follow-up.</p>
  </div>;
};

export default AdminHRITWorkspace;
