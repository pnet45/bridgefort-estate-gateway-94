import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Edit3, Megaphone, Plus, Save, Archive, Eye, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type Promotion = Database['public']['Tables']['bh_realtor_promotions']['Row'];
type PromotionInsert = Database['public']['Tables']['bh_realtor_promotions']['Insert'];

type FormState = {
  id: string | null;
  title: string;
  slug: string;
  summary: string;
  content: string;
  terms_and_conditions: string;
  image_url: string;
  starts_at: string;
  ends_at: string;
  campaign_period_label: string;
  status: 'draft' | 'published' | 'archived';
  display_order: string;
};

const blankForm = (): FormState => {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    id: null, title: '', slug: '', summary: '', content: '', terms_and_conditions: '',
    image_url: '', starts_at: toLocalInput(start), ends_at: toLocalInput(end), campaign_period_label: '', status: 'draft', display_order: '0',
  };
};

const toLocalInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toInputValue = (value: string) => toLocalInput(new Date(value));
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-+|-+$/g, '');

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });

const AdminPromotions: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Promotion[]>([]);
  const [form, setForm] = useState<FormState>(() => blankForm());
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bh_realtor_promotions')
      .select('*')
      .order('status', { ascending: true })
      .order('starts_at', { ascending: false });
    if (error) {
      toast({ title: 'Could not load promotions', description: error.message, variant: 'destructive' });
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const counts = useMemo(() => ({
    all: rows.length,
    draft: rows.filter((r) => r.status === 'draft').length,
    published: rows.filter((r) => r.status === 'published').length,
    archived: rows.filter((r) => r.status === 'archived').length,
  }), [rows]);

  const filtered = useMemo(() => rows.filter((row) => {
    const matchesStatus = filter === 'all' || row.status === filter;
    const q = search.trim().toLowerCase();
    return matchesStatus && (!q || row.title.toLowerCase().includes(q) || row.slug.toLowerCase().includes(q));
  }), [rows, filter, search]);

  const edit = (row: Promotion) => setForm({
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    terms_and_conditions: row.terms_and_conditions,
    image_url: row.image_url || '',
    starts_at: toInputValue(row.starts_at),
    ends_at: row.ends_at ? toInputValue(row.ends_at) : '',
    campaign_period_label: row.campaign_period_label || '',
    status: row.status === 'published' || row.status === 'archived' ? row.status : 'draft',
    display_order: String(row.display_order),
  });

  const reset = () => setForm(blankForm());

  const uploadPromotionImage = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Select an image file', description: 'Promotion artwork must be an image.', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Image is too large', description: 'Please keep promotion artwork below 10MB.', variant: 'destructive' });
      return;
    }
    setUploadingImage(true);
    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const safeSlug = slugify(form.slug || form.title || 'promotion') || 'promotion';
    const path = `promotions/${safeSlug}-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from('media-files').upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
    if (error) {
      toast({ title: 'Image upload failed', description: error.message, variant: 'destructive' });
    } else {
      const { data } = supabase.storage.from('media-files').getPublicUrl(path);
      setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: 'Promotion artwork uploaded' });
    }
    setUploadingImage(false);
  };

  const save = async (nextStatus?: FormState['status']) => {
    if (!user) return;
    const status = nextStatus || form.status;
    if (!form.title.trim() || !form.slug.trim() || !form.summary.trim() || !form.content.trim() || !form.terms_and_conditions.trim()) {
      toast({ title: 'Complete the promotion fields', description: 'Title, slug, summary, details and terms are required.', variant: 'destructive' });
      return;
    }
    const starts = new Date(form.starts_at);
    const ends = form.ends_at ? new Date(form.ends_at) : null;
    if (Number.isNaN(starts.getTime()) || (ends && (Number.isNaN(ends.getTime()) || ends <= starts))) {
      toast({ title: 'Check promotion dates', description: 'The end date must be after the start date.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload: PromotionInsert = {
      title: form.title.trim(),
      slug: slugify(form.slug),
      summary: form.summary.trim(),
      content: form.content.trim(),
      terms_and_conditions: form.terms_and_conditions.trim(),
      image_url: form.image_url.trim() || null,
      starts_at: starts.toISOString(),
      ends_at: ends ? ends.toISOString() : null,
      campaign_period_label: form.campaign_period_label.trim() || null,
      status,
      display_order: Number(form.display_order) || 0,
      updated_by: user.id,
      ...(form.id ? {} : { created_by: user.id }),
    };

    const result = form.id
      ? await supabase.from('bh_realtor_promotions').update(payload).eq('id', form.id)
      : await supabase.from('bh_realtor_promotions').insert(payload);

    if (result.error) {
      toast({ title: 'Promotion could not be saved', description: result.error.message, variant: 'destructive' });
    } else {
      toast({ title: status === 'published' ? 'Promotion published' : status === 'archived' ? 'Promotion archived' : 'Promotion saved' });
      reset();
      await load();
    }
    setSaving(false);
  };

  const archive = async (row: Promotion) => {
    if (!user) return;
    const { error } = await supabase.from('bh_realtor_promotions').update({ status: 'archived', updated_by: user.id }).eq('id', row.id);
    if (error) toast({ title: 'Could not archive promotion', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Promotion archived' }); await load(); }
  };

  const isActive = (row: Promotion) => row.status === 'published' && new Date(row.starts_at) <= new Date() && new Date(row.ends_at) >= new Date();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">BHRealtors</p></div>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">Promotions Management</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Create, publish and archive Realtor promotions. Published promotions are visible to active BHRealtors only.</p>
          </div>
          <Button onClick={reset} className="w-fit"><Plus className="mr-2 h-4 w-4" />New Promotion</Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {(['all', 'draft', 'published', 'archived'] as const).map((key) => (
            <button key={key} type="button" onClick={() => setFilter(key)} className={`rounded-2xl border p-4 text-left transition ${filter === key ? 'border-primary/50 bg-primary/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{key}</p>
              <p className="mt-1 text-2xl font-black text-white">{counts[key]}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 shadow-xl backdrop-blur-2xl sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="font-bold text-white">Promotion library</h3><p className="text-xs text-slate-400">Manage current and previous campaigns.</p></div>
            <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search promotions" className="border-white/10 bg-white/[0.04] pl-9 text-white placeholder:text-slate-500" /></div>
          </div>
          {loading ? <div className="py-12 text-center text-sm text-slate-400">Loading promotions…</div> : !filtered.length ? <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-400">No promotions match this view.</div> : (
            <div className="space-y-3">
              {filtered.map((row) => (
                <div key={row.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><Badge className="capitalize">{row.status}</Badge>{isActive(row) && <Badge className="bg-emerald-500/15 text-emerald-300">Live now</Badge>}</div>
                      <h4 className="mt-2 truncate font-bold text-white">{row.title}</h4>
                      <p className="mt-1 text-xs text-slate-400">/{row.slug} • {row.campaign_period_label || (row.ends_at ? `${formatDate(row.starts_at)} – ${formatDate(row.ends_at)}` : formatDate(row.starts_at))}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-300">{row.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => edit(row)} className="border-white/10 bg-white/[0.03] text-white"><Edit3 className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                      {row.status === 'published' && <a href={`/bh-realtors/promotions/${row.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm text-white"><Eye className="mr-1.5 h-3.5 w-3.5" />View</a>}
                      {row.status !== 'archived' && <Button type="button" variant="outline" size="sm" onClick={() => void archive(row)} className="border-amber-500/20 text-amber-300"><Archive className="mr-1.5 h-3.5 w-3.5" />Archive</Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 shadow-xl backdrop-blur-2xl sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h3 className="font-bold text-white">{form.id ? 'Edit Promotion' : 'Create Promotion'}</h3><p className="text-xs text-slate-400">Use clear, approved promotion wording.</p></div>
            {form.id && <Button type="button" variant="ghost" size="sm" onClick={reset} className="text-slate-300">Cancel</Button>}
          </div>
          <div className="space-y-4">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} placeholder="Promotion title" className="border-white/10 bg-white/[0.04] text-white" /></Field>
            <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="promotion-slug" className="border-white/10 bg-white/[0.04] text-white" /></Field>
            <Field label="Short Summary"><Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} className="border-white/10 bg-white/[0.04] text-white" /></Field>
            <Field label="Full Promotion Details"><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={7} className="border-white/10 bg-white/[0.04] text-white" /></Field>
            <Field label="Terms & Conditions"><Textarea value={form.terms_and_conditions} onChange={(e) => setForm({ ...form, terms_and_conditions: e.target.value })} rows={7} className="border-white/10 bg-white/[0.04] text-white" /></Field>
            <Field label="Promotion Artwork">
  <div className="space-y-2">
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Public image URL (optional)" className="border-white/10 bg-white/[0.04] text-white" />
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadPromotionImage(file); e.currentTarget.value = ''; }} />
      <Button type="button" variant="outline" disabled={uploadingImage} onClick={() => imageInputRef.current?.click()} className="border-white/10 bg-white/[0.04] text-white">
        {uploadingImage ? 'Uploading…' : 'Upload Artwork'}
      </Button>
    </div>
    {form.image_url && <img src={form.image_url} alt="Promotion preview" className="max-h-48 w-full rounded-2xl border border-white/10 object-contain bg-black/20" />}
  </div>
</Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts"><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="border-white/10 bg-white/[0.04] text-white" /></Field>
              <Field label="Ends (optional)"><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className="border-white/10 bg-white/[0.04] text-white" /></Field>
            </div>
            <Field label="Campaign Period Label (optional)"><Input value={form.campaign_period_label} onChange={(e) => setForm({ ...form, campaign_period_label: e.target.value })} placeholder="e.g. Independence Day Promo 2026" className="border-white/10 bg-white/[0.04] text-white" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display Order"><Input type="number" min="0" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className="border-white/10 bg-white/[0.04] text-white" /></Field>
              <Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState['status'] })} className="h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
              <Button type="button" onClick={() => void save('draft')} disabled={saving}><Save className="mr-2 h-4 w-4" />Save Draft</Button>
              <Button type="button" onClick={() => void save('published')} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500"><Megaphone className="mr-2 h-4 w-4" />Publish</Button>
              {form.id && <Button type="button" variant="outline" onClick={() => void save('archived')} disabled={saving} className="border-amber-500/20 text-amber-300"><Archive className="mr-2 h-4 w-4" />Archive</Button>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-semibold text-slate-300">{label}</span>
    {children}
  </label>
);

export default AdminPromotions;
