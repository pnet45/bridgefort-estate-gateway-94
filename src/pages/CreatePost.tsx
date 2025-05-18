import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '@/contexts/auth';
import PostForm from '../components/blog/PostForm';
import Footer from '../components/Footer';
import { CATEGORY_OPTIONS, INITIAL_POST } from '../components/blog/PostFormConstants';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug } from '../utils/postUtils';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';

const CreatePost = () => {
  const [post, setPost] = useState(INITIAL_POST);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'You must be logged in to create a post.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const slug = generateSlug(post.title);
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            ...post,
            slug,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: 'Success',
        description: 'Post created successfully!',
      });

      navigate(`/blog/${data.slug}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-semibold mb-4">Create New Post</h1>
        <PostForm
          post={post}
          setPost={setPost}
          onSubmit={handleSubmit}
          loading={loading}
          CATEGORY_OPTIONS={CATEGORY_OPTIONS}
        />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default CreatePost;
