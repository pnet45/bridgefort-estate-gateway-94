
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
      <section className="py-12" aria-label="Loading latest news">
        <h2 className="text-3xl font-bold mb-10 text-center">Latest News & Updates</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
              <div className="aspect-[16/10] animate-pulse bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </section>
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
