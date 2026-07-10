import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import {
  Plus, Search, Phone, Mail, User, Calendar, Clock,
  MessageSquare, Trash2, Pencil, CheckCircle, Filter,
  PhoneCall, MailPlus, Users as UsersIcon, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  assigned_to: string | null;
  estate_interest: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FollowUp {
  id: string;
  lead_id: string;
  scheduled_at: string;
  completed_at: string | null;
  action_type: string;
  notes: string | null;
  created_at: string;
}

interface Activity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  qualified: 'bg-purple-500/20 text-purple-400',
  proposal: 'bg-orange-500/20 text-orange-400',
  won: 'bg-green-500/20 text-green-400',
  lost: 'bg-red-500/20 text-red-400',
};

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const SOURCES = ['website', 'referral', 'social_media', 'walk_in', 'phone', 'email', 'event', 'other'];
const ACTION_TYPES = ['call', 'email', 'meeting', 'whatsapp', 'site_visit', 'other'];

const AdminCRMLeads: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', source: 'website', status: 'new',
    estate_interest: '', notes: '',
  });

  const [followUpForm, setFollowUpForm] = useState({
    scheduled_at: '', action_type: 'call', notes: '',
  });

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const fetchLeadDetails = async (leadId: string) => {
    const [{ data: fups }, { data: acts }] = await Promise.all([
      supabase.from('crm_follow_ups').select('*').eq('lead_id', leadId).order('scheduled_at', { ascending: true }),
      supabase.from('crm_lead_activities').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
    ]);
    setFollowUps(fups || []);
    setActivities(acts || []);
  };

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    fetchLeadDetails(lead.id);
  };

  const handleSaveLead = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    if (editingLead) {
      const { error } = await supabase.from('crm_leads')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editingLead.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Lead updated' });
    } else {
      const { error } = await supabase.from('crm_leads').insert({ ...form });
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Lead created' });
    }
    setIsFormOpen(false);
    setEditingLead(null);
    setForm({ name: '', email: '', phone: '', source: 'website', status: 'new', estate_interest: '', notes: '' });
    fetchLeads();
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await supabase.from('crm_leads').delete().eq('id', id);
    toast({ title: 'Lead deleted' });
    if (selectedLead?.id === id) setSelectedLead(null);
    fetchLeads();
  };

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    await supabase.from('crm_leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', lead.id);
    await supabase.from('crm_lead_activities').insert({
      lead_id: lead.id, activity_type: 'status_change',
      description: `Status changed from ${lead.status} to ${newStatus}`,
      created_by: user?.id,
    });
    fetchLeads();
    if (selectedLead?.id === lead.id) fetchLeadDetails(lead.id);
  };

  const handleAddFollowUp = async () => {
    if (!selectedLead || !followUpForm.scheduled_at) return;
    await supabase.from('crm_follow_ups').insert({
      lead_id: selectedLead.id,
      scheduled_at: followUpForm.scheduled_at,
      action_type: followUpForm.action_type,
      notes: followUpForm.notes || null,
      created_by: user?.id,
    });
    await supabase.from('crm_lead_activities').insert({
      lead_id: selectedLead.id, activity_type: 'follow_up_scheduled',
      description: `Follow-up ${followUpForm.action_type} scheduled for ${followUpForm.scheduled_at}`,
      created_by: user?.id,
    });
    toast({ title: 'Follow-up scheduled' });
    setShowFollowUpForm(false);
    setFollowUpForm({ scheduled_at: '', action_type: 'call', notes: '' });
    fetchLeadDetails(selectedLead.id);
  };

  const handleCompleteFollowUp = async (fup: FollowUp) => {
    await supabase.from('crm_follow_ups').update({ completed_at: new Date().toISOString() }).eq('id', fup.id);
    await supabase.from('crm_lead_activities').insert({
      lead_id: fup.lead_id, activity_type: 'follow_up_completed',
      description: `Completed ${fup.action_type} follow-up`,
      created_by: user?.id,
    });
    await supabase.from('crm_leads').update({ last_contacted_at: new Date().toISOString() }).eq('id', fup.lead_id);
    fetchLeadDetails(fup.lead_id);
    fetchLeads();
  };

  const handleLogActivity = async (type: string, description: string) => {
    if (!selectedLead) return;
    await supabase.from('crm_lead_activities').insert({
      lead_id: selectedLead.id, activity_type: type, description, created_by: user?.id,
    });
    fetchLeadDetails(selectedLead.id);
  };

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.phone?.includes(searchTerm));
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    won: leads.filter(l => l.status === 'won').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', value: stats.total, icon: UsersIcon, color: 'text-blue-400' },
          { label: 'New', value: stats.new, icon: Plus, color: 'text-green-400' },
          { label: 'Qualified', value: stats.qualified, icon: TrendingUp, color: 'text-purple-400' },
          { label: 'Won', value: stats.won, icon: CheckCircle, color: 'text-emerald-400' },
        ].map(s => (
          <Card key={s.label} className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-700 border-slate-600 text-white" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditingLead(null); setForm({ name: '', email: '', phone: '', source: 'website', status: 'new', estate_interest: '', notes: '' }); setIsFormOpen(true); }} className="gap-1">
          <Plus className="h-4 w-4" /> Add Lead
        </Button>
      </div>

      {/* Leads List */}
      <div className="flex gap-4">
        <div className={`${selectedLead ? 'w-1/2' : 'w-full'} transition-all`}>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {loading ? <p className="text-slate-400 p-4">Loading...</p> :
                filtered.length === 0 ? <p className="text-slate-400 p-4 text-center">No leads found</p> :
                filtered.map(lead => (
                  <Card key={lead.id} className={`border-slate-600 cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-slate-600' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                    onClick={() => handleOpenLead(lead)}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate">{lead.name}</span>
                            <Badge className={`text-xs ${STATUS_COLORS[lead.status] || ''}`}>{lead.status}</Badge>
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-slate-400">
                            {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                            {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                          </div>
                          {lead.estate_interest && <p className="text-xs text-slate-500 mt-1">Interest: {lead.estate_interest}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400"
                            onClick={e => { e.stopPropagation(); setEditingLead(lead); setForm({ name: lead.name, email: lead.email || '', phone: lead.phone || '', source: lead.source, status: lead.status, estate_interest: lead.estate_interest || '', notes: lead.notes || '' }); setIsFormOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400"
                            onClick={e => { e.stopPropagation(); handleDeleteLead(lead.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </div>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <div className="w-1/2">
            <Card className="bg-slate-700/50 border-slate-600 h-[500px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{selectedLead.name}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)} className="text-slate-400">✕</Button>
                </div>
                <div className="flex gap-2 mt-1">
                  <Select value={selectedLead.status} onValueChange={s => { handleStatusChange(selectedLead, s); setSelectedLead({ ...selectedLead, status: s }); }}>
                    <SelectTrigger className="w-[120px] h-7 text-xs bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="text-xs text-slate-400">{selectedLead.source}</Badge>
                </div>
              </CardHeader>
              <ScrollArea className="h-[400px] px-4 pb-4">
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-1 text-sm text-slate-300">
                    {selectedLead.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {selectedLead.email}</p>}
                    {selectedLead.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {selectedLead.phone}</p>}
                    {selectedLead.estate_interest && <p className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> {selectedLead.estate_interest}</p>}
                    {selectedLead.notes && <p className="text-slate-400 mt-2">{selectedLead.notes}</p>}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setShowFollowUpForm(true)}>
                      <Calendar className="h-3 w-3" /> Schedule Follow-up
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleLogActivity('call', 'Phone call made')}>
                      <PhoneCall className="h-3 w-3" /> Log Call
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleLogActivity('email', 'Email sent')}>
                      <MailPlus className="h-3 w-3" /> Log Email
                    </Button>
                  </div>

                  {/* Follow-up form */}
                  {showFollowUpForm && (
                    <Card className="bg-slate-600 border-slate-500">
                      <CardContent className="p-3 space-y-2">
                        <Input type="datetime-local" value={followUpForm.scheduled_at}
                          onChange={e => setFollowUpForm(p => ({ ...p, scheduled_at: e.target.value }))}
                          className="bg-slate-700 border-slate-500 text-white text-sm" />
                        <Select value={followUpForm.action_type} onValueChange={v => setFollowUpForm(p => ({ ...p, action_type: v }))}>
                          <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTION_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Notes..." value={followUpForm.notes}
                          onChange={e => setFollowUpForm(p => ({ ...p, notes: e.target.value }))}
                          className="bg-slate-700 border-slate-500 text-white text-sm" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleAddFollowUp}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowFollowUpForm(false)}>Cancel</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Follow-ups */}
                  {followUps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Follow-ups</h4>
                      <div className="space-y-1">
                        {followUps.map(f => (
                          <div key={f.id} className={`flex items-center justify-between text-xs p-2 rounded ${f.completed_at ? 'bg-green-900/20' : 'bg-slate-600'}`}>
                            <div>
                              <span className="text-white">{f.action_type}</span>
                              <span className="text-slate-400 ml-2">{format(new Date(f.scheduled_at), 'MMM d, h:mm a')}</span>
                              {f.notes && <span className="text-slate-500 ml-2">— {f.notes}</span>}
                            </div>
                            {!f.completed_at && (
                              <Button size="sm" variant="ghost" className="h-6 text-xs text-green-400" onClick={() => handleCompleteFollowUp(f)}>
                                <CheckCircle className="h-3 w-3 mr-1" /> Done
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activity Log */}
                  {activities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Activity Log</h4>
                      <div className="space-y-1">
                        {activities.map(a => (
                          <div key={a.id} className="text-xs p-2 bg-slate-600/50 rounded">
                            <span className="text-slate-400">{format(new Date(a.created_at), 'MMM d, h:mm a')}</span>
                            <span className="text-white ml-2">{a.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>

      {/* Lead Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-slate-300">Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Email</Label>
                <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Phone</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300">Source</Label>
                <Select value={form.source} onValueChange={v => setForm(p => ({ ...p, source: v }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Estate Interest</Label>
              <Input value={form.estate_interest} onChange={e => setForm(p => ({ ...p, estate_interest: e.target.value }))} placeholder="e.g., Hampton Court Phase 3" className="bg-slate-700 border-slate-600 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="bg-slate-700 border-slate-600 text-white" rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveLead}>{editingLead ? 'Update' : 'Create'} Lead</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCRMLeads;
