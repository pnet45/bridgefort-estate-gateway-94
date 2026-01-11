import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Megaphone, Plus, Trash2, Edit, AlertTriangle, Info, AlertCircle, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

const AdminNotices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as Notice['priority'],
    is_active: true,
    expires_at: ''
  });

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices((data as Notice[]) || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
      return;
    }

    try {
      if (editingNotice) {
        const { error } = await supabase
          .from('admin_notices')
          .update({
            title: formData.title,
            content: formData.content,
            priority: formData.priority,
            is_active: formData.is_active,
            expires_at: formData.expires_at || null
          })
          .eq('id', editingNotice.id);

        if (error) throw error;
        toast({ title: "Success", description: "Notice updated" });
      } else {
        const { error } = await supabase
          .from('admin_notices')
          .insert({
            title: formData.title,
            content: formData.content,
            priority: formData.priority,
            is_active: formData.is_active,
            expires_at: formData.expires_at || null,
            created_by: user?.id
          });

        if (error) throw error;
        toast({ title: "Success", description: "Notice created" });
      }

      setDialogOpen(false);
      setEditingNotice(null);
      setFormData({ title: '', content: '', priority: 'normal', is_active: true, expires_at: '' });
      fetchNotices();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save notice", variant: "destructive" });
    }
  };

  const toggleActive = async (notice: Notice) => {
    try {
      const { error } = await supabase
        .from('admin_notices')
        .update({ is_active: !notice.is_active })
        .eq('id', notice.id);

      if (error) throw error;
      fetchNotices();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update notice", variant: "destructive" });
    }
  };

  const deleteNotice = async (noticeId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notices')
        .delete()
        .eq('id', noticeId);

      if (error) throw error;
      toast({ title: "Success", description: "Notice deleted" });
      fetchNotices();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete notice", variant: "destructive" });
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-400" />;
      case 'normal': return <Bell className="h-4 w-4 text-blue-400" />;
      default: return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Notices & Announcements
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setEditingNotice(null);
                  setFormData({ title: '', content: '', priority: 'normal', is_active: true, expires_at: '' });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingNotice ? 'Edit Notice' : 'Create Notice'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-400">Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: Notice['priority']) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="low" className="text-white">Low</SelectItem>
                        <SelectItem value="normal" className="text-white">Normal</SelectItem>
                        <SelectItem value="high" className="text-white">High</SelectItem>
                        <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400">Expires At</Label>
                    <Input
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-slate-400">Active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : notices.length === 0 ? (
            <div className="p-8 text-center">
              <Megaphone className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No notices yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`p-4 ${!notice.is_active ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getPriorityIcon(notice.priority)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{notice.title}</span>
                          <Badge className={getPriorityColor(notice.priority)}>{notice.priority}</Badge>
                          {!notice.is_active && (
                            <Badge variant="secondary" className="bg-slate-600 text-slate-300">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{notice.content}</p>
                        <div className="text-xs text-slate-500">
                          Posted {format(new Date(notice.created_at), 'MMM d, yyyy')}
                          {notice.expires_at && (
                            <span> • Expires {format(new Date(notice.expires_at), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={notice.is_active}
                        onCheckedChange={() => toggleActive(notice)}
                        className="scale-75"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        onClick={() => {
                          setEditingNotice(notice);
                          setFormData({
                            title: notice.title,
                            content: notice.content,
                            priority: notice.priority,
                            is_active: notice.is_active,
                            expires_at: notice.expires_at || ''
                          });
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => deleteNotice(notice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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

export default AdminNotices;
