
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const CATEGORIES = [
  'Monday Motivation',
  'Real Estate Tips',
  'Investment Advice',
  'News',
  'Events',
  'General'
];

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('General');
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated or not authorized
    if (!user) {
      toast({
        title: "Access denied",
        description: "You need to be logged in to create posts.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [user, navigate]);

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
      
      setFileSelected(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    if (!title || !content || !excerpt) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imagePath = null;
      
      if (fileSelected) {
        const fileExt = fileSelected.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('imagbucket')
          .upload(fileName, fileSelected);
        
        if (uploadError) {
          throw uploadError;
        }
        
        imagePath = fileName;
      }
      
      const { error } = await supabase
        .from('posts')
        .insert([{
          title,
          content,
          excerpt, 
          category,
          author_id: user.id,
          image_path: imagePath,
          published: isPublished
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: isPublished ? "Post published successfully" : "Draft saved successfully",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-estate-blue">Create New Post</h1>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="border-estate-blue text-estate-blue hover:bg-estate-blue/10"
            >
              Cancel
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input 
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
                placeholder="Enter post title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="excerpt">Excerpt (Brief Summary) *</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mt-1 h-24"
                placeholder="Enter a brief summary of the post"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea 
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 min-h-[300px]"
                placeholder="Write your post content here"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-estate-blue"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
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
            
            <div className="flex items-center">
              <Input 
                id="published"
                type="checkbox"
                className="w-5 h-5"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <Label htmlFor="published" className="ml-2">Publish immediately</Label>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-estate-blue text-estate-blue hover:bg-estate-blue/10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-estate-blue hover:bg-estate-darkBlue"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isPublished ? 'Publish Post' : 'Save Draft'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreatePost;
