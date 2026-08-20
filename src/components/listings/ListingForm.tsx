import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Plus, X, ArrowLeft, ImagePlus, MapPin, Home, Banknote, UserRound, Sparkles } from 'lucide-react';
import { REGIONS, PROPERTY_TYPES, type Listing } from '@/types/listing';

interface Props {
  listingId?: string;
  initialData?: Partial<Listing>;
}

const empty = {
  title: '',
  description: '',
  region: 'Lagos',
  city: '',
  estate: '',
  address: '',
  property_type: 'Villa',
  price_period: 'sale',
  price_amount: 0,
  price_currency: 'NGN',
  bedrooms: 0,
  bathrooms: 0,
  parking: 0,
  built_sqm: '' as any,
  land_sqm: '' as any,
  year_built: '' as any,
  monthly_rent: '' as any,
  annual_rent: '' as any,
  owner_name: '',
  owner_phone: '',
  owner_email: '',
  amenities: [] as string[],
  photos: [] as string[],
  price_negotiable: false,
};

const glassCard = 'rounded-3xl border border-white/50 bg-white/70 dark:bg-slate-950/65 backdrop-blur-2xl shadow-[0_20px_70px_-30px_rgba(15,23,42,0.45)]';
const fieldClass = 'bg-white/65 dark:bg-white/[0.06] border-white/60 dark:border-white/10 rounded-2xl h-12 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30';

const SectionHeading = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

const ListingForm = ({ listingId, initialData }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({ ...empty, ...(initialData || {}) });
  const [photoInput, setPhotoInput] = useState('');
  const [amenityInput, setAmenityInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) setForm({ ...empty, ...initialData });
  }, [initialData]);

  const update = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const addPhoto = () => {
    if (!photoInput.trim()) return;
    update('photos', [...(form.photos || []), photoInput.trim()]);
    setPhotoInput('');
  };

  const removePhoto = (i: number) => update('photos', form.photos.filter((_: any, idx: number) => idx !== i));

  const addAmenity = () => {
    if (!amenityInput.trim()) return;
    update('amenities', [...(form.amenities || []), amenityInput.trim()]);
    setAmenityInput('');
  };

  const removeAmenity = (i: number) => update('amenities', form.amenities.filter((_: any, idx: number) => idx !== i));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !user) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('media-files').upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from('media-files').getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      update('photos', [...(form.photos || []), ...uploaded]);
      toast.success(`${uploaded.length} photo(s) uploaded`);
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to post a listing');
      return navigate('/auth');
    }
    if (!form.title.trim() || !form.region || !form.price_amount) {
      return toast.error('Title, region, and price are required');
    }

    setSaving(true);

    // Keep the payload aligned with the listings table. owner_email is intentionally
    // included only after the matching DB column migration is deployed.
    const payload: any = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      region: form.region,
      city: form.city?.trim() || null,
      estate: form.estate?.trim() || null,
      address: form.address?.trim() || null,
      property_type: form.property_type,
      price_period: form.price_period,
      price_amount: Number(form.price_amount) || 0,
      price_currency: form.price_currency || 'NGN',
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      parking: Number(form.parking) || 0,
      built_sqm: form.built_sqm ? Number(form.built_sqm) : null,
      land_sqm: form.land_sqm ? Number(form.land_sqm) : null,
      year_built: form.year_built ? Number(form.year_built) : null,
      monthly_rent: form.monthly_rent ? Number(form.monthly_rent) : null,
      annual_rent: form.annual_rent ? Number(form.annual_rent) : null,
      owner_name: form.owner_name?.trim() || null,
      owner_phone: form.owner_phone?.trim() || null,
      owner_email: form.owner_email?.trim() || null,
      amenities: form.amenities || [],
      photos: form.photos || [],
      price_negotiable: Boolean(form.price_negotiable),
      created_by: user.id,
    };

    const { error } = listingId
      ? await supabase.from('listings').update(payload).eq('id', listingId).eq('created_by', user.id)
      : await supabase.from('listings').insert(payload);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(listingId ? 'Listing updated — pending admin re-approval' : 'Listing submitted for admin approval');
    navigate('/listings/my');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" className="rounded-full" onClick={() => navigate('/listings/my')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Listings
        </Button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" /> Modern listing experience
        </div>
      </div>

      <Card className={`${glassCard} overflow-hidden`}>
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-primary/[0.12] via-white/20 to-slate-100/40 dark:from-primary/15 dark:via-transparent dark:to-white/[0.03]">
          <div className="absolute -top-20 -right-16 w-48 h-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Bridgefort Marketplace</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{listingId ? 'Update your listing' : 'Post a new listing'}</h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground">
              Add the important details buyers need. Your listing will be reviewed before it goes live.
            </p>
          </div>
        </div>
      </Card>

      <Card className={`${glassCard} p-5 sm:p-7 space-y-5`}>
        <SectionHeading icon={Home} title="Basic information" description="Tell buyers what makes this property worth a look." />
        <div>
          <Label>Listing title *</Label>
          <Input className={fieldClass} value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Modern 4 Bedroom Duplex in Lekki" required maxLength={200} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea className="bg-white/65 dark:bg-white/[0.06] border-white/60 dark:border-white/10 rounded-2xl shadow-sm min-h-32" value={form.description || ''} onChange={e => update('description', e.target.value)} placeholder="Describe the property, location, condition and what makes it special..." rows={5} maxLength={2000} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Region *</Label><Select value={form.region} onValueChange={v => update('region', v)}><SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger><SelectContent>{REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Property type *</Label><Select value={form.property_type} onValueChange={v => update('property_type', v)}><SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger><SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>City</Label><Input className={fieldClass} value={form.city || ''} onChange={e => update('city', e.target.value)} placeholder="e.g. Lekki" /></div>
          <div><Label>Estate / Neighborhood</Label><Input className={fieldClass} value={form.estate || ''} onChange={e => update('estate', e.target.value)} placeholder="e.g. Eleganza Gardens" /></div>
          <div className="sm:col-span-2"><Label>Address</Label><div className="relative"><MapPin className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" /><Input className={`${fieldClass} pl-10`} value={form.address || ''} onChange={e => update('address', e.target.value)} placeholder="Property address" /></div></div>
        </div>
      </Card>

      <Card className={`${glassCard} p-5 sm:p-7 space-y-5`}>
        <SectionHeading icon={Banknote} title="Pricing" description="Set the asking price and payment terms." />
        <div className="grid sm:grid-cols-3 gap-4">
          <div><Label>Listing type *</Label><Select value={form.price_period} onValueChange={v => update('price_period', v)}><SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sale">For Sale</SelectItem><SelectItem value="rent">For Rent</SelectItem><SelectItem value="lease">For Lease</SelectItem></SelectContent></Select></div>
          <div><Label>Price (NGN) *</Label><Input className={fieldClass} type="number" value={form.price_amount} onChange={e => update('price_amount', e.target.value)} required min={0} /></div>
          <div><Label>Monthly rent</Label><Input className={fieldClass} type="number" value={form.monthly_rent} onChange={e => update('monthly_rent', e.target.value)} min={0} /></div>
        </div>
      </Card>

      <Card className={`${glassCard} p-5 sm:p-7 space-y-5`}>
        <SectionHeading icon={Home} title="Property details" description="Give buyers a quick picture of the property." />
        <div className="grid sm:grid-cols-3 gap-4">
          <div><Label>Bedrooms</Label><Input className={fieldClass} type="number" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} min={0} /></div>
          <div><Label>Bathrooms</Label><Input className={fieldClass} type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} min={0} /></div>
          <div><Label>Parking</Label><Input className={fieldClass} type="number" value={form.parking} onChange={e => update('parking', e.target.value)} min={0} /></div>
          <div><Label>Built (sqm)</Label><Input className={fieldClass} type="number" value={form.built_sqm} onChange={e => update('built_sqm', e.target.value)} min={0} /></div>
          <div><Label>Land (sqm)</Label><Input className={fieldClass} type="number" value={form.land_sqm} onChange={e => update('land_sqm', e.target.value)} min={0} /></div>
          <div><Label>Year built</Label><Input className={fieldClass} type="number" value={form.year_built} onChange={e => update('year_built', e.target.value)} min={0} /></div>
        </div>
        <div>
          <Label>Amenities</Label>
          <div className="flex gap-2"><Input className={fieldClass} value={amenityInput} onChange={e => setAmenityInput(e.target.value)} placeholder="e.g. Swimming Pool" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); }}} /><Button type="button" onClick={addAmenity} variant="outline" className="rounded-2xl h-12 w-12 shrink-0"><Plus className="w-4 h-4" /></Button></div>
          {form.amenities?.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{form.amenities.map((a: string, i: number) => <span key={i} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm flex items-center gap-2 border border-primary/10">{a}<button type="button" onClick={() => removeAmenity(i)}><X className="w-3 h-3" /></button></span>)}</div>}
        </div>
      </Card>

      <Card className={`${glassCard} p-5 sm:p-7 space-y-5`}>
        <SectionHeading icon={ImagePlus} title="Property photos" description="Good photos make a big difference. Add clear, well-lit images." />
        <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.03] p-5">
          <Label>Upload from device</Label>
          <Input className="mt-2 bg-white/70 dark:bg-white/[0.05] border-0 shadow-none" type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} />
          {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading photos...</div>}
        </div>
        <div><Label>Or paste image URL</Label><div className="flex gap-2 mt-1"><Input className={fieldClass} value={photoInput} onChange={e => setPhotoInput(e.target.value)} placeholder="https://..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPhoto(); }}} /><Button type="button" onClick={addPhoto} variant="outline" className="rounded-2xl h-12 w-12 shrink-0"><Plus className="w-4 h-4" /></Button></div></div>
        {form.photos?.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{form.photos.map((url: string, i: number) => <div key={i} className="relative group overflow-hidden rounded-2xl border border-white/50 shadow-sm"><img src={url} alt={`Property photo ${i + 1}`} className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" /><button type="button" onClick={() => removePhoto(i)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button></div>)}</div>}
      </Card>

      <Card className={`${glassCard} p-5 sm:p-7 space-y-5`}>
        <SectionHeading icon={UserRound} title="Contact information" description="How interested buyers can reach you about this listing." />
        <div className="grid sm:grid-cols-3 gap-4">
          <div><Label>Your name</Label><Input className={fieldClass} value={form.owner_name || ''} onChange={e => update('owner_name', e.target.value)} maxLength={100} /></div>
          <div><Label>Phone</Label><Input className={fieldClass} value={form.owner_phone || ''} onChange={e => update('owner_phone', e.target.value)} maxLength={30} /></div>
          <div><Label>Email</Label><Input className={fieldClass} type="email" value={form.owner_email || ''} onChange={e => update('owner_email', e.target.value)} maxLength={150} /></div>
        </div>
      </Card>

      <div className={`${glassCard} p-4 sm:p-5 flex flex-col sm:flex-row gap-3 justify-between items-center sticky bottom-4 z-20`}>
        <p className="text-xs text-muted-foreground text-center sm:text-left">Your listing will be reviewed by Bridgefort before it becomes public.</p>
        <div className="flex gap-3 w-full sm:w-auto"><Button type="button" variant="outline" className="rounded-full flex-1 sm:flex-none" onClick={() => navigate('/listings/my')}>Cancel</Button><Button type="submit" className="rounded-full px-7 flex-1 sm:flex-none shadow-lg shadow-primary/20" disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{listingId ? 'Update Listing' : 'Submit for Approval'}</Button></div>
      </div>
    </form>
  );
};

export default ListingForm;
