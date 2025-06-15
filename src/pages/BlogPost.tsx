
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogDetail from '@/components/blog/BlogDetail';
import BlogNewsletter from '@/components/blog/BlogNewsletter';
import PhoneContactBar from '@/components/PhoneContactBar';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);

        // 1. Fetch the post itself (NO join)
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .eq('published', true)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('Post not found or not published');
          setPost(null);
        } else {
          setPost(data);
          setError(null);
          // 2. Optionally fetch author profile if author_id exists
          if (data.author_id) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', data.author_id)
              .maybeSingle();
            if (!profileError && profile) {
              setAuthorProfile(profile);
            } else {
              setAuthorProfile(null);
            }
          } else {
            setAuthorProfile(null);
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load the post');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  // Pass author profile to BlogDetail as "profiles"
  let mergedPost = post;
  if (post && authorProfile) {
    mergedPost = { ...post, profiles: authorProfile };
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PhoneContactBar />

      <main className="flex-grow pt-28 pb-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-estate-blue animate-spin" />
          </div>
        ) : error ? (
          <div className="container-custom">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl text-red-800 font-medium mb-2">Error</h2>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : mergedPost ? (
          <>
            <BlogDetail post={mergedPost} />
            <BlogNewsletter />
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;

