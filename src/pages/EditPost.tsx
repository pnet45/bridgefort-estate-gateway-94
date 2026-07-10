
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Toaster } from '@/components/ui/toaster';
import { PostForm } from '@/components/blog/PostForm';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIES } from '../components/blog/PostFormConstants';
import { useAuth } from '@/contexts/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const EditPost = () => {
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      if (!id) {
        navigate('/dashboard');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data.author_id !== user.id) {
          toast({
            title: "Unauthorized",
            description: "You do not have permission to edit this post",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }

        setPost(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error fetching post",
          variant: "destructive"
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleSubmit = async (values: {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    isPublished: boolean;
    fileSelected: File | null;
  }) => {
    if (!user || !post) return;

    setIsSubmitting(true);

    try {
      let imagePath = post.image_path;

      // Upload new image if provided
      if (values.fileSelected) {
        const fileExt = values.fileSelected.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `blog/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, values.fileSelected);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from('public').getPublicUrl(filePath);
        imagePath = data.publicUrl;
      }

      // Update post
      const { error } = await supabase
        .from('posts')
        .update({
          title: values.title,
          content: values.content,
          excerpt: values.excerpt,
          category: values.category,
          published: values.isPublished,
          image_path: imagePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Post Updated",
        description: "Your post has been updated successfully"
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the post",
        variant: "destructive"
      });
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateInitialValues = () => {
    if (!post) return null;

    return {
      title: post.title || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      category: post.category || CATEGORIES[0],
      isPublished: post.published || false,
      previewImage: post.image_path || null
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-28 pb-12">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-estate-blue mx-auto" />
            <p className="mt-4 text-gray-500">Loading post...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initialValues = generateInitialValues();
  if (!initialValues) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12">
        <div className="container-custom">
          <PostForm
            initialValues={initialValues}
            onCancel={() => navigate('/dashboard')}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Post"
            cancelLabel="Cancel"
            title="Edit Blog Post"
          />
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
};

export default EditPost;
