import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import ImageUploadField from '@/components/ui/ImageUploadField';

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string | null;
  capacity: string;
  category: string;
  description: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const TrainingEventsTab = () => {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    image: '',
    capacity: '',
    category: 'Training',
    description: '',
    featured: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load training events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      image: '',
      capacity: '',
      category: 'Training',
      description: '',
      featured: false,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (event: TrainingEvent) => {
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image || '',
      capacity: event.capacity,
      category: event.category,
      description: event.description || '',
      featured: event.featured,
    });
    setEditingId(event.id);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('training_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('training_events')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('training_events')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Events Management</h2>
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Event
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingId ? 'Edit Event' : 'Create New Event'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g., Saturday, 6th December 2025"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 08:00am - 05:00pm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., Limited to 50 participants"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/lovable-uploads/..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Featured Event</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update Event' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    {event.featured && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {event.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Date:</strong> {event.date}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Time:</strong> {event.time}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Capacity:</strong> {event.capacity}
                  </p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(event)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrainingEventsTab;
