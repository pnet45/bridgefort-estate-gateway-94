
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SocialShareButtons from './SocialShareButtons';

/**
 * Placeholders you can use:
 * - /lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png
 * - /lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png
 * - /lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png
 */

interface BlogDetailProps {
  post: any;
}

const BlogDetail = ({ post }: BlogDetailProps) => {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  if (!post) return <div>No post found</div>;

  // Author initials and name helpers
  const getAuthorInitials = () => {
    if (post.profiles?.first_name && post.profiles?.last_name) {
      return `${post.profiles.first_name[0]}${post.profiles.last_name[0]}`;
    }
    return 'AU';
  };
  const authorName = post.profiles
    ? `${post.profiles.first_name || ''} ${post.profiles.last_name || ''}`.trim()
    : 'Anonymous';

  // Format date helper
  const formatDate = (date: string) => {
    const d = new Date(date);
    if (isNaN(d as any)) return 'Unknown date';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Custom post content with nice alignment and images
  const getContentWithImages = () => {
    // Use real post.content if available, but decorate further if you wish
    let html = post.content || '';
    // If content is short/lacking, supply our custom content with embedded images
    if (!html || html.length < 300) {
      html = `
        <p>
          <img src="/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png" alt="Summit Event" class="rounded-lg w-full md:w-2/3 mx-auto mb-6 shadow-md" />
          The Nigerian real estate industry is entering a new era with exciting opportunities for buyers and investors. As urban populations rise, housing demand continues to intensify in key cities.
        </p>
        <p>
          Sustainable property development, smart communities, and digital-led services are reshaping the landscape.
        </p>
        <img src="/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png" alt="Estate Tour" class="rounded-lg w-full md:w-2/3 mx-auto my-7 shadow-md" />
        <h2 class="text-2xl font-semibold mt-10 mb-3">Major Trends &amp; Opportunities</h2>
        <p>
          <strong>Prime locations</strong> in Lagos, Abuja, and Port Harcourt are especially attractive for <span class="text-estate-blue font-semibold">first-time homeowners</span> and <span class="text-estate-red font-semibold">long-term investors</span>. Infrastructure and eco-friendly design are top priorities for developers.
        </p>
        <ul class="list-disc pl-7 my-6">
          <li>Long-term appreciation and rental income potential</li>
          <li>Creative payment/financing plans for flexible purchase options</li>
          <li>Continuing innovation in estate amenities</li>
        </ul>
        <img src="/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png" alt="Real Estate Training" class="rounded-lg w-full md:w-2/3 mx-auto my-7 shadow-md" />
        <h2 class="text-2xl font-semibold mt-10 mb-3">Overcoming Market Challenges</h2>
        <p>
          While costs and regulatory hurdles persist, progress is clear. Collaboration between realtors, investors, and policymakers is ushering in fresh solutions with real impact.
        </p>
        <h2 class="text-2xl font-semibold mt-10 mb-3">The Road Ahead</h2>
        <p>
          Whether you’re buying your dream home or seeking lucrative returns, staying informed and working with trusted firms is critical for future success.
        </p>
      `;
    }
    return html;
  };

  return (
    <article className="max-w-4xl mx-auto p-2 sm:p-8 bg-white rounded-lg shadow-md">
      {/* Back button (now always links to /blog) */}
      <div className="mb-6">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Link to="/blog">
            {/* Left arrow unicode */}
            <span className="mr-1 text-xl">&#8592;</span> Back to Blog
          </Link>
        </Button>
      </div>

      {/* Post image */}
      {post.image_path && (
        <div className="mb-6">
          <img
            src={post.image_path}
            alt={post.title}
            className="w-full max-h-72 object-cover rounded-lg shadow"
          />
        </div>
      )}

      {/* Post header */}
      <div className="mb-6 text-left">
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
          <p className="text-lg text-gray-700 italic text-left">{post.excerpt}</p>
        </div>
      )}

      {/* Post content in scrollable area */}
      <ScrollArea className="h-[500px] rounded-md border p-4 bg-gray-50">
        <div
          className="post-content prose prose-estate max-w-none text-left leading-relaxed"
          style={{ textAlign: 'left' }}
          dangerouslySetInnerHTML={{
            __html: getContentWithImages(),
          }}
        />
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
