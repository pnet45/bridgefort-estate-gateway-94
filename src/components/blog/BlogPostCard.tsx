
import React from "react";
import { Calendar, Share } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BlogPost } from "@/types/blog";
import { shareArticle } from "@/utils/blogUtils";

interface BlogPostCardProps {
  post: BlogPost;
  onReadMore?: (articleId: string) => void;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, onReadMore }) => (
  <div className="glass-card rounded-lg overflow-hidden transition-all duration-300 animate-roll-in hover:-translate-y-1 hover:animate-bounce-zoom cursor-pointer">
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
      <h3 className="text-xl font-semibold mb-3 text-foreground">
        {post.title}
      </h3>
      <p className="text-gray-600 mb-4">
        {post.excerpt}
      </p>
      <div className="flex justify-between items-center">
        {onReadMore ? (
          <button
            onClick={() => onReadMore(post.id)}
            className="text-estate-blue font-medium hover:underline inline-flex items-center"
          >
            Read More
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <Link
            to={`/blog/${post.id}`}
            className="text-estate-blue font-medium hover:underline inline-flex items-center"
          >
            Read More
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        )}
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
);

export default BlogPostCard;
