import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/auth';
import { Building2, Edit2, Plus, Search, Trash2, Users, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminMailboxManagement from '@/components/admin/AdminMailboxManagement';

type Department = { id: string; name: string; slug: string; role_name: string; description: string | null; is_active: boolean };

const AdminDepartmentManagement = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadDepartments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admin_departments').select('*').order('name');
    if (error) toast({ title: 'Unable to load departments', description: error.message, variant: 'destructive' });
    else setDepartments((data || []) as Department[]);
    setLoading(false);
  };

  useEffect(() => { loadDepartments(); }, []);

  const reset = () => { setEditing(null); setName(''); setSlug(''); setDescription(''); setIsActive(true); };

  const startEdit = (department: Department) => {
    setEditing(department); setName(department.name); setSlug(department.slug);
    setDescription(department.description || ''); setIsActive(department.is_active);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || !slug.trim()) return;
    setSaving(true);
    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    const payload = {
      name: name.trim(),
      slug: normalizedSlug,
      role_name: `admin_${normalizedSlug.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`,
      description: description.trim() || null,
      is_active: isActive,
      created_by: user.id,
    };
    const result = editing
      ? await supabase.from('admin_departments').update({ name: payload.name, slug: payload.slug, description: payload.description, is_active: payload.is_active }).eq('id', editing.id)
      : await supabase.from('admin_departments').insert(payload);
    if (result.error) toast({ title: 'Department could not be saved', description: result.error.message, variant: 'destructive' });
    else { toast({ title: editing ? 'Department updated' : 'Department created' }); reset(); await loadDepartments(); }
    setSaving(false);
  };

  const remove = async (department: Department) => {
    if (!window.confirm(`Delete ${department.name}? This does not delete existing administrators.`)) return;
    const { error } = await supabase.from('admin_departments').delete().eq('id', department.id);
    if (error) toast({ title: 'Department could not be deleted', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Department deleted' }); await loadDepartments(); }
  };

  const filteredDepartments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return departments;
    return departments.filter(d => `${d.name} ${d.slug} ${d.role_name} ${d.description || ''}`.toLowerCase().includes(term));
  }, [departments, search]);

  const activeCount = departments.filter(d => d.is_active).length;
  const inactiveCount = departments.length - activeCount;

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-7">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-sm"><Building2 className="h-6 w-6" /></div>
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold tracking-tight">Departments</h2><span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium">Admin spaces</span></div><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Create administrator spaces, manage their status, and control mailbox assignments without changing existing access rules.</p></div>
          </div>
          <Button onClick={() => { reset(); document.getElementById('department-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><Plus className="mr-2 h-4 w-4" />New department</Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total departments</span><Users className="h-4 w-4 text-muted-foreground" /></div><div className="mt-2 text-2xl font-semibold">{departments.length}</div></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Active</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div><div className="mt-2 text-2xl font-semibold">{activeCount}</div></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Inactive</span><Mail className="h-4 w-4 text-muted-foreground" /></div><div className="mt-2 text-2xl font-semibold">{inactiveCount}</div></div>
      </div>

      <form id="department-form" onSubmit={save} className="scroll-mt-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3"><div><h3 className="font-semibold">{editing ? 'Edit department' : 'Create administrator space'}</h3><p className="text-sm text-muted-foreground">The role name is generated safely from the department slug.</p></div>{editing && <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>}</div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-2"><Label htmlFor="department-name">Department name</Label><Input id="department-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Travels, Agro, Human Resources" required /></div>
          <div className="space-y-2"><Label htmlFor="department-slug">Department slug</Label><Input id="department-slug" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="e.g. travels" required /><p className="text-xs text-muted-foreground">Used to create the administrator role key.</p></div>
          <div className="space-y-2"><Label>Availability</Label><div className="flex min-h-10 items-center justify-between rounded-md border px-3"><div><div className="text-sm font-medium">{isActive ? 'Active' : 'Inactive'}</div><div className="text-xs text-muted-foreground">Available for new admins</div></div><Switch checked={isActive} onCheckedChange={setIsActive} /></div></div>
        </div>
        <div className="mt-5 space-y-2"><Label htmlFor="department-description">Description</Label><Textarea id="department-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What this department manages" className="min-h-24 resize-y" /></div>
        <div className="mt-5 flex flex-wrap gap-2"><Button type="submit" disabled={saving}>{editing ? <Edit2 className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{saving ? 'Saving...' : editing ? 'Update department' : 'Create department'}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel changes</Button>}</div>
      </form>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div><h3 className="font-semibold">Administrator spaces</h3><p className="text-sm text-muted-foreground">{filteredDepartments.length} of {departments.length} departments shown</p></div>
          <div className="relative w-full md:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..." className="pl-9" /></div>
        </div>
        {loading ? <div className="p-8 text-center text-sm text-muted-foreground">Loading departments...</div> : filteredDepartments.length === 0 ? <div className="p-10 text-center"><Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" /><p className="font-medium">{search ? 'No departments match your search' : 'No departments configured'}</p><p className="mt-1 text-sm text-muted-foreground">{search ? 'Try a different search term.' : 'Create the first administrator space above.'}</p></div> : (
          <div className="divide-y">{filteredDepartments.map(department => (
            <div key={department.id} className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:justify-between md:p-5">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{department.name}</span><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${department.is_active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>{department.is_active ? 'Active' : 'Inactive'}</span></div><div className="mt-1 font-mono text-xs text-muted-foreground">{department.role_name}</div>{department.description && <div className="mt-1 max-w-2xl text-sm text-muted-foreground">{department.description}</div>}</div>
              <div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" onClick={() => startEdit(department)}><Edit2 className="mr-1.5 h-4 w-4" />Edit</Button><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(department)} aria-label={`Delete ${department.name}`}><Trash2 className="h-4 w-4" /></Button></div>
            </div>
          ))}</div>
        )}
      </section>

      <AdminMailboxManagement />
    </div>
  );
};

export default AdminDepartmentManagement;
