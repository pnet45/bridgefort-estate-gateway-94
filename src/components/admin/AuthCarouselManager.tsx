import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GripVertical, ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ImageUploadField from '@/components/ui/ImageUploadField';

interface Slide {
  id: string;
  image_url: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  link: string | null;
  sort_order: number;
  is_active: boolean;
}

const empty: Partial<Slide> = {
  image_url: '', eyebrow: '', title: '', subtitle: '', link: '', sort_order: 0, is_active: true,
};

// Lets an admin upload/edit/reorder/remove the slides shown in the rotating
// carousel on the login/signup page — no code changes needed to update it.
const AuthCarouselManager: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Slide> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('auth_carousel_slides')
      .select('*')
      .order('sort_order');
    if (error) toast({ title: 'Load failed', description: error.message, variant: 'destructive' });
    setSlides((data || []) as Slide[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing?.image_url || !editing?.title) {
      toast({ title: 'Image and title are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await supabase
          .from('auth_carousel_slides')
          .update({
            image_url: editing.image_url,
            eyebrow: editing.eyebrow || '',
            title: editing.title,
            subtitle: editing.subtitle || '',
            link: editing.link || null,
            sort_order: editing.sort_order ?? 0,
            is_active: editing.is_active ?? true,
          })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('auth_carousel_slides').insert({
          image_url: editing.image_url,
          eyebrow: editing.eyebrow || '',
          title: editing.title,
          subtitle: editing.subtitle || '',
          link: editing.link || null,
          sort_order: editing.sort_order ?? slides.length,
          is_active: editing.is_active ?? true,
        });
        if (error) throw error;
      }
      toast({ title: 'Slide saved' });
      setEditing(null);
      load();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this slide?')) return;
    const { error } = await supabase.from('auth_carousel_slides').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Slide deleted' });
    load();
  };

  const handleToggleActive = async (slide: Slide) => {
    await supabase.from('auth_carousel_slides').update({ is_active: !slide.is_active }).eq('id', slide.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Login Page Carousel</h3>
          <p className="text-sm text-muted-foreground">Slides shown on the auth/login page carousel, in order.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty, sort_order: slides.length })}>
          <Plus className="h-4 w-4 mr-2" /> Add Slide
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : slides.length === 0 ? (
        <p className="text-sm text-muted-foreground">No slides yet — add one to populate the login carousel.</p>
      ) : (
        <div className="space-y-3">
          {slides.map((s) => (
            <Card key={s.id} className={!s.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                {s.image_url ? (
                  <img src={s.image_url} alt={s.title} className="h-14 w-20 object-cover rounded-md shrink-0" loading="lazy" decoding="async" />
                ) : (
                  <div className="h-14 w-20 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.eyebrow}</p>
                  <p className="font-medium truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.subtitle}</p>
                </div>
                <Switch checked={s.is_active} onCheckedChange={() => handleToggleActive(s)} />
                <Button variant="ghost" size="icon" onClick={() => setEditing(s)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Slide' : 'Add Slide'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Image</Label>
                <ImageUploadField
                  value={editing.image_url || ''}
                  onChange={(url) => setEditing((e) => ({ ...e, image_url: url }))}
                />
              </div>
              <div>
                <Label>Eyebrow (small label, e.g. "Promo")</Label>
                <Input value={editing.eyebrow || ''} onChange={(e) => setEditing((v) => ({ ...v, eyebrow: e.target.value }))} />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={editing.title || ''} onChange={(e) => setEditing((v) => ({ ...v, title: e.target.value }))} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Textarea
          maxLength={300} value={editing.subtitle || ''} onChange={(e) => setEditing((v) => ({ ...v, subtitle: e.target.value }))} rows={2} />
              </div>
              <div>
                <Label>Link (optional)</Label>
                <Input value={editing.link || ''} onChange={(e) => setEditing((v) => ({ ...v, link: e.target.value }))} placeholder="/agrovest" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) => setEditing((v) => ({ ...v, sort_order: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing((s) => ({ ...s, is_active: v }))} />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthCarouselManager;
