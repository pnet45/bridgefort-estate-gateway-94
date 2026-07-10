
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Toaster } from '@/components/ui/toaster';
import { PostForm } from '@/components/blog/PostForm';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIES, INITIAL_POST } from '../components/blog/PostFormConstants';
import { useAuth } from '@/contexts/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from '@/hooks/use-toast';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const CreatePost = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (values: {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    isPublished: boolean;
    fileSelected: File | null;
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a post",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      let imagePath = null;

      // Upload image if provided
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

      // Create post
      const { error } = await supabase.from('posts').insert({
        title: values.title,
        content: values.content,
        excerpt: values.excerpt,
        category: values.category,
        published: values.isPublished,
        author_id: user.id,
        image_path: imagePath,
        slug: generateSlug(values.title),
      });

      if (error) throw error;

      toast({
        title: "Post Created",
        description: "Your post has been created successfully"
      });

      navigate('/blog');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the post",
        variant: "destructive"
      });
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12">
        <div className="container-custom">
          <PostForm
            initialValues={INITIAL_POST}
            onCancel={() => navigate('/dashboard')}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Create Post"
            cancelLabel="Cancel"
            title="Create New Blog Post"
          />
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
};

export default CreatePost;
