
import React, { useState } from "react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import BlogPostsGrid from "./BlogPostsGrid";
import LoadMoreButton from "./LoadMoreButton";
import FullArticleDialog from "./FullArticleDialog";
import { realEstateArticles } from "@/data/realEstateContent";

const BlogPosts = () => {
  const { posts, loading } = useBlogPosts(6);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mappedArticles = realEstateArticles.map(article => ({
    ...article,
    image_path: article.image,
    created_at: article.date
  }));
  
  const allArticles = [...mappedArticles, ...posts];

  const handleReadMore = (articleId: string) => {
    const article = allArticles.find(a => a.id === articleId);
    if (article) {
      setSelectedArticle(article);
      setIsDialogOpen(true);
    }
  };

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
      <BlogPostsGrid posts={allArticles} onReadMore={handleReadMore} />
      <LoadMoreButton disabled />{/* To be implemented: pagination */}
      
      <FullArticleDialog 
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        article={selectedArticle}
      />
    </>
  );
};

export default BlogPosts;
