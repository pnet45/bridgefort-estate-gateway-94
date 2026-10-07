import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, BookOpen, CheckCircle2, ExternalLink, History, Plus, RefreshCw, Save, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type KnowledgeDoc = {
  id: string;
  title: string;
  source_url: string | null;
  audience: 'public' | 'staff' | 'restricted';
  allowed_roles: string[];
  topics: string[];
  status: 'draft' | 'published' | 'archived';
  content: string;
  version?: number;
  updated_at: string;
  created_at: string;
};

type SourceSync = {
  id: string;
  source_url: string;
  status: 'never_checked' | 'clean' | 'pending_review' | 'error';
  pending_title: string | null;
  pending_detected_at: string | null;
  last_checked_at: string | null;
  last_error: string | null;
  document?: { id: string; title: string; version?: number; status: string } | null;
};

type KnowledgeVersion = {
  id: string;
  document_id: string;
  version: number;
  title: string;
  content: string;
  audience: string;
  allowed_roles: string[];
  topics: string[];
  status: string;
  change_type: string | null;
  change_summary: string | null;
  changed_by: string | null;
  created_at: string;
};

const SOURCE_LABELS: Record<string, string> = {
  'https://www.bridgeforthomes.com/privacy-policy': 'Privacy Policy',
  'https://www.bridgeforthomes.com/NDPP': 'Data Protection Policy Statement',
  'https://www.bridgeforthomes.com/terms-of-service': 'Terms of Service',
  'https://www.bridgeforthomes.com/sitemap': 'Sitemap & Navigation',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const AdminLeoKnowledgeManagement = () => {
  const { hasPermission } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [sources, setSources] = useState<SourceSync[]>([]);
  const [versions, setVersions] = useState<KnowledgeVersion[]>([]);
  const [selected, setSelected] = useState<KnowledgeDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('knowledge');

  const [form, setForm] = useState({
    title: '',
    sourceUrl: '',
    audience: 'public',
    allowedRoles: '',
    topics: '',
    status: 'published',
    content: '',
  });

  const invoke = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('leo-knowledge-admin', { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const load = async () => {
    setLoading(true);
    try {
      const [docData, sourceData] = await Promise.all([
        invoke({ action: 'list' }),
        invoke({ action: 'source_sync_list' }),
      ]);
      setDocuments(docData.documents ?? []);
      setSources(sourceData.sources ?? []);
    } catch (error) {
      toast({ title: 'Unable to load Leo knowledge', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesSearch = !q || [doc.title, doc.source_url ?? '', ...(doc.topics ?? [])].join(' ').toLowerCase().includes(q);
      const matchesAudience = audienceFilter === 'all' || doc.audience === audienceFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesAudience && matchesStatus;
    });
  }, [documents, search, audienceFilter, statusFilter]);

  const pendingSources = sources.filter((source) => source.status === 'pending_review').length;

  const startNew = () => {
    setSelected(null);
    setForm({ title: '', sourceUrl: '', audience: 'public', allowedRoles: '', topics: '', status: 'draft', content: '' });
    setActiveTab('editor');
  };

  const editDocument = async (doc: KnowledgeDoc) => {
    try {
      const data = await invoke({ action: 'get', id: doc.id });
      const full = data.document as KnowledgeDoc;
      setSelected(full);
      setForm({
        title: full.title,
        sourceUrl: full.source_url ?? '',
        audience: full.audience,
        allowedRoles: (full.allowed_roles ?? []).join(', '),
        topics: (full.topics ?? []).join(', '),
        status: full.status,
        content: full.content,
      });
      const history = await invoke({ action: 'history', id: full.id });
      setVersions(history.versions ?? []);
      setActiveTab('editor');
    } catch (error) {
      toast({ title: 'Could not open knowledge item', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    }
  };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }
    if (form.status === 'published') {
      const confirmed = window.confirm(
        selected
          ? 'Publish this knowledge update? A new version will be created and Leo may use the published version immediately.'
          : 'Publish this knowledge item? Leo may use it immediately after it is published.'
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      const data = await invoke({
        action: 'upsert',
        ...(selected ? { id: selected.id } : {}),
        title: form.title.trim(),
        sourceUrl: form.sourceUrl.trim() || null,
        audience: form.audience,
        allowedRoles: form.allowedRoles.split(',').map((v) => v.trim()).filter(Boolean),
        topics: form.topics.split(',').map((v) => v.trim()).filter(Boolean),
        status: form.status,
        content: form.content.trim(),
      });

      toast({ title: 'Leo knowledge saved', description: `Saved with ${data.version ? `version ${data.version}` : 'new version history'}.` });
      await load();

      if (data.id) {
        const refreshed = await invoke({ action: 'get', id: data.id });
        setSelected(refreshed.document);
        const history = await invoke({ action: 'history', id: data.id });
        setVersions(history.versions ?? []);
      }
    } catch (error) {
      toast({ title: 'Save failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const sourceAction = async (source: SourceSync, action: 'source_sync_mark_reviewed' | 'source_sync_reject') => {
    const prompt = action === 'source_sync_reject'
      ? 'Reject this detected website change? The current published Leo knowledge will remain unchanged.'
      : 'Mark this detected website change as reviewed? This records the current source fingerprint but does not change Leo content.';
    if (!window.confirm(prompt)) return;

    try {
      await invoke({ action, id: source.id });
      toast({ title: action === 'source_sync_reject' ? 'Source change rejected' : 'Source marked reviewed' });
      await load();
    } catch (error) {
      toast({ title: 'Source action failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    }
  };

  if (!hasPermission('admin:view_content')) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Leo Knowledge Management</CardTitle>
            <p className="text-sm text-slate-400 mt-1">Controlled business knowledge for Leo. Published changes are versioned and protected by server-side audience/role filtering.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>
            <Button onClick={startNew}><Plus className="h-4 w-4 mr-2" /> Add Knowledge</Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="knowledge" className="data-[state=active]:bg-primary data-[state=active]:text-white"><BookOpen className="h-4 w-4 mr-1" /> Knowledge</TabsTrigger>
          <TabsTrigger value="editor" className="data-[state=active]:bg-primary data-[state=active]:text-white">Editor</TabsTrigger>
          <TabsTrigger value="sources" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Sources {pendingSources > 0 && <Badge className="ml-2 bg-amber-500 text-black">{pendingSources}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, source or topic" className="bg-slate-900 border-slate-700 md:col-span-2" />
              <select value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)} className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm">
                <option value="all">All audiences</option><option value="public">Public</option><option value="staff">Staff</option><option value="restricted">Restricted</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm">
                <option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
              </select>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="bg-slate-800 border-slate-700 text-white">
                <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold">{doc.title}</h3>
                      <Badge variant="outline">{doc.audience}</Badge>
                      <Badge variant={doc.status === 'published' ? 'default' : 'secondary'}>{doc.status}</Badge>
                      {doc.version && <Badge variant="outline">v{doc.version}</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 break-all">{doc.source_url || 'Internal business knowledge'}</p>
                    <p className="text-xs text-slate-500 mt-1">Updated {formatDate(doc.updated_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" onClick={() => editDocument(doc)}><History className="h-4 w-4 mr-1" /> View / Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!filteredDocuments.length && <div className="text-center py-12 text-slate-400">No knowledge items match your filters.</div>}
          </div>
        </TabsContent>

        <TabsContent value="editor">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle>{selected ? `Edit: ${selected.title}` : 'Add Knowledge'}</CardTitle>
              <p className="text-sm text-slate-400">Do not enter passwords, API keys, webhook secrets, access tokens or unrestricted private client records.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Knowledge title" className="bg-slate-900 border-slate-700" />
                <Input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="Source URL (optional)" className="bg-slate-900 border-slate-700" />
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm">
                  <option value="public">Public</option><option value="staff">Staff</option><option value="restricted">Restricted</option>
                </select>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm">
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select>
                <Input value={form.allowedRoles} onChange={(e) => setForm({ ...form, allowedRoles: e.target.value })} placeholder="Allowed roles, comma separated" className="bg-slate-900 border-slate-700" disabled={form.audience !== 'restricted'} />
                <Input value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} placeholder="Topics, comma separated" className="bg-slate-900 border-slate-700" />
              </div>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Approved knowledge content..." className="min-h-[360px] bg-slate-900 border-slate-700 font-mono text-sm" />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-2" /> {saving ? 'Saving…' : 'Save Knowledge'}</Button>
                <Button variant="outline" onClick={() => selected && editDocument(selected)} disabled={!selected}><History className="h-4 w-4 mr-2" /> Reload History</Button>
              </div>

              {selected && (
                <div className="pt-4 border-t border-slate-700">
                  <h4 className="font-semibold mb-3 flex items-center gap-2"><History className="h-4 w-4" /> Version History</h4>
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <details key={version.id} className="rounded-lg border border-slate-700 p-3">
                        <summary className="cursor-pointer list-none flex flex-wrap items-center gap-2">
                          <Badge>v{version.version}</Badge><span className="font-medium">{version.title}</span><span className="text-xs text-slate-400">{version.change_type || 'update'} · {formatDate(version.created_at)}</span>
                        </summary>
                        <div className="mt-3 text-sm text-slate-300 whitespace-pre-wrap max-h-80 overflow-auto">{version.content}</div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card className="bg-amber-950/30 border-amber-800 text-white">
            <CardContent className="p-4 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-white">Website changes never auto-publish into Leo.</p>
                <p className="mt-1">The monitor detects source changes only. Review the official page, update Leo's approved knowledge if needed, then mark the source reviewed. Live business records remain authoritative for prices, availability, payment status, inspections and allocations.</p>
              </div>
            </CardContent>
          </Card>

          {sources.map((source) => (
            <Card key={source.id} className="bg-slate-800 border-slate-700 text-white">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{SOURCE_LABELS[source.source_url] || source.pending_title || source.source_url}</h3>
                      {source.status === 'clean' && <Badge className="bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Clean</Badge>}
                      {source.status === 'pending_review' && <Badge className="bg-amber-500 text-black"><AlertTriangle className="h-3 w-3 mr-1" /> Review required</Badge>}
                      {source.status === 'error' && <Badge className="bg-red-600"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>}
                    </div>
                    <a href={source.source_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all inline-flex items-center gap-1 mt-2">{source.source_url}<ExternalLink className="h-3 w-3" /></a>
                    <p className="text-xs text-slate-500 mt-2">Last checked: {formatDate(source.last_checked_at)} · Leo document: {source.document?.title || 'Not linked'}</p>
                    {source.last_error && <p className="text-xs text-red-300 mt-2">{source.last_error}</p>}
                  </div>
                  {source.status === 'pending_review' && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button variant="outline" onClick={() => sourceAction(source, 'source_sync_mark_reviewed')}><CheckCircle2 className="h-4 w-4 mr-1" /> Mark Reviewed</Button>
                      <Button variant="outline" className="text-red-300" onClick={() => sourceAction(source, 'source_sync_reject')}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLeoKnowledgeManagement;
