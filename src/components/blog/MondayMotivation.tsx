import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface MotivationalPost {
  id: string;
  title: string;
  excerpt: string;
  image_path: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const MondayMotivation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [motivationalPosts, setMotivationalPosts] = useState<MotivationalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const postsToShow = 3;
  
  useEffect(() => {
    fetchMotivationalPosts();
  }, []);
  
  const fetchMotivationalPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          image_path,
          created_at,
          profiles:author_id(first_name, last_name)
        `)
        .eq('category', 'Monday Motivation')
        .eq('published', true)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // If we have data from the database, use it
      if (data && data.length > 0) {
        setMotivationalPosts(data as MotivationalPost[]);
      } else {
        // Otherwise, use the fallback data
        const fallbackPosts = [
          {
            id: 'm1',
            title: 'Starting Your Real Estate Journey: First Steps to Success',
            excerpt: 'The first step in any real estate journey is education. Learn about market trends, networking strategies, and how to develop the right mindset for long-term success in this competitive industry.',
            image_path: '/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png',
            created_at: '2025-05-06T12:00:00Z',
            profiles: {
              first_name: 'Dr. Dalvin',
              last_name: 'Silva'
            }
          },
          {
            id: 'm2',
            title: 'Building Resilience in Real Estate Sales',
            excerpt: 'Rejection is part of the process. Learn how top performers transform setbacks into stepping stones and build the mental fortitude needed to thrive in property marketing.',
            image_path: '/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png',
            created_at: '2025-04-29T12:00:00Z',
            profiles: {
              first_name: 'Precious',
              last_name: 'Silva'
            }
          },
          {
            id: 'm3',
            title: 'Time Management Strategies for Real Estate Professionals',
            excerpt: 'Maximize your productivity with proven time management techniques specifically designed for busy real estate agents and property consultants.',
            image_path: '/lovable-uploads/f9bcac5d-3d64-47a5-9da3-0e2fcfd2bb57.png',
            created_at: '2025-04-22T12:00:00Z',
            profiles: {
              first_name: 'Gideon',
              last_name: 'Vincent'
            }
          },
          {
            id: 'm4',
            title: 'Rise and Grind: Real Estate Waits for No One',
            excerpt: 'It\'s Monday – let\'s show up and close strong. In real estate, consistent action and persistent follow-up are the keys to success in this competitive market.',
            image_path: '/lovable-uploads/961fe593-98d7-4b3e-8345-9079d9b163d6.png',
            created_at: '2025-05-13T12:00:00Z',
            profiles: {
              first_name: 'Dr. Dalvin',
              last_name: 'Silva'
            }
          },
          {
            id: 'm5',
            title: 'New Week, Fresh Listings, Fresh Leads',
            excerpt: 'Lagos never sleeps, and neither do we. Let\'s turn site visits into signed deals. Stay sharp, stay selling in this dynamic real estate market.',
            image_path: '/lovable-uploads/c46fb41f-b745-4000-839c-c31bc4f12653.png',
            created_at: '2025-05-20T12:00:00Z',
            profiles: {
              first_name: 'Precious',
              last_name: 'Silva'
            }
          }
        ];
        
        setMotivationalPosts(fallbackPosts as MotivationalPost[]);
      }
    } catch (error) {
      console.error('Error fetching motivational posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (motivationalPosts.length <= postsToShow) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        // Calculate next index while ensuring we don't exceed array boundaries
        const nextIndex = prevIndex + 1;
        const maxStartIndex = motivationalPosts.length - postsToShow;
        return nextIndex > maxStartIndex ? 0 : nextIndex;
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, [motivationalPosts]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-estate-blue/5 to-estate-blue/10">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-10 text-center">Monday Motivation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (motivationalPosts.length === 0) {
    return null;
  }
  
  const visiblePosts = motivationalPosts.slice(currentIndex, currentIndex + postsToShow);
  if (visiblePosts.length < postsToShow && motivationalPosts.length >= postsToShow) {
    // Fill in with posts from the beginning if we don't have enough
    const remainingPosts = postsToShow - visiblePosts.length;
    visiblePosts.push(...motivationalPosts.slice(0, remainingPosts));
  }

  return (
    <section className="py-16 bg-gradient-to-r from-estate-blue/5 to-estate-blue/10 overflow-hidden">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-10 text-center">Monday Motivation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visiblePosts.map((post, index) => {
            const imageSrc = post.image_path.startsWith('/') 
              ? post.image_path 
              : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/post_images/${post.image_path}`;
              
            return (
              <div 
                key={post.id} 
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-500 transform hover:scale-105"
                style={{
                  animation: `${index === 0 ? 'slideInFromLeft' : index === 2 ? 'slideInFromRight' : 'scaleIn'} 0.5s ease-out`
                }}
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={imageSrc} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(post.created_at)}</span>
                    <span className="mx-2">•</span>
                    <span>By {post.profiles.first_name} {post.profiles.last_name}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <Link 
                    to={`/blog/${post.id}`} 
                    className="text-estate-blue font-medium hover:underline inline-flex items-center"
                  >
                    Read More 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        {motivationalPosts.length > postsToShow && (
          <div className="flex justify-center mt-8">
            {Array.from({ length: motivationalPosts.length - postsToShow + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 w-8 mx-1 rounded-full ${
                  currentIndex === idx ? 'bg-estate-blue' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <style>
        {`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        `}
      </style>
    </section>
  );
};

export default MondayMotivation;
