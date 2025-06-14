import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, CalendarIcon, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import SocialShareButtons from './SocialShareButtons';

interface BlogDetailProps {
  post: any;
}

const BlogDetail = ({ post }: BlogDetailProps) => {
  const navigate = useNavigate();
  const [currentUrl, setCurrentUrl] = useState("");
  const [articleContent, setArticleContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Fetch article content if missing or too short (less than 400 chars)
  useEffect(() => {
    const fetchAIContent = async () => {
      if (!post?.content || post.content.length < 400) {
        setIsGenerating(true);
        try {
          const response = await fetch('/functions/v1/generate-blog-article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: post?.title || 'Real Estate Insights' })
          });
          const data = await response.json();
          setArticleContent(data.generatedArticle || data.article || data.text || "An error occurred.");
        } catch (e) {
          setArticleContent("Unable to generate article at this time.");
        } finally {
          setIsGenerating(false);
        }
      } else {
        setArticleContent(null);
      }
    };
    fetchAIContent();
  }, [post?.content, post?.title]);

  if (!post) return <div>No post found</div>;

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMMM dd, yyyy');
    } catch (error) {
      return "Unknown date";
    }
  };

  // Create author initials from the post author
  const getAuthorInitials = () => {
    if (post.profiles?.first_name && post.profiles?.last_name) {
      return `${post.profiles.first_name[0]}${post.profiles.last_name[0]}`;
    }
    return 'AU';
  };

  // Combine first and last name for display
  const authorName = post.profiles 
    ? `${post.profiles.first_name || ''} ${post.profiles.last_name || ''}`.trim() 
    : 'Anonymous';

  // Generate a lorem ipsum article if content is missing
  const generateArticleContent = () => {
    if (post.content && post.content.length > 300) return post.content;
    
    return `
      <p>The real estate industry in Nigeria continues to evolve, presenting numerous opportunities for investors and homebuyers alike. With the country's growing population and increasing urbanization, demand for quality housing and commercial properties remains strong despite economic challenges.</p>
      
      <h2>Market Trends and Opportunities</h2>
      <p>Nigeria's real estate sector has seen significant development in recent years, particularly in major urban centers like Lagos, Abuja, and Port Harcourt. The demand for affordable housing solutions continues to outstrip supply, creating opportunities for developers who can deliver quality projects at competitive prices.</p>
      
      <p>Investment in real estate remains attractive due to:</p>
      <ul>
        <li>Long-term appreciation potential</li>
        <li>Rental income opportunities</li>
        <li>Protection against inflation</li>
        <li>Portfolio diversification</li>
      </ul>
      
      <h2>Challenges in the Market</h2>
      <p>Despite these opportunities, the sector faces several challenges, including:</p>
      <ul>
        <li>High construction costs</li>
        <li>Limited access to affordable financing</li>
        <li>Complex land documentation processes</li>
        <li>Infrastructure deficits</li>
      </ul>
      
      <h2>The Future of Real Estate in Nigeria</h2>
      <p>Looking ahead, technology is expected to play an increasingly important role in transforming the real estate landscape. Digital platforms for property listings, virtual tours, and online transactions are making the market more accessible and transparent.</p>
      
      <p>Additionally, sustainable and eco-friendly building practices are gaining traction, reflecting growing awareness of environmental concerns and the need for energy-efficient solutions in a country with persistent power challenges.</p>
      
      <h2>Conclusion</h2>
      <p>For those considering real estate investments in Nigeria, thorough research, due diligence on property titles, and working with reputable developers and agents remain essential strategies for success. Despite challenges, the fundamental drivers of demand in Nigeria's real estate market suggest continued growth and opportunity in the years ahead.</p>
    `;
  };

  return (
    <article className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Back button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back to Blog
        </Button>
      </div>

      {/* Post image */}
      {post.image_path && (
        <div className="mb-6">
          <img
            src={post.image_path}
            alt={post.title}
            className="w-full h-72 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Post header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{getAuthorInitials()}</AvatarFallback>
            </Avatar>
            <span>{authorName}</span>
          </div>
          
          <div className="flex items-center">
            <CalendarIcon size={16} className="mr-1" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          
          {post.category && (
            <div className="flex items-center">
              <Tag size={16} className="mr-1" />
              <span>{post.category}</span>
            </div>
          )}
        </div>

        {/* Social share buttons */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Share this article:</p>
          <SocialShareButtons title={post.title} url={currentUrl} />
        </div>
      </div>

      {/* Post excerpt */}
      {post.excerpt && (
        <div className="mb-6">
          <p className="text-lg text-gray-700 italic">{post.excerpt}</p>
        </div>
      )}

      {/* Post content in scrollable area */}
      <ScrollArea className="h-[500px] rounded-md border p-4">
        <div className="post-content">
          {isGenerating && (
            <div className="text-gray-400 italic mb-3">
              Generating article using AI...
            </div>
          )}
          <div
            dangerouslySetInnerHTML={{
              __html:
                articleContent !== null
                  ? articleContent
                  : post.content || generateArticleContent()
            }}
          />
        </div>
      </ScrollArea>

      {/* Social share buttons (bottom) */}
      <div className="mt-8 pt-4 border-t">
        <p className="text-sm text-gray-500 mb-2">Share this article:</p>
        <SocialShareButtons title={post.title} url={currentUrl} />
      </div>
    </article>
  );
};

export default BlogDetail;
