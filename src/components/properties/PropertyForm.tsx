
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Estate, EstateFormData } from '@/types/estate';
import { X, Upload, Loader2 } from 'lucide-react';

interface PropertyFormProps {
  estate?: Estate;
  onCancel: () => void;
  onSuccess: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ estate, onCancel, onSuccess }) => {
  const isEditing = !!estate;
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    media_files: []
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (estate) {
      setFormData({
        ...estate,
        media_files: []
      });
      setPreviewImages(estate.media || []);
    }
  }, [estate]);

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
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Generate preview URLs for selected files
      const filePreviewURLs = newFiles.map(file => URL.createObjectURL(file));
      
      setPreviewImages(prev => [...prev, ...filePreviewURLs]);
      setFormData(prev => ({
        ...prev,
        media_files: [...(prev.media_files || []), ...newFiles]
      }));
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
    
    setIsSubmitting(true);
    
    try {
      // Upload new files if any
      let allMedia = [...(formData.media || [])];
      
      if (formData.media_files && formData.media_files.length > 0) {
        const uploadedUrls = await uploadFiles(formData.media_files);
        allMedia = [...allMedia, ...uploadedUrls];
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
        sub_form: formData.sub_form,
        media: allMedia
      };
      
      if (isEditing && estate) {
        // Update existing estate
        const { error } = await supabase
          .from('estate')
          .update(estateData)
          .eq('id', estate.id);
          
        if (error) throw error;
        
        toast({
          title: "Estate updated",
          description: `${formData.name} has been updated successfully`
        });
      } else {
        // Create new estate
        const { error } = await supabase
          .from('estate')
          .insert(estateData);
          
        if (error) throw error;
        
        toast({
          title: "Estate created",
          description: `${formData.name} has been created successfully`
        });
      }
      
      onSuccess();
      
    } catch (error: any) {
      console.error("Error saving estate:", error);
      toast({
        title: "Error saving estate",
        description: error.message || "An error occurred while saving the estate",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
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
            <Label htmlFor="size">Size (sqm)</Label>
            <Input 
              id="size" 
              name="size" 
              type="number"
              min="0"
              value={formData.size || ''} 
              onChange={handleNumberInputChange} 
              placeholder="Enter size in square meters" 
            />
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            id="description" 
            name="description" 
            value={formData.description || ''} 
            onChange={handleInputChange} 
            placeholder="Enter property description" 
            className="h-32"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sub_form">Subscription Form Link</Label>
          <Input 
            id="sub_form" 
            name="sub_form" 
            value={formData.sub_form || ''} 
            onChange={handleInputChange} 
            placeholder="Enter subscription form link" 
          />
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
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-md cursor-pointer hover:border-estate-blue relative">
              <input 
                type="file" 
                accept="image/*,video/*" 
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <Upload size={24} className="text-gray-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Upload images and videos of the property</p>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
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
