
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  published: boolean;
  image_path: string | null;
  author_id: string;
}

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Check authentication
    if (!user) {
      toast({
        title: "Access denied",
        description: "You need to be logged in to edit posts.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    // Fetch post data
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Error",
            description: "Post not found",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }
        
        // Check permissions
        if (data.author_id !== user.id && userRole !== 'admin' && userRole !== 'manager') {
          toast({
            title: "Access denied",
            description: "You don't have permission to edit this post",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }
        
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
        setExcerpt(data.excerpt);
        setCategory(data.category || 'General');
        setIsPublished(data.published);
        setCurrentImagePath(data.image_path);
        
        if (data.image_path) {
          if (data.image_path.startsWith('/')) {
            setPreviewImage(data.image_path);
          } else {
            setPreviewImage(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/imagbucket/${data.image_path}`);
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "Failed to load post data",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, user, userRole, navigate]);
  
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
    
    if (!post || !user) return;
    
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
      let imagePath = currentImagePath;
      
      if (fileSelected) {
        // Upload new image
        const fileExt = fileSelected.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('imagbucket')
          .upload(fileName, fileSelected);
          
        if (uploadError) {
          throw uploadError;
        }
        
        imagePath = fileName;
        
        // Delete old image if it exists and isn't a local path
        if (currentImagePath && !currentImagePath.startsWith('/')) {
          await supabase.storage
            .from('imagbucket')
            .remove([currentImagePath]);
        }
      }
      
      const { error } = await supabase
        .from('posts')
        .update({ 
          title, 
          content, 
          excerpt, 
          category, 
          image_path: imagePath,
          published: isPublished,
          updated_at: new Date().toISOString()
        })
        .match({ id });
        
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Post updated successfully",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-4 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-estate-blue mx-auto"></div>
            <p className="mt-4 text-estate-blue">Loading post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-estate-blue">Edit Post</h1>
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
              <Label htmlFor="published" className="ml-2">Published</Label>
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
                {isSubmitting ? 'Saving...' : 'Update Post'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditPost;
