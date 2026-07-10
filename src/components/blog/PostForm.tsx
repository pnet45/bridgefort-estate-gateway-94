
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES } from './PostFormConstants';
import { FileUploadPreview } from './FileUploadPreview';

interface PostFormProps {
  initialValues: {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    isPublished: boolean;
    previewImage: string | null;
  };
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    isPublished: boolean;
    fileSelected: File | null;
  }) => void;
  submitLabel: string;
  cancelLabel: string;
  title: string;
}

export const PostForm: React.FC<PostFormProps> = ({
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel,
  title
}) => {
  const [formValues, setFormValues] = useState({
    title: initialValues.title,
    content: initialValues.content,
    excerpt: initialValues.excerpt,
    category: initialValues.category,
    isPublished: initialValues.isPublished,
  });
  
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(initialValues.previewImage);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFileChange = (file: File | null) => {
    setFileSelected(file);
    
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      ...formValues,
      fileSelected
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-estate-blue">{title}</h1>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-estate-blue text-estate-blue hover:bg-estate-blue/10"
        >
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input 
            id="title"
            name="title"
            value={formValues.title}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="Enter post title"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="excerpt">Excerpt (Brief Summary) *</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            value={formValues.excerpt}
            onChange={handleInputChange}
            className="mt-1 h-24"
            placeholder="Enter a brief summary of the post"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="content">Content *</Label>
          <Textarea 
            id="content"
            name="content"
            value={formValues.content}
            onChange={handleInputChange}
            className="mt-1 min-h-[300px]"
            placeholder="Write your post content here"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            name="category"
            value={formValues.category}
            onChange={handleInputChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estate-blue"
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <FileUploadPreview 
          previewImage={previewImage}
          onFileChange={handleFileChange}
        />
        
        <div className="flex items-center">
          <Input 
            id="isPublished"
            name="isPublished"
            type="checkbox"
            className="w-5 h-5"
            checked={formValues.isPublished}
            onChange={handleCheckboxChange}
          />
          <Label htmlFor="isPublished" className="ml-2">Publish immediately</Label>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            className="border-estate-blue text-estate-blue hover:bg-estate-blue/10"
          >
            {cancelLabel}
          </Button>
          <Button 
            type="submit" 
            className="bg-estate-blue hover:bg-estate-darkBlue"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};
