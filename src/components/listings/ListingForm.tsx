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
import { Loader2, Plus, X } from 'lucide-react';
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
  const removePhoto = (i: number) =>
    update('photos', form.photos.filter((_: any, idx: number) => idx !== i));

  const addAmenity = () => {
    if (!amenityInput.trim()) return;
    update('amenities', [...(form.amenities || []), amenityInput.trim()]);
    setAmenityInput('');
  };
  const removeAmenity = (i: number) =>
    update('amenities', form.amenities.filter((_: any, idx: number) => idx !== i));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !user) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
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
    const payload: any = {
      ...form,
      price_amount: Number(form.price_amount) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      parking: Number(form.parking) || 0,
      built_sqm: form.built_sqm ? Number(form.built_sqm) : null,
      land_sqm: form.land_sqm ? Number(form.land_sqm) : null,
      year_built: form.year_built ? Number(form.year_built) : null,
      monthly_rent: form.monthly_rent ? Number(form.monthly_rent) : null,
      annual_rent: form.annual_rent ? Number(form.annual_rent) : null,
      created_by: user.id,
    };

    const { error } = listingId
      ? await supabase.from('listings').update(payload).eq('id', listingId)
      : await supabase.from('listings').insert(payload);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(listingId ? 'Listing updated — pending admin re-approval' : 'Listing submitted for admin approval');
    navigate('/listings/my');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <div>
          <Label>Title *</Label>
          <Input value={form.title} onChange={e => update('title', e.target.value)} required maxLength={200} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={form.description || ''} onChange={e => update('description', e.target.value)} rows={4} maxLength={2000} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Region *</Label>
            <Select value={form.region} onValueChange={v => update('region', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Property Type *</Label>
            <Select value={form.property_type} onValueChange={v => update('property_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city || ''} onChange={e => update('city', e.target.value)} />
          </div>
          <div>
            <Label>Estate / Neighborhood</Label>
            <Input value={form.estate || ''} onChange={e => update('estate', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input value={form.address || ''} onChange={e => update('address', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Listing Type *</Label>
            <Select value={form.price_period} onValueChange={v => update('price_period', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="lease">For Lease</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Price (NGN) *</Label>
            <Input type="number" value={form.price_amount} onChange={e => update('price_amount', e.target.value)} required min={0} />
          </div>
          <div>
            <Label>Monthly Rent</Label>
            <Input type="number" value={form.monthly_rent} onChange={e => update('monthly_rent', e.target.value)} min={0} />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Property Details</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Bedrooms</Label>
            <Input type="number" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} min={0} />
          </div>
          <div>
            <Label>Bathrooms</Label>
            <Input type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} min={0} />
          </div>
          <div>
            <Label>Parking</Label>
            <Input type="number" value={form.parking} onChange={e => update('parking', e.target.value)} min={0} />
          </div>
          <div>
            <Label>Built (sqm)</Label>
            <Input type="number" value={form.built_sqm} onChange={e => update('built_sqm', e.target.value)} min={0} />
          </div>
          <div>
            <Label>Land (sqm)</Label>
            <Input type="number" value={form.land_sqm} onChange={e => update('land_sqm', e.target.value)} min={0} />
          </div>
          <div>
            <Label>Year Built</Label>
            <Input type="number" value={form.year_built} onChange={e => update('year_built', e.target.value)} min={0} />
          </div>
        </div>

        <div>
          <Label>Amenities</Label>
          <div className="flex gap-2">
            <Input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} placeholder="e.g. Swimming Pool" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); }}} />
            <Button type="button" onClick={addAmenity} variant="outline"><Plus className="w-4 h-4" /></Button>
          </div>
          {form.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.amenities.map((a: string, i: number) => (
                <span key={i} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {a}
                  <button type="button" onClick={() => removeAmenity(i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Photos</h2>
        <div>
          <Label>Upload from device</Label>
          <Input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} />
          {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
        </div>
        <div>
          <Label>Or paste image URL</Label>
          <div className="flex gap-2">
            <Input value={photoInput} onChange={e => setPhotoInput(e.target.value)} placeholder="https://..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPhoto(); }}} />
            <Button type="button" onClick={addPhoto} variant="outline"><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
        {form.photos?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {form.photos.map((url: string, i: number) => (
              <div key={i} className="relative group">
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-24 object-cover rounded border" />
                <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Contact Information</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Your Name</Label>
            <Input value={form.owner_name || ''} onChange={e => update('owner_name', e.target.value)} maxLength={100} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.owner_phone || ''} onChange={e => update('owner_phone', e.target.value)} maxLength={30} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.owner_email || ''} onChange={e => update('owner_email', e.target.value)} maxLength={150} />
          </div>
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => navigate('/listings/my')}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {listingId ? 'Update Listing' : 'Submit for Approval'}
        </Button>
      </div>
    </form>
  );
};

export default ListingForm;
