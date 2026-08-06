import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Film, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import MediaUploadField from '@/components/ui/MediaUploadField';
import type { GalleryMediaItem, GalleryMediaType } from '@/types/gallery';

const emptyItem = (): Partial<GalleryMediaItem> => ({
  media_type: 'image',
  media_url: '',
  poster_url: '',
  caption: '',
  event_description: '',
  display_order: 0,
  is_published: true,
});

const AdminCircularGalleryContent: React.FC = () => {
  const [items, setItems] = useState<GalleryMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<GalleryMediaItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('gallery_media_items')
      .select('*')
      .order('display_order');
    if (error) toast({ title: 'Load failed', description: error.message, variant: 'destructive' });
    else setItems((data as GalleryMediaItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.media_url?.trim()) {
      toast({ title: 'Media file required', description: 'Upload an image or video, or paste a URL.', variant: 'destructive' });
      return;
    }
    if (editing.media_type === 'video' && !editing.poster_url?.trim()) {
      toast({ title: 'Thumbnail required', description: 'Videos need a poster/thumbnail image for the 3D gallery.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload: any = {
      media_type: editing.media_type,
      media_url: editing.media_url,
      poster_url: editing.media_type === 'video' ? editing.poster_url : editing.media_url,
      caption: editing.caption || null,
      event_description: editing.event_description || null,
      display_order: editing.display_order ?? 0,
      is_published: editing.is_published ?? true,
    };
    const op = editing.id
      ? (supabase as any).from('gallery_media_items').update(payload).eq('id', editing.id)
      : (supabase as any).from('gallery_media_items').insert({ ...payload, display_order: items.length });
    const { error } = await op;
    setSaving(false);
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing.id ? 'Updated' : 'Added to gallery' });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return;
    const { error } = await (supabase as any).from('gallery_media_items').delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted' }); load(); }
  };

  const togglePublish = async (item: GalleryMediaItem) => {
    const { error } = await (supabase as any)
      .from('gallery_media_items').update({ is_published: !item.is_published }).eq('id', item.id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else load();
  };

  /** Swap display_order with the neighboring item to move up/down. */
  const move = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const current = items[index];
    const target = items[targetIndex];
    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      (supabase as any).from('gallery_media_items').update({ display_order: target.display_order }).eq('id', current.id),
      (supabase as any).from('gallery_media_items').update({ display_order: current.display_order }).eq('id', target.id),
    ]);
    const error = err1 || err2;
    if (error) toast({ title: 'Reorder failed', description: error.message, variant: 'destructive' });
    else load();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Circular Gallery</h2>
            <p className="text-sm text-slate-400">
              Manage the images and videos shown in the 3D gallery on the Gallery page. Order here controls
              the order there.
            </p>
          </div>
          <Button onClick={() => setEditing(emptyItem())} className="gap-2">
            <Plus className="h-4 w-4" /> Add Media
          </Button>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-slate-400">No gallery items yet. Click "Add Media" to upload one.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <Card key={item.id} className="bg-slate-900 border-slate-700 overflow-hidden">
                <div className="relative h-36 bg-slate-800">
                  <img
                    src={item.poster_url || item.media_url}
                    alt={item.caption || 'Gallery item'}
                    className="h-full w-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 gap-1" variant="secondary">
                    {item.media_type === 'video' ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                    {item.media_type}
                  </Badge>
                  <Badge className={`absolute top-2 right-2 ${item.is_published ? 'bg-green-600' : ''}`} variant={item.is_published ? undefined : 'outline'}>
                    {item.is_published ? 'Live' : 'Draft'}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm truncate">{item.caption || 'Untitled'}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {item.event_description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{item.event_description}</p>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    <Button size="sm" variant="ghost" onClick={() => move(index, -1)} disabled={index === 0} title="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => move(index, 1)} disabled={index === items.length - 1} title="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(item)} title="Edit">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(item)} title={item.is_published ? 'Unpublish' : 'Publish'}>
                      {item.is_published ? 'Hide' : 'Show'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400" onClick={() => remove(item.id)} title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit' : 'Add'} Gallery Media</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Media Type</Label>
                <select
                  className="w-full mt-1 p-2 border rounded bg-background"
                  value={editing.media_type}
                  onChange={e => setEditing({ ...editing, media_type: e.target.value as GalleryMediaType })}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <MediaUploadField
                label={editing.media_type === 'video' ? 'Video file' : 'Image'}
                value={editing.media_url || ''}
                onChange={(url) => setEditing({ ...editing, media_url: url })}
                accept={editing.media_type === 'video' ? 'video/*' : 'image/*'}
                folder="gallery"
                maxSizeMB={editing.media_type === 'video' ? 100 : 10}
              />

              {editing.media_type === 'video' && (
                <MediaUploadField
                  label="Thumbnail (poster) — shown in the 3D gallery"
                  value={editing.poster_url || ''}
                  onChange={(url) => setEditing({ ...editing, poster_url: url })}
                  accept="image/*"
                  folder="gallery/posters"
                  maxSizeMB={10}
                />
              )}

              <div>
                <Label>Caption</Label>
                <Input
                  value={editing.caption || ''}
                  onChange={e => setEditing({ ...editing, caption: e.target.value })}
                  placeholder="Shown as the label inside the 3D gallery"
                />
              </div>

              <div>
                <Label>Short Event Description</Label>
                <Textarea
                  maxLength={300}
                  rows={3}
                  value={editing.event_description || ''}
                  onChange={e => setEditing({ ...editing, event_description: e.target.value })}
                  placeholder="Shown on the grid card below the 3D gallery, and in the fullscreen view"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={!!editing.is_published} onCheckedChange={v => setEditing({ ...editing, is_published: v })} />
                <Label>Published</Label>
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

export default AdminCircularGalleryContent;
