import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { fallbackPosts } from "@/data/fallbackBlogPosts";
import { sortPostsByDate } from "@/utils/blogUtils";
import { readPublicDataCache, writePublicDataCache } from "@/lib/publicDataCache";

const BLOG_CACHE_KEY = "public-published-blog-posts";

export function useBlogPosts(limit = 20) {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    const cached = readPublicDataCache<BlogPost[]>(BLOG_CACHE_KEY);
    return cached ? cached.slice(0, limit) : [];
  });
  const [loading, setLoading] = useState(() => readPublicDataCache<BlogPost[]>(BLOG_CACHE_KEY) === null);

  const fetchBlogPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          title,
          excerpt,
          image_path,
          created_at,
          category,
          profiles:author_id (
            first_name,
            last_name
          )
        `)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const transformedPosts: BlogPost[] = (data || []).map((post: any) => {
        const relation = post.profiles;
        const profileData = Array.isArray(relation) ? relation[0] : relation;
        return {
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          image_path: post.image_path,
          created_at: post.created_at,
          category: post.category,
          profiles: profileData || { first_name: "Unknown", last_name: "Author" },
        };
      });

      if (transformedPosts.length > 0) {
        const sorted = sortPostsByDate<BlogPost>(transformedPosts);
        writePublicDataCache(BLOG_CACHE_KEY, sorted);
        setPosts(sorted);
      } else {
        setPosts((current) => current.length ? current : sortPostsByDate<BlogPost>(fallbackPosts));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts((current) => current.length ? current : sortPostsByDate<BlogPost>(fallbackPosts));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchBlogPosts();
    const channel = supabase
      .channel("public-blog-posts-refresh")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        void fetchBlogPosts();
      })
      .subscribe();

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) void fetchBlogPosts();
    };
    window.addEventListener("focus", refreshWhenVisible);
    window.addEventListener("online", refreshWhenVisible);
    const interval = window.setInterval(refreshWhenVisible, 120000);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      window.removeEventListener("online", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [fetchBlogPosts]);

  return { posts, loading };
}
