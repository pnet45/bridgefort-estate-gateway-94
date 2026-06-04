import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ImageUploadField from '@/components/ui/ImageUploadField';
import {
  ContentItem, ContentPage, ContentType,
  CONTENT_TYPE_LABELS, PAGE_TO_TYPES,
} from '@/types/content';

const PAGES: { value: ContentPage; label: string }[] = [
  { value: 'blog', label: 'Blog' },
  { value: 'training', label: 'Training' },
  { value: 'services', label: 'Services' },
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'generic', label: 'Generic' },
];

const empty = (page: ContentPage): Partial<ContentItem> => ({
  page,
  content_type: PAGE_TO_TYPES[page][0],
  title: '',
  slug: '',
  subtitle: '',
  excerpt: '',
  body: '',
  image_url: '',
  category: '',
  link_url: '',
  cta_label: '',
  display_order: 0,
  is_published: true,
  is_featured: false,
  event_date: null,
  event_location: '',
});

const AdminContentHub: React.FC = () => {
  const [activePage, setActivePage] = useState<ContentPage>('blog');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ContentItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('content_items').select('*').eq('page', activePage)
      .order('content_type').order('display_order').order('created_at', { ascending: false });
    if (error) toast({ title: 'Load failed', description: error.message, variant: 'destructive' });
    else setItems((data as ContentItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [activePage]);

  const grouped = useMemo(() => {
    const m: Record<string, ContentItem[]> = {};
    items.forEach(it => { (m[it.content_type] ||= []).push(it); });
    return m;
  }, [items]);

  const save = async () => {
    if (!editing?.title?.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    const payload: any = { ...editing };
    if (!payload.event_date) delete payload.event_date;
    const op = editing.id
      ? (supabase as any).from('content_items').update(payload).eq('id', editing.id)
      : (supabase as any).from('content_items').insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing.id ? 'Updated' : 'Created' });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    const { error } = await (supabase as any).from('content_items').delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted' }); load(); }
  };

  const togglePublish = async (item: ContentItem) => {
    const { error } = await (supabase as any).from('content_items')
      .update({ is_published: !item.is_published }).eq('id', item.id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else load();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Content Hub (CMS)</h2>
            <p className="text-sm text-slate-400">Manage every article, post and section across Blog, Training, Services and Home — synced to web & mobile.</p>
          </div>
          <Button onClick={() => setEditing(empty(activePage))} className="gap-2"><Plus className="h-4 w-4" /> New Item</Button>
        </div>

        <Tabs value={activePage} onValueChange={(v) => setActivePage(v as ContentPage)}>
          <TabsList className="bg-slate-900 flex-wrap h-auto">
            {PAGES.map(p => (
              <TabsTrigger key={p.value} value={p.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {PAGES.map(p => (
            <TabsContent key={p.value} value={p.value} className="mt-4 space-y-6">
              {loading ? (
                <p className="text-slate-400">Loading…</p>
              ) : items.length === 0 ? (
                <p className="text-slate-400">No items yet. Click "New Item" to add one.</p>
              ) : (
                PAGE_TO_TYPES[p.value].map(type => {
                  const list = grouped[type] || [];
                  if (list.length === 0) return null;
                  return (
                    <div key={type}>
                      <h3 className="text-white font-medium mb-2">{CONTENT_TYPE_LABELS[type]} <span className="text-slate-500 text-xs">({list.length})</span></h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {list.map(item => (
                          <Card key={item.id} className="bg-slate-900 border-slate-700">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-white text-sm flex items-start justify-between gap-2">
                                <span className="truncate">{item.title}</span>
                                <div className="flex gap-1 shrink-0">
                                  {item.is_featured && <Badge variant="secondary"><Star className="h-3 w-3" /></Badge>}
                                  {item.is_published ? <Badge className="bg-green-600">Live</Badge> : <Badge variant="outline">Draft</Badge>}
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {item.excerpt && <p className="text-xs text-slate-400 line-clamp-2 mb-2">{item.excerpt}</p>}
                              <div className="flex gap-1 flex-wrap">
                                <Button size="sm" variant="ghost" onClick={() => setEditing(item)}><Edit className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => togglePublish(item)}>
                                  {item.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-400" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit' : 'Create'} Content</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <select className="w-full mt-1 p-2 border rounded bg-background"
                    value={editing.content_type}
                    onChange={e => setEditing({ ...editing, content_type: e.target.value as ContentType })}>
                    {PAGE_TO_TYPES[editing.page as ContentPage].map(t => (
                      <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Page</Label>
                  <select className="w-full mt-1 p-2 border rounded bg-background"
                    value={editing.page}
                    onChange={e => setEditing({ ...editing, page: e.target.value as ContentPage })}>
                    {PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>Title *</Label><Input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Slug</Label><Input value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} placeholder="auto-from-title" /></div>
                <div><Label>Category</Label><Input value={editing.category || ''} onChange={e => setEditing({ ...editing, category: e.target.value })} /></div>
              </div>
              <div><Label>Subtitle</Label><Input value={editing.subtitle || ''} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <div><Label>Excerpt</Label><Textarea rows={2} value={editing.excerpt || ''} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} /></div>
              <div><Label>Body / Content</Label><Textarea rows={8} value={editing.body || ''} onChange={e => setEditing({ ...editing, body: e.target.value })} /></div>
              <div className="grid grid-cols-1 gap-3">
                <ImageUploadField
                  label="Image / Thumbnail"
                  value={editing.image_url || ''}
                  onChange={(url) => setEditing({ ...editing, image_url: url })}
                  bucket="media-files"
                  folder={`cms/${editing.page}`}
                  maxSizeMB={5}
                />
                <div><Label>Link URL</Label><Input value={editing.link_url || ''} onChange={e => setEditing({ ...editing, link_url: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>CTA Label</Label><Input value={editing.cta_label || ''} onChange={e => setEditing({ ...editing, cta_label: e.target.value })} /></div>
                <div><Label>Order</Label><Input type="number" value={editing.display_order ?? 0} onChange={e => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Event Date</Label><Input type="datetime-local" value={editing.event_date ? editing.event_date.slice(0,16) : ''} onChange={e => setEditing({ ...editing, event_date: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
              </div>
              <div><Label>Event Location</Label><Input value={editing.event_location || ''} onChange={e => setEditing({ ...editing, event_location: e.target.value })} /></div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><Switch checked={!!editing.is_published} onCheckedChange={v => setEditing({ ...editing, is_published: v })} /><Label>Published</Label></div>
                <div className="flex items-center gap-2"><Switch checked={!!editing.is_featured} onCheckedChange={v => setEditing({ ...editing, is_featured: v })} /><Label>Featured</Label></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContentHub;
