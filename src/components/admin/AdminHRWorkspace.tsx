import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Users, ClipboardList } from 'lucide-react';

const db = supabase as any;
type Account = { id: string; email: string; first_name: string | null; last_name: string | null; role: string | null };
type Staff = { id: string; user_id: string | null; first_name: string; last_name: string; email: string | null; department: string; job_title: string; role_name: string | null; reports_to: string | null; employment_status: string };
type Task = { id: string; title: string; department: string; priority: string; status: string; due_date: string | null; assigned_to: string };

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900';
const labelClass = 'mb-1 block text-xs font-semibold text-slate-700';
const emptyStaff = { user_id: '', first_name: '', last_name: '', email: '', department: 'Administration', job_title: '', role_name: '', reports_to: '', employment_status: 'active' };
const emptyTask = { title: '', description: '', department: 'Administration', priority: 'normal', due_date: '', assigned_to: '' };

const AdminHRWorkspace: React.FC = () => {
  const { user, userRole } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffForm, setStaffForm] = useState({ ...emptyStaff });
  const [taskForm, setTaskForm] = useState({ ...emptyTask });
  const [savingStaff, setSavingStaff] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const managerAllowed = userRole === 'admin_acct';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesResult, usersResult, rolesResult, staffResult, tasksResult] = await Promise.all([
        db.from('profiles').select('id,first_name,last_name'),
        db.from('users').select('id,email,role'),
        db.from('admin_roles').select('user_id,role_name,expires_at'),
        db.from('hr_staff_directory').select('id,user_id,first_name,last_name,email,department,job_title,role_name,reports_to,employment_status').order('first_name'),
        db.from('hr_tasks').select('id,title,department,priority,status,due_date,assigned_to').order('created_at', { ascending: false }).limit(100),
      ]);
      const failed = [profilesResult, usersResult, rolesResult, staffResult, tasksResult].find((r: any) => r.error);
      if (failed?.error) throw failed.error;
      const now = Date.now();
      const roleRows = (rolesResult.data || []).filter((r: any) => !r.expires_at || new Date(r.expires_at).getTime() > now);
      const accountRows: Account[] = (profilesResult.data || []).map((p: any) => {
        const account = (usersResult.data || []).find((u: any) => u.id === p.id);
        const adminRole = roleRows.find((r: any) => r.user_id === p.id);
        return { id: p.id, email: account?.email || '', first_name: p.first_name, last_name: p.last_name, role: adminRole?.role_name || account?.role || null };
      }).filter((a: Account) => !!a.email);
      setAccounts(accountRows);
      setStaff((staffResult.data || []) as Staff[]);
      setTasks((tasksResult.data || []) as Task[]);
    } catch (e: any) {
      toast({ title: 'HR workspace could not load', description: e.message || 'Check your access and try again.', variant: 'destructive' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const saveStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!staffForm.first_name.trim() || !staffForm.last_name.trim() || !staffForm.department.trim() || !staffForm.job_title.trim()) {
      toast({ title: 'Complete required staff details', description: 'First name, last name, department and job title are required.', variant: 'destructive' }); return;
    }
    setSavingStaff(true);
    const account = accounts.find(a => a.id === staffForm.user_id);
    const payload = { ...staffForm, user_id: staffForm.user_id || null, email: staffForm.email.trim() || account?.email || null, reports_to: staffForm.reports_to || null, created_by: user?.id || null };
    const result = staffForm.id
      ? await db.from('hr_staff_directory').update(payload).eq('id', staffForm.id)
      : await db.from('hr_staff_directory').insert(payload);
    setSavingStaff(false);
    if (result.error) { toast({ title: 'Staff record not saved', description: result.error.message, variant: 'destructive' }); return; }
    toast({ title: 'Staff directory updated' }); setStaffForm({ ...emptyStaff }); await load();
  };

  const editStaff = (person: Staff) => setStaffForm({ user_id: person.user_id || '', first_name: person.first_name, last_name: person.last_name, email: person.email || '', department: person.department || 'Administration', job_title: person.job_title || '', role_name: person.role_name || '', reports_to: person.reports_to || '', employment_status: person.employment_status || 'active', id: person.id } as any);

  const saveTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskForm.title.trim() || !taskForm.assigned_to) {
      toast({ title: 'Task title and assignee are required', variant: 'destructive' }); return;
    }
    setSavingTask(true);
    const result = await db.from('hr_tasks').insert({ ...taskForm, due_date: taskForm.due_date || null, created_by: user?.id || null, status: 'not_started' });
    setSavingTask(false);
    if (result.error) { toast({ title: 'Task could not be assigned', description: result.error.message, variant: 'destructive' }); return; }
    toast({ title: 'Task assigned' }); setTaskForm({ ...emptyTask }); await load();
  };

  if (!managerAllowed) return <Card><CardHeader><CardTitle>Staff management restricted</CardTitle></CardHeader><CardContent>Only Global Admin and Manager Admin can manage staff records and assign work.</CardContent></Card>;
  const nameFor = (id: string | null) => { const a = accounts.find(x => x.id === id); const s = staff.find(x => x.user_id === id); return s ? `${s.first_name} ${s.last_name}` : a ? `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.email : 'Unlinked account'; };
  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Staff directory and task assignments</h2><p className="text-sm text-muted-foreground">Link existing accounts to staff records and assign work. No new login accounts are created here.</p></div><Button variant="outline" onClick={() => void load()} disabled={loading} className="gap-2"><RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}/>Refresh</Button></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Staff directory</CardTitle></CardHeader><CardContent>
      <form onSubmit={saveStaff} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label><span className={labelClass}>Link existing account</span><select className={inputClass} value={staffForm.user_id} onChange={e=>{const a=accounts.find(x=>x.id===e.target.value);setStaffForm(s=>({...s,user_id:e.target.value,email:a?.email||s.email,first_name:s.first_name||a?.first_name||'',last_name:s.last_name||a?.last_name||''}));}}><option value="">No linked account</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.email} — {a.first_name||''} {a.last_name||''} ({a.role||'no role'})</option>)}</select></label>
        <label><span className={labelClass}>First name *</span><Input required value={staffForm.first_name} onChange={e=>setStaffForm(s=>({...s,first_name:e.target.value}))}/></label>
        <label><span className={labelClass}>Last name *</span><Input required value={staffForm.last_name} onChange={e=>setStaffForm(s=>({...s,last_name:e.target.value}))}/></label>
        <label><span className={labelClass}>Email</span><Input type="email" value={staffForm.email} onChange={e=>setStaffForm(s=>({...s,email:e.target.value}))}/></label>
        <label><span className={labelClass}>Department *</span><Input required value={staffForm.department} onChange={e=>setStaffForm(s=>({...s,department:e.target.value}))}/></label>
        <label><span className={labelClass}>Job title *</span><Input required value={staffForm.job_title} onChange={e=>setStaffForm(s=>({...s,job_title:e.target.value}))}/></label>
        <label><span className={labelClass}>Role name</span><Input value={staffForm.role_name} onChange={e=>setStaffForm(s=>({...s,role_name:e.target.value}))} placeholder="e.g. admin_it, staff"/></label>
        <label><span className={labelClass}>Reports to</span><select className={inputClass} value={staffForm.reports_to} onChange={e=>setStaffForm(s=>({...s,reports_to:e.target.value}))}><option value="">Not set</option>{staff.filter(p=>p.id!==(staffForm as any).id).map(p=><option key={p.id} value={p.user_id || p.id}>{p.first_name} {p.last_name} — {p.job_title}</option>)}</select></label>
        <label><span className={labelClass}>Employment status</span><select className={inputClass} value={staffForm.employment_status} onChange={e=>setStaffForm(s=>({...s,employment_status:e.target.value}))}>{['active','on_leave','suspended','exited'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}</select></label>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3"><Button type="submit" disabled={savingStaff}>{savingStaff?'Saving…':(staffForm as any).id?'Update staff record':'Add staff record'}</Button>{(staffForm as any).id&&<Button type="button" variant="outline" onClick={()=>setStaffForm({...emptyStaff})}>Cancel edit</Button>}</div>
      </form>
      <div className="mt-5 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Staff member</th><th className="p-2">Department / title</th><th className="p-2">Account</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead><tbody>{staff.map(p=><tr key={p.id} className="border-b"><td className="p-2">{p.first_name} {p.last_name}</td><td className="p-2">{p.department}<br/><span className="text-xs text-muted-foreground">{p.job_title}</span></td><td className="p-2">{p.email || nameFor(p.user_id)}</td><td className="p-2">{p.employment_status}</td><td className="p-2"><Button size="sm" variant="outline" onClick={()=>editStaff(p)}>Edit</Button></td></tr>)}{!staff.length&&<tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No staff records found.</td></tr>}</tbody></table></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5"/>Assign a task</CardTitle></CardHeader><CardContent><form onSubmit={saveTask} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label><span className={labelClass}>Task title *</span><Input required value={taskForm.title} onChange={e=>setTaskForm(s=>({...s,title:e.target.value}))}/></label>
      <label><span className={labelClass}>Assignee account *</span><select required className={inputClass} value={taskForm.assigned_to} onChange={e=>setTaskForm(s=>({...s,assigned_to:e.target.value}))}><option value="">Choose staff/admin account</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.email} — {a.first_name||''} {a.last_name||''} ({a.role||'no role'})</option>)}</select></label>
      <label><span className={labelClass}>Department</span><Input value={taskForm.department} onChange={e=>setTaskForm(s=>({...s,department:e.target.value}))}/></label>
      <label><span className={labelClass}>Priority</span><select className={inputClass} value={taskForm.priority} onChange={e=>setTaskForm(s=>({...s,priority:e.target.value}))}>{['low','normal','high','urgent'].map(p=><option key={p} value={p}>{p}</option>)}</select></label>
      <label><span className={labelClass}>Due date</span><Input type="date" value={taskForm.due_date} onChange={e=>setTaskForm(s=>({...s,due_date:e.target.value}))}/></label>
      <label className="sm:col-span-2 lg:col-span-3"><span className={labelClass}>Description / expected outcome</span><textarea className={inputClass+' min-h-24'} value={taskForm.description} onChange={e=>setTaskForm(s=>({...s,description:e.target.value}))}/></label>
      <div className="sm:col-span-2 lg:col-span-3"><Button type="submit" disabled={savingTask}>{savingTask?'Assigning…':'Assign task'}</Button></div>
    </form></CardContent></Card>
    <Card><CardHeader><CardTitle>Recent assignments</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Task</th><th className="p-2">Assignee</th><th className="p-2">Department</th><th className="p-2">Due</th><th className="p-2">Status</th></tr></thead><tbody>{tasks.map(t=><tr key={t.id} className="border-b"><td className="p-2">{t.title}</td><td className="p-2">{nameFor(t.assigned_to)}</td><td className="p-2">{t.department}</td><td className="p-2">{t.due_date||'—'}</td><td className="p-2">{t.status}</td></tr>)}{!tasks.length&&<tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No tasks assigned yet.</td></tr>}</tbody></table></div></CardContent></Card>
  </div>;
};
export default AdminHRWorkspace;
