import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import ImageUploadField from '@/components/ui/ImageUploadField';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Star, MessageSquare } from 'lucide-react';

interface TestimonialItem {
  id: string;
  title: string;
  body: string | null;
  category: string | null;
  image_url: string | null;
  display_order: number;
  is_published: boolean;
  metadata: Record<string, unknown> | null;
}

interface TestimonialForm {
  name: string;
  role: string;
  content: string;
  rating: number;
  image_url: string;
  is_published: boolean;
}

const emptyForm: TestimonialForm = {
  name: '', role: '', content: '', rating: 5, image_url: '', is_published: false,
};

const AdminTestimonialsContent: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('content_items')
      .select('id,title,body,category,image_url,display_order,is_published,metadata')
      .eq('page', 'home')
      .eq('content_type', 'page_section')
      .contains('metadata', { section_key: 'testimonial' })
      .order('display_order', { ascending: true });
    if (error) {
      toast({ title: 'Could not load testimonials', description: error.message, variant: 'destructive' });
    } else {
      setItems((data || []) as TestimonialItem[]);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (item: TestimonialItem) => {
    const metadata = item.metadata || {};
    setForm({
      name: String(metadata.name || item.title || ''),
      role: String(metadata.role || item.category || ''),
      content: item.body || '',
      rating: Math.min(5, Math.max(1, Number(metadata.rating) || 5)),
      image_url: item.image_url || '',
      is_published: item.is_published,
    });
    setEditingId(item.id);
  };

  const save = async () => {
    if (!form.name.trim() || !form.content.trim()) {
      toast({ title: 'Name and testimonial are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      page: 'home',
      content_type: 'page_section',
      title: form.name.trim(),
      body: form.content.trim(),
      category: form.role.trim() || null,
      image_url: form.image_url || null,
      display_order: editingId ? (items.find(item => item.id === editingId)?.display_order ?? items.length) : items.length,
      is_published: form.is_published,
      is_featured: false,
      metadata: {
        section_key: 'testimonial',
        name: form.name.trim(),
        role: form.role.trim(),
        rating: form.rating,
      },
      ...(!editingId ? { created_by: user?.id || null } : {}),
    };
    const operation = editingId
      ? (supabase as any).from('content_items').update(payload).eq('id', editingId)
      : (supabase as any).from('content_items').insert(payload);
    const { error } = await operation;
    setSaving(false);
    if (error) {
      toast({ title: 'Could not save testimonial', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: editingId ? 'Testimonial updated' : 'Testimonial saved' });
    reset();
    await load();
  };

  const togglePublished = async (item: TestimonialItem) => {
    const { error } = await (supabase as any).from('content_items')
      .update({ is_published: !item.is_published }).eq('id', item.id);
    if (error) toast({ title: 'Could not update status', description: error.message, variant: 'destructive' });
    else await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this testimonial permanently?')) return;
    const { error } = await (supabase as any).from('content_items').delete().eq('id', id);
    if (error) toast({ title: 'Could not delete testimonial', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Testimonial deleted' });
      if (editingId === id) reset();
      await load();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <MessageSquare className="h-5 w-5" /> Homepage Testimonials
          </h3>
          <p className="mt-1 text-sm text-slate-400">Published testimonials appear in the homepage social-proof section. New entries are drafts until published.</p>
        </div>
        {!editingId && (
          <Button size="sm" onClick={() => setForm({ ...emptyForm })}>
            <Plus className="mr-2 h-4 w-4" /> New testimonial
          </Button>
        )}
      </div>

      {(form.name || editingId || form.content || form.image_url || form.role || form.is_published) && (
        <Card className="border-slate-600 bg-slate-900">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-white">{editingId ? 'Edit testimonial' : 'New testimonial'}</h4>
              <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="text-slate-300">Client name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-slate-300">Role / relationship</Label><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Property Owner" /></div>
            </div>
            <div><Label className="text-slate-300">Testimonial *</Label><Textarea maxLength={700} rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageUploadField label="Client image (optional)" value={form.image_url} onChange={url => setForm({ ...form, image_url: url })} bucket="media-files" folder="cms/testimonials" maxSizeMB={5} />
              <div className="space-y-2">
                <Label className="text-slate-300">Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button key={rating} type="button" aria-label={`Set rating to ${rating}`} onClick={() => setForm({ ...form, rating })}>
                      <Star className={`h-6 w-6 ${rating <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={form.is_published} onCheckedChange={is_published => setForm({ ...form, is_published })} />
                  <Label className="text-slate-300">Publish on homepage</Label>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Save testimonial'}</Button>
              <Button variant="outline" onClick={reset}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <p className="text-sm text-slate-400">Loading testimonials…</p> : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-600 p-8 text-center text-sm text-slate-400">No CMS-managed testimonials yet. Add the first one to replace the homepage sample content.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map(item => {
            const metadata = item.metadata || {};
            const name = String(metadata.name || item.title);
            const role = String(metadata.role || item.category || '');
            const rating = Math.min(5, Math.max(1, Number(metadata.rating) || 5));
            return (
              <Card key={item.id} className="border-slate-600 bg-slate-900">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{name}</p>
                      <p className="text-xs text-slate-400">{role || 'Client'}</p>
                    </div>
                    <Badge variant={item.is_published ? 'default' : 'outline'}>{item.is_published ? 'Published' : 'Draft'}</Badge>
                  </div>
                  <p className="line-clamp-3 text-sm text-slate-300">{item.body}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(value => <Star key={value} className={`h-3.5 w-3.5 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(item)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => togglePublished(item)}>{item.is_published ? 'Unpublish' : 'Publish'}</Button>
                    <Button size="sm" variant="ghost" className="text-red-400" onClick={() => remove(item.id)}><Trash2 className="mr-1 h-3.5 w-3.5" /> Delete</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminTestimonialsContent;
