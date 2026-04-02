
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, Pencil, Save, X } from 'lucide-react';
import ImageUploadField from '@/components/ui/ImageUploadField';

interface HeroSlide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  display_order: number;
  is_active: boolean;
}

const AdminHeroSlidesContent = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ image_url: '', title: '', subtitle: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newSlide, setNewSlide] = useState({ image_url: '', title: '', subtitle: '' });

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data) setSlides(data);
    setLoading(false);
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleAdd = async () => {
    if (!newSlide.image_url.trim()) {
      toast({ title: 'Image URL is required', variant: 'destructive' });
      return;
    }
    const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order)) + 1 : 0;
    const { error } = await supabase.from('hero_slides').insert({
      image_url: newSlide.image_url,
      title: newSlide.title || null,
      subtitle: newSlide.subtitle || null,
      display_order: maxOrder,
    });
    if (error) {
      toast({ title: 'Error adding slide', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Slide added' });
      setNewSlide({ image_url: '', title: '', subtitle: '' });
      setShowAdd(false);
      fetchSlides();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting slide', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Slide deleted' });
      fetchSlides();
    }
  };

  const handleToggleActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from('hero_slides').update({ is_active: !is_active }).eq('id', id);
    if (!error) fetchSlides();
  };

  const startEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setEditForm({ image_url: slide.image_url, title: slide.title || '', subtitle: slide.subtitle || '' });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('hero_slides').update({
      image_url: editForm.image_url,
      title: editForm.title || null,
      subtitle: editForm.subtitle || null,
      updated_at: new Date().toISOString(),
    }).eq('id', editingId);
    if (error) {
      toast({ title: 'Error updating slide', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Slide updated' });
      setEditingId(null);
      fetchSlides();
    }
  };

  if (loading) return <div className="text-slate-400">Loading hero slides...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Hero Slideshow Slides ({slides.length})</h3>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-1" /> Add Slide
        </Button>
      </div>

      {showAdd && (
        <Card className="bg-slate-700 border-slate-600">
          <CardContent className="p-4 space-y-3">
            <ImageUploadField
              label="Image *"
              value={newSlide.image_url}
              onChange={url => setNewSlide(p => ({ ...p, image_url: url }))}
              bucket="media-files"
              folder="hero-slides"
            />
            <div>
              <Label className="text-slate-300">Title</Label>
              <Input value={newSlide.title} onChange={e => setNewSlide(p => ({ ...p, title: e.target.value }))} placeholder="Hero title text" className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Subtitle</Label>
              <Input value={newSlide.subtitle} onChange={e => setNewSlide(p => ({ ...p, subtitle: e.target.value }))} placeholder="Hero subtitle text" className="bg-slate-800 border-slate-600 text-white" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {slides.map((slide) => (
          <Card key={slide.id} className={`border-slate-600 ${slide.is_active ? 'bg-slate-700' : 'bg-slate-800 opacity-60'}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <img src={slide.image_url} alt="" className="h-14 w-24 object-cover rounded flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = '/lovable-uploads/PropertyHero.png'; }} />

              {editingId === slide.id ? (
                <div className="flex-1 space-y-2">
                  <Input value={editForm.image_url} onChange={e => setEditForm(p => ({ ...p, image_url: e.target.value }))} className="bg-slate-800 border-slate-600 text-white text-xs" placeholder="Image URL" />
                  <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} className="bg-slate-800 border-slate-600 text-white text-xs" placeholder="Title" />
                  <Input value={editForm.subtitle} onChange={e => setEditForm(p => ({ ...p, subtitle: e.target.value }))} className="bg-slate-800 border-slate-600 text-white text-xs" placeholder="Subtitle" />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleSaveEdit}><Save className="h-3 w-3 mr-1" />Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-slate-400"><X className="h-3 w-3" /></Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{slide.title || '(No title)'}</p>
                  <p className="text-xs text-slate-400 truncate">{slide.subtitle || '(No subtitle)'}</p>
                  <p className="text-xs text-slate-500 truncate">{slide.image_url}</p>
                </div>
              )}

              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch checked={slide.is_active} onCheckedChange={() => handleToggleActive(slide.id, slide.is_active)} />
                <Button size="icon" variant="ghost" onClick={() => startEdit(slide)} className="text-slate-400 hover:text-white h-8 w-8">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(slide.id)} className="text-red-400 hover:text-red-300 h-8 w-8">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminHeroSlidesContent;
