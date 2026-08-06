import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MediaUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  accept: 'image/*' | 'video/*';
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  placeholder?: string;
}

/** Same upload pattern as ImageUploadField, but accepts either images or videos via `accept`. */
const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  label = 'Media',
  value,
  onChange,
  accept,
  bucket = 'media-files',
  folder = 'gallery',
  maxSizeMB = 25,
  placeholder = 'Enter URL or upload from device',
}) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isVideo = accept === 'video/*';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({ title: 'File too large', description: `Max size is ${maxSizeMB}MB`, variant: 'destructive' });
      return;
    }

    const expectedPrefix = isVideo ? 'video/' : 'image/';
    if (!file.type.startsWith(expectedPrefix)) {
      toast({ title: 'Invalid file', description: `Please select a ${isVideo ? 'video' : 'image'} file`, variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      onChange(urlData.publicUrl);
      toast({ title: `${isVideo ? 'Video' : 'Image'} uploaded successfully` });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <input
          type="file"
          ref={fileRef}
          onChange={handleFileSelect}
          accept={accept}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Upload from device"
        >
          {uploading ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange('')} title="Clear">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
        <div className="mt-2">
          {isVideo ? (
            <video src={value} className="h-20 w-auto rounded" muted />
          ) : (
            <img
              src={value}
              alt="Preview"
              className="h-20 w-auto rounded object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUploadField;
