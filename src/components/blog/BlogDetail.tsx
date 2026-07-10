
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SocialShareButtons from './SocialShareButtons';
import BlogPostContent from './BlogPostContent';

interface BlogDetailProps {
  post: any;
}

// BackButton: Extracted for clarity and future reusability
const BackButton = () => (
  <div className="mb-6">
    <Button
      asChild
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Link to="/blog">
        <span className="mr-1 text-xl">&#8592;</span> Back to Blog
      </Link>
    </Button>
  </div>
);

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

  return (
    <article className="max-w-4xl mx-auto p-2 sm:p-8 bg-white rounded-lg shadow-md">
      {/* Back button (always links to /blog) */}
      <BackButton />

      {/* Post image (cover) */}
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

      {/* Post content in scrollable area, using new BlogPostContent */}
      <ScrollArea className="h-[500px] rounded-md border p-4 bg-gray-50">
        <BlogPostContent htmlContent={post.content} />
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
