
import React from "react";
import { BlogPost } from "@/types/blog";
import BlogPostCard from "./BlogPostCard";

interface BlogPostsGridProps {
  posts: BlogPost[];
  onReadMore?: (articleId: string) => void;
}

const BlogPostsGrid: React.FC<BlogPostsGridProps> = ({ posts, onReadMore }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {posts.map(post => (
      <BlogPostCard post={post} onReadMore={onReadMore} key={post.id} />
    ))}
  </div>
);

export default BlogPostsGrid;
