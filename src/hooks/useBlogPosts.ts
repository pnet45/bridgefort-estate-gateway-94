import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { fallbackPosts } from "@/data/fallbackBlogPosts";
import { sortPostsByDate } from "@/utils/blogUtils";
import { listenForPublicDataRevalidation, readPublicDataCache, subscribePublicDataCache, writePublicDataCache } from "@/lib/publicDataCache";

const cacheKey = (limit: number) => `published-blog-posts-v2-${limit}`;
const readCache = (key: string): BlogPost[] => readPublicDataCache<BlogPost[]>(key) || [];
const writeCache = (key: string, posts: BlogPost[]) => writePublicDataCache(key, posts);

export function useBlogPosts(limit = 20) {
  const key = cacheKey(limit);
  const [posts, setPosts] = useState<BlogPost[]>(() => readCache(key));
  const [loading, setLoading] = useState(() => readCache(key).length === 0);

  const fetchBlogPosts = useCallback(async () => {
    try {
      const [cmsResult, legacyResult] = await Promise.all([
        (supabase as any)
          .from("content_items")
          .select("id,title,excerpt,image_url,created_at,category,created_by,slug")
          .eq("page", "blog")
          .eq("content_type", "blog_post")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(limit),
        supabase
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
          .limit(limit),
      ]);

      if (cmsResult.error && legacyResult.error) throw cmsResult.error;
      const cmsRows: any[] = cmsResult.error ? [] : (cmsResult.data || []);
      const authorIds = Array.from(new Set(cmsRows.map(row => row.created_by).filter(Boolean)));
      const profileMap = new Map<string, { first_name: string; last_name: string }>();
      if (authorIds.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id,first_name,last_name")
          .in("id", authorIds);
        (profiles || []).forEach((profile: any) => profileMap.set(profile.id, {
          first_name: profile.first_name || "Bridgefort",
          last_name: profile.last_name || "Homes",
        }));
      }

      const cmsPosts: BlogPost[] = cmsRows.map(row => ({
        id: row.id,
        title: row.title,
        excerpt: row.excerpt || "",
        image_path: row.image_url || "",
        created_at: row.created_at,
        category: row.category || "Company News",
        profiles: row.created_by
          ? profileMap.get(row.created_by) || { first_name: "Bridgefort", last_name: "Homes" }
          : { first_name: "Bridgefort", last_name: "Homes" },
      }));

      const legacyPosts: BlogPost[] = (legacyResult.data || []).map((post: any) => {
        const profileData = Array.isArray(post.profiles)
          ? post.profiles[0] || null
          : post.profiles || null;
        return {
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || "",
          image_path: post.image_path || "",
          created_at: post.created_at,
          category: post.category || "Company News",
          profiles: profileData || { first_name: "Bridgefort", last_name: "Homes" },
        };
      });

      // Keep older posts visible while new CMS-managed articles become canonical.
      const uniquePosts = new Map<string, BlogPost>();
      [...cmsPosts, ...legacyPosts].forEach(post => uniquePosts.set(post.id, post));
      const mergedPosts = Array.from(uniquePosts.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
      const nextPosts = sortPostsByDate<BlogPost>(mergedPosts.length ? mergedPosts : fallbackPosts);
      setPosts(nextPosts);
      writeCache(key, nextPosts);
    } catch (error) {
      console.error("Error fetching CMS and legacy blog posts:", error);
      setPosts(current => current.length ? current : sortPostsByDate<BlogPost>(fallbackPosts));
    } finally {
      setLoading(false);
    }
  }, [key, limit]);

  useEffect(() => {
    void fetchBlogPosts();
    const channel = supabase
      .channel(`published_blog_content_${limit}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "content_items" }, payload => {
        const previous = payload.old as Record<string, unknown> | undefined;
        const next = payload.new as Record<string, unknown> | undefined;
        if (previous?.page === "blog" || next?.page === "blog" || !previous?.page) void fetchBlogPosts();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, payload => {
        const previous = payload.old as Record<string, unknown> | undefined;
        const next = payload.new as Record<string, unknown> | undefined;
        if (previous?.published === true || next?.published === true) void fetchBlogPosts();
      })
      .subscribe();
    const stopRevalidation = listenForPublicDataRevalidation(() => void fetchBlogPosts());
    const stopCacheSync = subscribePublicDataCache<BlogPost[]>(key, setPosts);
    return () => {
      stopRevalidation();
      stopCacheSync();
      void supabase.removeChannel(channel);
    };
  }, [fetchBlogPosts, limit, key]);

  return { posts, loading, refresh: fetchBlogPosts };
}
