
import React, { useState, useMemo } from "react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import BlogPostsGrid from "./BlogPostsGrid";
import LoadMoreButton from "./LoadMoreButton";
import { realEstateArticles } from "@/data/realEstateContent";

const PAGE_SIZE = 6;

const BlogPosts = () => {
  const { posts, loading } = useBlogPosts(50);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allArticles = useMemo(() => {
    const mapped = realEstateArticles.map(article => ({
      ...article,
      image_path: article.image,
      created_at: article.date,
    }));
    return [...mapped, ...posts];
  }, [posts]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-10">Latest News & Updates</h2>
        <p>Loading posts...</p>
      </div>
    );
  }

  const visibleArticles = allArticles.slice(0, visibleCount);
  const hasMore = visibleCount < allArticles.length;

  return (
    <>
      <h2 className="text-3xl font-bold mb-10 text-center">Latest News & Updates</h2>
      <BlogPostsGrid posts={visibleArticles} />
      {hasMore && (
        <LoadMoreButton onClick={() => setVisibleCount(c => c + PAGE_SIZE)} />
      )}
    </>
  );
};

export default BlogPosts;
