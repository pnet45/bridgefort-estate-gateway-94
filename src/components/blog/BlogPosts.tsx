
import React from "react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import BlogPostsGrid from "./BlogPostsGrid";
import LoadMoreButton from "./LoadMoreButton";

const BlogPosts = () => {
  const { posts, loading } = useBlogPosts(6);

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
      <BlogPostsGrid posts={posts} />
      <LoadMoreButton disabled />{/* To be implemented: pagination */}
    </>
  );
};

export default BlogPosts;
