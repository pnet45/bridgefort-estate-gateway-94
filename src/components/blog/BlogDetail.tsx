
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '../Navbar';
import Footer from '../Footer';

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            excerpt,
            image_path,
            created_at,
            category,
            profiles:author_id(first_name, last_name)
          `)
          .eq('id', id)
          .eq('published', true)
          .single();

        if (error) throw error;
        
        if (!data) {
          setError('Post not found or not published');
          return;
        }
        
        setPost(data);
      } catch (error: any) {
        console.error('Error fetching blog post:', error);
        setError(error.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-custom my-24 pt-10 animate-pulse">
          <div className="h-8 w-3/4 bg-gray-200 rounded mb-6"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded mb-10"></div>
          <div className="h-80 bg-gray-200 rounded mb-10"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Navbar />
        <div className="container-custom my-24 pt-10 text-center">
          <div className="max-w-lg mx-auto bg-white p-8 shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Post Not Found</h2>
            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or is not published.</p>
            <Button 
              onClick={() => navigate('/blog')}
              className="bg-estate-blue hover:bg-estate-darkBlue"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };
  
  const imageSrc = post.image_path ? (
    post.image_path.startsWith('/') 
      ? post.image_path
      : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/imagbucket/${post.image_path}`
  ) : '/placeholder.svg';

  return (
    <>
      <Navbar />
      <article className="container-custom my-24 pt-10">
        <div className="mb-8">
          <Button 
            variant="outline"
            onClick={() => navigate('/blog')}
            className="mb-6 text-estate-blue border-estate-blue hover:bg-estate-blue/10"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-estate-blue">{post.title}</h1>
          
          <div className="flex items-center text-gray-500 mb-8">
            <Calendar size={16} className="mr-1" />
            <span>{formatDate(post.created_at)}</span>
            <span className="mx-2">•</span>
            <span>By {post.profiles.first_name} {post.profiles.last_name}</span>
            <span className="mx-2">•</span>
            <span>{post.category}</span>
          </div>
        </div>
        
        <div className="relative h-[300px] md:h-[500px] w-full mb-10 overflow-hidden rounded-lg shadow-lg">
          <img 
            src={imageSrc}
            alt={post.title} 
            className="w-full h-full object-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
        
        <div className="prose prose-lg max-w-none">
          {post.content.split('\n').map((paragraph: string, index: number) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200">
          <Button 
            variant="outline"
            onClick={() => navigate('/blog')}
            className="text-estate-blue border-estate-blue hover:bg-estate-blue/10"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </article>
      <Footer />
    </>
  );
};

export default BlogDetail;
