import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '@/contexts/auth';
import Footer from '../components/Footer';
import PostForm from '../components/blog/PostForm';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_OPTIONS } from '../components/blog/PostFormConstants';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        console.error("Post ID is missing.");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error fetching post:", error);
          toast({
            title: "Error",
            description: "Failed to load post.",
            variant: "destructive",
          });
        }

        if (data) {
          setPost(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (values: any) => {
    try {
      if (!id) {
        console.error("Post ID is missing.");
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .update({
          ...values,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error("Error updating post:", error);
        toast({
          title: "Error",
          description: "Failed to update post.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Post updated successfully.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error during post update:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!post) {
    return <div className="flex items-center justify-center h-screen">Post not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-semibold mb-4">Edit Post</h1>
        <PostForm
          initialValues={post}
          onSubmit={handleSubmit}
          categoryOptions={CATEGORY_OPTIONS}
        />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default EditPost;
