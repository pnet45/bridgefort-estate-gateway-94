import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/auth';
import { Building2, Edit2, Plus, Trash2 } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
        <div><h2 className="text-xl font-semibold">Departments</h2><p className="text-sm text-muted-foreground">Create administrator spaces and control department and mailbox assignments.</p></div>
      </div>

      <form onSubmit={save} className="rounded-lg border p-5 space-y-4 bg-card">
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label htmlFor="department-name">Department name</Label><Input id="department-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Travels, Agro, Human Resources" required /></div>
          <div><Label htmlFor="department-slug">Department slug</Label><Input id="department-slug" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="e.g. travels" required /></div>
        </div>
        <div><Label htmlFor="department-description">Description</Label><Textarea id="department-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What this department manages" /></div>
        <div className="flex items-center justify-between"><div><Label>Available for new administrators</Label><p className="text-xs text-muted-foreground">Inactive departments cannot be selected for new administrator assignments.</p></div><Switch checked={isActive} onCheckedChange={setIsActive} /></div>
        <div className="flex gap-2"><Button type="submit" disabled={saving}>{editing ? <Edit2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}{editing ? 'Update Department' : 'Create Department'}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
      </form>

      <div className="rounded-lg border overflow-hidden">
        <div className="p-4 border-b font-medium">Administrator Spaces</div>
        {loading ? <div className="p-6 text-sm text-muted-foreground">Loading departments...</div> : departments.length === 0 ? <div className="p-6 text-sm text-muted-foreground">No departments configured.</div> : (
          <div className="divide-y">{departments.map(department => (
            <div key={department.id} className="p-4 flex items-center justify-between gap-4">
              <div><div className="font-medium">{department.name}</div><div className="text-xs text-muted-foreground">{department.role_name} · {department.is_active ? 'Active' : 'Inactive'}</div>{department.description && <div className="text-sm mt-1">{department.description}</div>}</div>
              <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => startEdit(department)}><Edit2 className="h-4 w-4 mr-1" />Edit</Button><Button variant="ghost" size="sm" className="text-red-500" onClick={() => remove(department)}><Trash2 className="h-4 w-4" /></Button></div>
            </div>
          ))}</div>
        )}
      </div>

      <AdminMailboxManagement />
    </div>
  );
};

export default AdminDepartmentManagement;
