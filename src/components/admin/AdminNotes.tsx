import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { StickyNote, Plus, Pin, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string | null;
  is_pinned: boolean;
  color: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const NOTE_COLORS = [
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' }
];

const AdminNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: '#fbbf24'
  });

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes((data as Note[]) || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    try {
      if (editingNote) {
        const { error } = await supabase
          .from('admin_notes')
          .update({
            title: formData.title,
            content: formData.content || null,
            color: formData.color
          })
          .eq('id', editingNote.id);

        if (error) throw error;
        toast({ title: "Success", description: "Note updated" });
      } else {
        const { error } = await supabase
          .from('admin_notes')
          .insert({
            title: formData.title,
            content: formData.content || null,
            color: formData.color,
            created_by: user?.id
          });

        if (error) throw error;
        toast({ title: "Success", description: "Note created" });
      }

      setDialogOpen(false);
      setEditingNote(null);
      setFormData({ title: '', content: '', color: '#fbbf24' });
      fetchNotes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save note", variant: "destructive" });
    }
  };

  const togglePin = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('admin_notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', note.id);

      if (error) throw error;
      fetchNotes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update note", variant: "destructive" });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      toast({ title: "Success", description: "Note deleted" });
      fetchNotes();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete note", variant: "destructive" });
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Notes
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setEditingNote(null);
                  setFormData({ title: '', content: '', color: '#fbbf24' });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingNote ? 'Edit Note' : 'Create Note'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Note title..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your note..."
                    rows={6}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">Color</p>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          formData.color === color.value ? 'ring-2 ring-white scale-110' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingNote ? 'Update Note' : 'Create Note'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[350px]">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <StickyNote className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No notes yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg p-4 relative group"
                  style={{ backgroundColor: note.color + '20', borderLeft: `4px solid ${note.color}` }}
                >
                  {note.is_pinned && (
                    <Pin className="absolute top-2 right-2 h-4 w-4 text-white" style={{ color: note.color }} />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">{note.title}</h4>
                  </div>
                  {note.content && (
                    <p className="text-sm text-slate-300 mb-3 line-clamp-3">{note.content}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {format(new Date(note.updated_at), 'MMM d, h:mm a')}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => togglePin(note)}
                        style={{ color: note.color }}
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-white"
                        onClick={() => {
                          setEditingNote(note);
                          setFormData({
                            title: note.title,
                            content: note.content || '',
                            color: note.color
                          });
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-300"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminNotes;
