import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Sparkles, Loader2, CalendarPlus, Flag, FileText } from 'lucide-react';

type NextStep = { action: string; action_type: string; due_in_hours: number };
type Analysis = {
  intent_summary: string; intent_category: string; recommended_priority: string; priority_reason: string;
  key_details: { budget: string | null; timeline: string | null; location: string | null; concerns: string | null };
  next_steps: NextStep[];
};
type LeadOption = { id: string; name: string; estate_interest: string | null; notes: string | null };

const PRIORITY_STYLE: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-300', medium: 'bg-blue-500/20 text-blue-300',
  high: 'bg-orange-500/20 text-orange-300', urgent: 'bg-red-500/20 text-red-300',
};
const label = (v: string) => v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const AdminLeadAIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [leadId, setLeadId] = useState('none');
  const [inquiry, setInquiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    supabase.from('crm_leads').select('id,name,estate_interest,notes').order('created_at', { ascending: false }).limit(300)
      .then(({ data }) => setLeads((data || []) as LeadOption[]));
  }, []);

  const lead = leads.find(l => l.id === leadId);

  const analyze = async () => {
    setError(''); setAnalysis(null); setLoading(true);
    const context = lead ? `Lead name: ${lead.name}. Property interest: ${lead.estate_interest || 'unknown'}.` : '';
    const { data, error: fnError } = await supabase.functions.invoke('analyze-lead-inquiry', { body: { inquiry, context } });
    setLoading(false);
    if (fnError || data?.error) {
      let msg = data?.error || 'AI analysis failed';
      try { const ctx = (fnError as { context?: Response })?.context; if (ctx) msg = (await ctx.json()).error || msg; } catch { /* keep */ }
      setError(msg); return;
    }
    setAnalysis(data.analysis);
  };

  const applyPriority = async () => {
    if (!lead || !analysis) return;
    const { error: e } = await supabase.from('crm_leads').update({ priority: analysis.recommended_priority, updated_at: new Date().toISOString() }).eq('id', lead.id);
    if (e) return toast({ title: 'Could not update', description: e.message, variant: 'destructive' });
    await supabase.from('crm_lead_activities').insert({ lead_id: lead.id, activity_type: 'ai_priority', description: `AI set priority to ${analysis.recommended_priority}: ${analysis.priority_reason}`, created_by: user?.id });
    toast({ title: 'Priority applied' });
  };

  const saveSummary = async () => {
    if (!lead || !analysis) return;
    const note = `<p><strong>AI summary:</strong> ${analysis.intent_summary.replace(/</g, '&lt;')}</p>`;
    const { error: e } = await supabase.from('crm_leads').update({ notes: `${lead.notes || ''}${note}`, updated_at: new Date().toISOString() }).eq('id', lead.id);
    if (e) return toast({ title: 'Could not save', description: e.message, variant: 'destructive' });
    await supabase.from('crm_lead_activities').insert({ lead_id: lead.id, activity_type: 'ai_summary', description: analysis.intent_summary, created_by: user?.id });
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, notes: `${l.notes || ''}${note}` } : l));
    toast({ title: 'Summary saved to lead notes' });
  };

  const scheduleStep = async (step: NextStep) => {
    if (!lead) return;
    const when = new Date(Date.now() + Math.max(1, step.due_in_hours) * 3600_000).toISOString();
    const { error: e } = await supabase.from('crm_follow_ups').insert({ lead_id: lead.id, scheduled_at: when, action_type: step.action_type, notes: step.action, created_by: user?.id });
    if (e) return toast({ title: 'Could not schedule', description: e.message, variant: 'destructive' });
    await supabase.from('crm_lead_activities').insert({ lead_id: lead.id, activity_type: 'follow_up_scheduled', description: `AI suggested: ${step.action}`, created_by: user?.id });
    toast({ title: 'Follow-up scheduled' });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />AI Inquiry Assistant</CardTitle>
        <p className="text-sm text-slate-400">Paste a lead's message to get a summary, suggested priority and next steps.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1 md:col-span-1">
            <Label className="text-slate-300">Link to lead (optional)</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No lead selected</SelectItem>
                {leads.map(l => <SelectItem key={l.id} value={l.id}>{l.name}{l.estate_interest ? ` — ${l.estate_interest}` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-slate-300">Inquiry text</Label>
            <Textarea rows={5} maxLength={8000} value={inquiry} onChange={e => setInquiry(e.target.value)}
              placeholder="e.g. Good evening, I want 2 plots in Asaba, can I pay in 6 months? I can come for inspection Saturday." />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={analyze} disabled={loading || inquiry.trim().length < 5} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Analyze inquiry
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {analysis && (
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{label(analysis.intent_category)}</Badge>
              <Badge className={PRIORITY_STYLE[analysis.recommended_priority]}>Priority: {label(analysis.recommended_priority)}</Badge>
            </div>
            <p className="text-white">{analysis.intent_summary}</p>
            <p className="text-xs text-slate-400">Why: {analysis.priority_reason}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {(['budget', 'timeline', 'location', 'concerns'] as const).map(k => (
                <div key={k} className="rounded-md bg-slate-800 p-2"><p className="text-xs text-slate-500">{label(k)}</p><p className="text-slate-200">{analysis.key_details[k] || '—'}</p></div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-300">Suggested next steps</p>
              {analysis.next_steps.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-md bg-slate-800 p-2 text-sm">
                  <span className="text-slate-200">{s.action} <span className="text-xs text-slate-500">({label(s.action_type)}, within {s.due_in_hours}h)</span></span>
                  {lead && <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => scheduleStep(s)}><CalendarPlus className="h-3 w-3" />Schedule</Button>}
                </div>
              ))}
            </div>
            {lead ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={applyPriority}><Flag className="h-3 w-3" />Apply priority</Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={saveSummary}><FileText className="h-3 w-3" />Save summary to notes</Button>
              </div>
            ) : <p className="text-xs text-slate-500">Link a lead above to apply these suggestions.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLeadAIAssistant;
