import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { fallbackPosts } from "@/data/fallbackBlogPosts";
import { sortPostsByDate } from "@/utils/blogUtils";
import { readPublicDataCache, writePublicDataCache } from "@/lib/publicDataCache";

const cacheKey = (limit: number) => `published-blog-posts-${limit}`;
const readCache = (key: string): BlogPost[] => readPublicDataCache<BlogPost[]>(key) || [];
const writeCache = (key: string, posts: BlogPost[]) => writePublicDataCache(key, posts);

export function useBlogPosts(limit = 20) {
  const key = cacheKey(limit);
  const [posts, setPosts] = useState<BlogPost[]>(() => readCache(key));
  const [loading, setLoading] = useState(() => readCache(key).length === 0);

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
        const profileData = Array.isArray(post.profiles)
          ? post.profiles[0] || null
          : post.profiles || null;
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
      const nextPosts = sortPostsByDate<BlogPost>(transformedPosts.length ? transformedPosts : fallbackPosts);
      setPosts(nextPosts);
      writeCache(key, nextPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Keep cached posts on network failure; use bundled content only on a first visit.
      setPosts((current) => current.length ? current : sortPostsByDate<BlogPost>(fallbackPosts));
    } finally {
      setLoading(false);
    }
  }, [key, limit]);

  useEffect(() => {
    void fetchBlogPosts();
    const channel = supabase
      .channel(`published_blog_posts_${limit}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, (payload) => {
        const previous = payload.old as Record<string, unknown> | undefined;
        const next = payload.new as Record<string, unknown> | undefined;
        if (previous?.published === true || next?.published === true) void fetchBlogPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchBlogPosts, limit]);

  return { posts, loading, refresh: fetchBlogPosts };
}
