
import React, { useState, useEffect } from 'react';
import { Calendar, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image_path: string;
  created_at: string;
  category: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

// Fallback static posts (will be used if database is empty)
const fallbackPosts = [
  {
    id: '1',
    title: 'Success Summit 2025 - Gearing Up for the Next Real Estate Revolution',
    excerpt: 'Join us for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt with industry leaders and experts.',
    image_path: '/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png',
    created_at: '2025-05-01T00:00:00Z',
    category: 'Training Events',
    profiles: { first_name: 'Dr. Dalvin', last_name: 'Silva' }
  },
  {
    id: '2',
    title: 'Estate Inspection Day - Exploring Our Newest Developments',
    excerpt: 'Explore our newest estates with our expert team. See firsthand the investment opportunities awaiting you.',
    image_path: '/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png',
    created_at: '2025-04-22T00:00:00Z',
    category: 'Estate News',
    profiles: { first_name: 'Precious', last_name: 'Silva' }
  },
  {
    id: '3',
    title: 'Masterclass: Real Estate Sales Strategies for 2025',
    excerpt: 'Learn cutting-edge sales techniques from our top performers in this intensive masterclass designed for both beginners and professionals.',
    image_path: '/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png',
    created_at: '2025-04-15T00:00:00Z',
    category: 'Training Events',
    profiles: { first_name: 'Gideon', last_name: 'Vincent' }
  }
];

// Article sharing function
const shareArticle = (articleId: string, title: string) => {
  const articleUrl = `${window.location.origin}/blog/${articleId}`;
  
  if (navigator.share) {
    navigator.share({
      title: title,
      url: articleUrl
    })
    .catch((error) => console.log('Error sharing:', error));
  } else {
    // Fallback for browsers that don't support the Web Share API
    navigator.clipboard.writeText(articleUrl)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "Article link copied to clipboard",
        });
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  }
};

const BlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          image_path,
          created_at,
          category,
          profiles:author_id (
            first_name,
            last_name
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching posts:', error);
        setBlogPosts(fallbackPosts);
      } else {
        // Transform the data to match our BlogPost interface
        const transformedPosts: BlogPost[] = data && data.length > 0 ? data.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          image_path: post.image_path,
          created_at: post.created_at,
          category: post.category,
          profiles: Array.isArray(post.profiles) && post.profiles.length > 0 
            ? post.profiles[0] 
            : post.profiles || { first_name: 'Unknown', last_name: 'Author' }
        })) : fallbackPosts;
        
        setBlogPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error:', error);
      setBlogPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-10">Latest News & Updates</h2>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-10 text-center">Latest News & Updates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map(post => (
          <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={post.image_path} 
                alt={post.title} 
                className="w-full h-full object-cover transition duration-500 hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-estate-blue text-white text-xs uppercase font-bold py-1 px-3 rounded-full">
                  {post.category}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <Calendar size={14} className="mr-1" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>By {post.profiles?.first_name} {post.profiles?.last_name}</span>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {post.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {post.excerpt}
              </p>
              
              <div className="flex justify-between items-center">
                <Link 
                  to={`/blog/${post.id}`} 
                  className="text-estate-blue font-medium hover:underline inline-flex items-center"
                >
                  Read More 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => shareArticle(post.id, post.title)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Share size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share this article</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <button className="bg-white border border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white font-medium py-2 px-6 rounded-lg transition duration-300">
          Load More Posts
        </button>
      </div>
    </>
  );
};

export default BlogPosts;
