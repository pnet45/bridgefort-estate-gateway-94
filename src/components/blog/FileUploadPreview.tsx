
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface FileUploadPreviewProps {
  previewImage: string | null;
  onFileChange: (file: File | null) => void;
}

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({
  previewImage,
  onFileChange
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image should be less than 3MB",
          variant: "destructive",
        });
        return;
      }
      
      onFileChange(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        // This will be handled in the parent component
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Label htmlFor="featuredImage">Featured Image</Label>
      <Input 
        id="featuredImage"
        type="file"
        onChange={handleFileChange}
        className="mt-1"
        accept="image/*"
      />
      
      {previewImage && (
        <div className="mt-3">
          <p className="text-sm text-gray-500 mb-2">Image Preview</p>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-h-48 rounded-md" 
          />
        </div>
      )}
    </div>
  );
};
