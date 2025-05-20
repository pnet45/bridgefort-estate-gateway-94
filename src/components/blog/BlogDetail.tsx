
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface BlogDetailProps {
  post: any;
}

const BlogDetail = ({ post }: BlogDetailProps) => {
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

  return (
    <article className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
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
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
      </div>

      {/* Post excerpt */}
      {post.excerpt && (
        <div className="mb-6">
          <p className="text-lg text-gray-700 italic">{post.excerpt}</p>
        </div>
      )}

      {/* Post content in scrollable area */}
      <ScrollArea className="h-[500px] rounded-md border p-4">
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </ScrollArea>
    </article>
  );
};

export default BlogDetail;
