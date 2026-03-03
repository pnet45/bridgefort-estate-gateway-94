import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, X, MessageSquare, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

const AdminTestimonialsContent = () => {
  // For now using local state - can be moved to DB later
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    { id: '1', name: 'Mr. Adekunle Johnson', role: 'Property Owner', content: 'PWAN Bridgefort made my dream of owning land a reality. Their professionalism and transparency are unmatched.', rating: 5 },
    { id: '2', name: 'Mrs. Chioma Okafor', role: 'Investor', content: 'I have invested in multiple properties with PWAN Bridgefort and the returns have been excellent. Highly recommended!', rating: 5 },
    { id: '3', name: 'Engr. Ibrahim Musa', role: 'Land Owner', content: 'The allocation process was seamless and the documentation was thorough. Great company to work with.', rating: 4 },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5 });

  const resetForm = () => {
    setForm({ name: '', role: '', content: '', rating: 5 });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSubmit = () => {
    if (!form.name || !form.content) { toast.error('Name and content are required'); return; }
    if (editingId) {
      setTestimonials(prev => prev.map(t => t.id === editingId ? { ...t, ...form } : t));
      toast.success('Testimonial updated');
    } else {
      setTestimonials(prev => [...prev, { id: Date.now().toString(), ...form }]);
      toast.success('Testimonial added');
    }
    resetForm();
  };

  const handleEdit = (t: Testimonial) => {
    setForm({ name: t.name, role: t.role, content: t.content, rating: t.rating });
    setEditingId(t.id);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    setTestimonials(prev => prev.filter(t => t.id !== id));
    toast.success('Testimonial deleted');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Client Testimonials ({testimonials.length})
        </h3>
        {!isCreating && !editingId && (
          <Button size="sm" onClick={() => setIsCreating(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <Card className="bg-slate-700/50 border-slate-600">
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between">
              <h4 className="text-white font-medium">{editingId ? 'Edit' : 'New'} Testimonial</h4>
              <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4 text-slate-400" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-slate-300">Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label className="text-slate-300">Role</Label><Input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="e.g., Property Owner" /></div>
            </div>
            <div><Label className="text-slate-300">Testimonial</Label><Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={3} /></div>
            <div className="flex items-center gap-2">
              <Label className="text-slate-300">Rating:</Label>
              {[1,2,3,4,5].map(r => (
                <button key={r} onClick={() => setForm({...form, rating: r})}>
                  <Star className={`h-5 w-5 ${r <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'}</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {testimonials.map(t => (
          <Card key={t.id} className="bg-slate-700/50 border-slate-600">
            <CardContent className="pt-4 flex justify-between items-start">
              <div>
                <p className="text-white font-medium">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
                <p className="text-sm text-slate-300 mt-1">{t.content}</p>
                <div className="flex gap-0.5 mt-1">
                  {[1,2,3,4,5].map(r => (
                    <Star key={r} className={`h-3 w-3 ${r <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(t.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonialsContent;
