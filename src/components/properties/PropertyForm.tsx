
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Estate, EstateFormData } from '@/types/estate';
import { X, Upload, Loader2, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface DocPricing {
  deed_of_assignment: number;
  survey_plan: number;
  plot_demarcation: number;
  plot_maintenance_fee: number | null;
}

interface PropertyFormProps {
  estate?: Estate;
  onCancel: () => void;
  onSuccess: () => void;
  /** Seeds category/listing-type fields when creating a new (non-editing) listing,
   *  e.g. from the "Create Content" shortcuts on the Homes Sales / Apartments tabs. */
  initialCategory?: {
    property_category: EstateFormData['property_category'];
    is_for_sale?: boolean;
    is_for_rent?: boolean;
  };
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ estate, onCancel, onSuccess, initialCategory }) => {
  const isEditing = !!estate;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subscriptionFileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  // Parent admin screens may recreate the estate object during unrelated renders.
  // Hydrate only when the selected estate identity changes, never on file selection.
  const estateRef = useRef(estate);
  estateRef.current = estate;
  const initialCategoryRef = useRef(initialCategory);
  initialCategoryRef.current = initialCategory;
  const initializedFormKey = useRef<string | null>(null);
  const [formData, setFormData] = useState<EstateFormData>({
    name: '',
    location: '',
    phase: undefined,
    scheme: undefined,
    size: undefined,
    promo_price: undefined,
    prelaunch_price: undefined,
    actual_price: undefined,
    title: '',
    type: 'Land',
    description: '',
    sub_form: '',
    media: [],
    media_files: [],
    property_category: 'land',
    bedrooms: undefined,
    bathrooms: undefined,
    is_for_sale: true,
    is_for_rent: false,
    monthly_rent: undefined,
    annual_rent: undefined,
    total_plots: undefined,
    sold_plots: undefined,
  });
  const [sizeUnit, setSizeUnit] = useState('sqm');
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [subscriptionFile, setSubscriptionFile] = useState<File | null>(null);
  const [existingSubFormUrl, setExistingSubFormUrl] = useState<string>('');
  const [uploadingSubForm, setUploadingSubForm] = useState(false);
  const [docPricing, setDocPricing] = useState<DocPricing>({
    deed_of_assignment: 0,
    survey_plan: 0,
    plot_demarcation: 0,
    plot_maintenance_fee: null,
  });

  useEffect(() => {
    const currentEstate = estateRef.current;
    const currentCategory = initialCategoryRef.current;

    if (currentEstate) {
      if (initializedFormKey.current === currentEstate.id) return;
      initializedFormKey.current = currentEstate.id;
      setFormData({
        ...currentEstate,
        media_files: []
      });
      setPreviewImages(currentEstate.media || []);
      setExistingSubFormUrl(currentEstate.sub_form || '');
      setSizeUnit((currentEstate as any).size_unit || 'sqm');
      setIsSoldOut((currentEstate as any).is_sold_out || false);
      void fetchDocPricing(currentEstate.id);
      return;
    }

    const newFormKey = `new:${currentCategory?.property_category || 'default'}`;
    if (initializedFormKey.current === newFormKey) return;
    initializedFormKey.current = newFormKey;
    if (currentCategory) {
      setFormData(prev => ({
        ...prev,
        property_category: currentCategory.property_category,
        is_for_sale: currentCategory.is_for_sale ?? prev.is_for_sale,
        is_for_rent: currentCategory.is_for_rent ?? prev.is_for_rent,
      }));
    }
  }, [estate?.id, initialCategory?.property_category, initialCategory?.is_for_sale, initialCategory?.is_for_rent]);

  const fetchDocPricing = async (estateId: string) => {
    try {
      const { data } = await supabase
        .from('estate_doc_pricing')
        .select('*')
        .eq('estate_id', estateId)
        .single();
      if (data) {
        setDocPricing({
          deed_of_assignment: data.deed_of_assignment || 0,
          survey_plan: data.survey_plan || 0,
          plot_demarcation: data.plot_demarcation || 0,
          plot_maintenance_fee: data.plot_maintenance_fee,
        });
      }
    } catch (err) {
      // No pricing set yet
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const input = e.currentTarget;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      
      // Generate preview URLs for selected files
      const filePreviewURLs = newFiles.map(file => URL.createObjectURL(file));
      
      setPreviewImages(prev => [...prev, ...filePreviewURLs]);
      setFormData(prev => ({
        ...prev,
        media_files: [...(prev.media_files || []), ...newFiles]
      }));
      // The File objects are now held in form state; clearing the native
      // picker prevents stale selections without discarding the form draft.
      input.value = '';
    }
  };

  const removeImage = (index: number) => {
    // For new files, remove from preview and media_files
    if (index >= (formData.media?.length || 0)) {
      const newPreviewImages = [...previewImages];
      const newMediaFiles = [...(formData.media_files || [])];
      
      // Release object URL to prevent memory leaks
      URL.revokeObjectURL(newPreviewImages[index]);
      
      newPreviewImages.splice(index, 1);
      newMediaFiles.splice(index - (formData.media?.length || 0), 1);
      
      setPreviewImages(newPreviewImages);
      setFormData(prev => ({
        ...prev,
        media_files: newMediaFiles
      }));
    } 
    // For existing files, remove from media array
    else if (formData.media) {
      const newMedia = [...formData.media];
      const removedUrl = newMedia.splice(index, 1)[0];
      
      setPreviewImages(prev => prev.filter(url => url !== removedUrl));
      setFormData(prev => ({
        ...prev,
        media: newMedia
      }));
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];
    
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `estates/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('public')
        .upload(filePath, file);
        
      if (uploadError) {
        toast({
          title: "Error uploading file",
          description: uploadError.message,
          variant: "destructive"
        });
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(filePath);
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if ((formData.sold_plots ?? 0) > (formData.total_plots ?? 0) && (formData.total_plots ?? 0) > 0) {
      toast({ title: 'Check plot inventory', description: 'Sold plots cannot be greater than total plots.', variant: 'destructive' });
      return;
    }
    if (formData.promo_price && formData.actual_price && formData.promo_price > formData.actual_price) {
      toast({ title: 'Check pricing', description: 'Promo price should not be higher than the actual price.', variant: 'destructive' });
      return;
    }
    if (formData.prelaunch_price && formData.actual_price && formData.prelaunch_price > formData.actual_price) {
      toast({ title: 'Check pricing', description: 'Pre-launch price should not be higher than the actual price.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Upload new files if any
      let allMedia = [...(formData.media || [])];
      
      if (formData.media_files && formData.media_files.length > 0) {
        const uploadedUrls = await uploadFiles(formData.media_files);
        allMedia = [...allMedia, ...uploadedUrls];
      }

      // Upload subscription form PDF if selected
      let subFormUrl = formData.sub_form || existingSubFormUrl || '';
      if (subscriptionFile) {
        const fileExt = subscriptionFile.name.split('.').pop();
        const fileName = `subscription-forms/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(fileName, subscriptionFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl(fileName);
        subFormUrl = publicUrl;
      }
      
      const estateData = {
        name: formData.name,
        location: formData.location,
        phase: formData.phase,
        scheme: formData.scheme,
        size: formData.size,
        promo_price: formData.promo_price,
        prelaunch_price: formData.prelaunch_price,
        actual_price: formData.actual_price,
        title: formData.title,
        type: formData.type,
        description: formData.description,
        sub_form: subFormUrl,
        media: allMedia,
        property_category: formData.property_category,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        is_for_sale: formData.is_for_sale,
        is_for_rent: formData.is_for_rent,
        monthly_rent: formData.monthly_rent,
        annual_rent: formData.annual_rent,
        total_plots: formData.total_plots,
        sold_plots: formData.sold_plots,
        size_unit: sizeUnit,
        is_sold_out: isSoldOut,
      };
      
      let savedEstateId = estate?.id;

      if (isEditing && estate) {
        const { error } = await supabase
          .from('estate')
          .update(estateData)
          .eq('id', estate.id);
        if (error) throw error;
        savedEstateId = estate.id;
        toast({
          title: "Estate updated",
          description: `${formData.name} has been updated successfully`
        });
      } else {
        const { data: newEstate, error } = await supabase
          .from('estate')
          .insert(estateData)
          .select('id')
          .single();
        if (error) throw error;
        savedEstateId = newEstate?.id;
        toast({
          title: "Estate created",
          description: `${formData.name} has been created successfully`
        });
      }

      // Save documentation pricing
      if (savedEstateId && (docPricing.deed_of_assignment || docPricing.survey_plan || docPricing.plot_demarcation || docPricing.plot_maintenance_fee)) {
        const { error: pricingError } = await supabase
          .from('estate_doc_pricing')
          .upsert({
            estate_id: savedEstateId,
            deed_of_assignment: docPricing.deed_of_assignment,
            survey_plan: docPricing.survey_plan,
            plot_demarcation: docPricing.plot_demarcation,
            plot_maintenance_fee: docPricing.plot_maintenance_fee,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'estate_id' });
        if (pricingError) console.error('Error saving doc pricing:', pricingError);
      }
      
      onSuccess();
      
    } catch (error: any) {
      console.error("Error saving estate:", error);
      toast({
        title: "Error saving estate",
        description: error.message || "We couldn't save this property. Check your connection and try again — if it keeps happening, contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-estate-blue">
          {isEditing ? `Edit ${estate.name}` : 'Add New Property'}
        </h2>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name *</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="Enter property name" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input 
              id="location" 
              name="location" 
              value={formData.location || ''} 
              onChange={handleInputChange} 
              placeholder="Enter location" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phase">Phase</Label>
            <Select 
              value={formData.phase?.toString()} 
              onValueChange={(value) => handleSelectChange('phase', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Phase 1</SelectItem>
                <SelectItem value="2">Phase 2</SelectItem>
                <SelectItem value="3">Phase 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scheme">Scheme</Label>
            <Select 
              value={formData.scheme?.toString()} 
              onValueChange={(value) => handleSelectChange('scheme', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Scheme 1</SelectItem>
                <SelectItem value="2">Scheme 2</SelectItem>
                <SelectItem value="3">Scheme 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <div className="flex gap-2">
              <Input 
                id="size" 
                name="size" 
                type="number"
                min="0"
                value={formData.size || ''} 
                onChange={handleNumberInputChange} 
                placeholder="Enter size" 
                className="flex-1"
              />
              <Select value={sizeUnit} onValueChange={setSizeUnit}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqm">SQM</SelectItem>
                  <SelectItem value="sqft">SQFT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Property Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Land">Land</SelectItem>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_category">Property Category *</Label>
            <Select 
              value={formData.property_category || 'land'} 
              onValueChange={(value) => setFormData({...formData, property_category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="land">Estate Land</SelectItem>
                <SelectItem value="home">Home (Sale)</SelectItem>
                <SelectItem value="rental">Apartment (Rent)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="promo_price">Promo Price (₦)</Label>
            <Input 
              id="promo_price" 
              name="promo_price" 
              type="number"
              min="0"
              value={formData.promo_price || ''} 
              onChange={handleNumberInputChange} 
              placeholder="Enter promo price" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prelaunch_price">Pre-launch Price (₦)</Label>
            <Input 
              id="prelaunch_price" 
              name="prelaunch_price" 
              type="number"
              min="0"
              value={formData.prelaunch_price || ''} 
              onChange={handleNumberInputChange} 
              placeholder="Enter pre-launch price" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="actual_price">Actual Price (₦)</Label>
            <Input 
              id="actual_price" 
              name="actual_price" 
              type="number"
              min="0"
              value={formData.actual_price || ''} 
              onChange={handleNumberInputChange} 
              placeholder="Enter actual price" 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            name="title" 
            value={formData.title || ''} 
            onChange={handleInputChange} 
            placeholder="Enter title (e.g., Premium Plot)" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
          maxLength={3000} 
            id="description" 
            name="description" 
            value={formData.description || ''} 
            onChange={handleInputChange} 
            placeholder="Enter property description" 
            className="h-32"
          />
        </div>
        
        {/* Home/Rental specific fields */}
        {(formData.property_category === 'home' || formData.property_category === 'rental') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-estate-blue md:col-span-2">Home/Apartment Details</h3>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min="0" value={formData.bedrooms || ''} onChange={handleNumberInputChange} placeholder="Number of bedrooms" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min="0" value={formData.bathrooms || ''} onChange={handleNumberInputChange} placeholder="Number of bathrooms" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_plots">Total Units</Label>
              <Input id="total_plots" name="total_plots" type="number" min="0" value={formData.total_plots || ''} onChange={handleNumberInputChange} placeholder="Total units available" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sold_plots">Sold Units</Label>
              <Input id="sold_plots" name="sold_plots" type="number" min="0" value={formData.sold_plots || ''} onChange={handleNumberInputChange} placeholder="Units already sold" />
            </div>
            {formData.property_category === 'rental' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="monthly_rent">Monthly Rent (₦)</Label>
                  <Input id="monthly_rent" name="monthly_rent" type="number" min="0" value={formData.monthly_rent || ''} onChange={handleNumberInputChange} placeholder="Monthly rent amount" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_rent">Annual Rent (₦)</Label>
                  <Input id="annual_rent" name="annual_rent" type="number" min="0" value={formData.annual_rent || ''} onChange={handleNumberInputChange} placeholder="Annual rent amount" />
                </div>
              </>
            )}
          </div>
        )}

        {/* Land specific fields */}
        {formData.property_category === 'land' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="total_plots">Total Plots</Label>
              <Input id="total_plots" name="total_plots" type="number" min="0" value={formData.total_plots || ''} onChange={handleNumberInputChange} placeholder="Total plots" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sold_plots">Sold Plots</Label>
              <Input id="sold_plots" name="sold_plots" type="number" min="0" value={formData.sold_plots || ''} onChange={handleNumberInputChange} placeholder="Sold plots" />
            </div>
          </div>
        )}

        {/* Sold Out Toggle */}
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <Switch checked={isSoldOut} onCheckedChange={setIsSoldOut} />
          <div>
            <Label className="text-sm font-semibold text-red-700">Mark as Sold Out</Label>
            <p className="text-xs text-red-500">When sold out, new purchases are disabled but existing clients can still complete payments.</p>
          </div>
        </div>

        {/* Subscription Form Upload */}
        <div className="space-y-2">
          <Label>Subscription Form (PDF)</Label>
          {existingSubFormUrl && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <FileText className="h-4 w-4 text-primary" />
              <a href={existingSubFormUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline truncate">
                Current form uploaded
              </a>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setExistingSubFormUrl(''); setFormData(prev => ({ ...prev, sub_form: '' })); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-3 rounded-md border-2 border-dashed border-muted-foreground/30 p-3 transition-colors hover:border-primary">
              <input
                ref={subscriptionFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const selectedFile = e.currentTarget.files?.[0] || null;
                  if (selectedFile) setSubscriptionFile(selectedFile);
                  e.currentTarget.value = '';
                }}
                className="sr-only"
                aria-label="Choose estate subscription PDF"
              />
              <Button type="button" variant="outline" onClick={() => subscriptionFileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Choose PDF
              </Button>
              <span className="min-w-0 break-all text-sm text-muted-foreground">{subscriptionFile ? subscriptionFile.name : 'No new PDF selected'}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Upload a PDF subscription form for this estate. Users will be able to download it.</p>
        </div>

        {/* Documentation Pricing */}
        <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="text-lg font-semibold text-estate-blue flex items-center gap-2">
            <FileText className="h-5 w-5" /> Documentation Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deed of Assignment (₦)</Label>
              <Input
                type="number"
                min="0"
                value={docPricing.deed_of_assignment || ''}
                onChange={(e) => setDocPricing(prev => ({ ...prev, deed_of_assignment: Number(e.target.value) || 0 }))}
                placeholder="e.g. 250000"
              />
            </div>
            <div className="space-y-2">
              <Label>Survey Plan (₦)</Label>
              <Input
                type="number"
                min="0"
                value={docPricing.survey_plan || ''}
                onChange={(e) => setDocPricing(prev => ({ ...prev, survey_plan: Number(e.target.value) || 0 }))}
                placeholder="e.g. 150000"
              />
            </div>
            <div className="space-y-2">
              <Label>Plot Demarcation (₦)</Label>
              <Input
                type="number"
                min="0"
                value={docPricing.plot_demarcation || ''}
                onChange={(e) => setDocPricing(prev => ({ ...prev, plot_demarcation: Number(e.target.value) || 0 }))}
                placeholder="e.g. 100000"
              />
            </div>
            <div className="space-y-2">
              <Label>Plot Maintenance Fee (₦) <span className="text-xs text-muted-foreground">(Optional)</span></Label>
              <Input
                type="number"
                min="0"
                value={docPricing.plot_maintenance_fee ?? ''}
                onChange={(e) => setDocPricing(prev => ({ ...prev, plot_maintenance_fee: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="block">Media</Label>
          <div className="flex flex-wrap gap-4">
            {previewImages.map((url, index) => (
              <div key={index} className="relative w-24 h-24">
                <img 
                  src={url} 
                  alt={`Preview ${index}`} 
                  className="w-full h-full object-cover rounded-md border"
                />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-90"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <input
              ref={mediaFileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onClick={(event) => event.stopPropagation()}
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Choose property images and videos"
            />
            <Button type="button" variant="outline" className="h-24 w-24 flex-col gap-2 rounded-md border-2 border-dashed" onClick={() => mediaFileInputRef.current?.click()}>
              <Upload size={22} />
              <span className="text-xs">Add media</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Upload images and videos of the property</p>
        </div>
        
        <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="bg-estate-blue hover:bg-estate-darkBlue"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Property' : 'Create Property'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
