
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { fallbackPosts } from "@/data/fallbackBlogPosts";
import { sortPostsByDate } from "@/utils/blogUtils";

export function useBlogPosts(limit = 6) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
    // eslint-disable-next-line
  }, []);

  async function fetchBlogPosts() {
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

      if (error || !data || data.length === 0) {
        setPosts(sortPostsByDate(fallbackPosts));
      } else {
        const transformedPosts: BlogPost[] = data.map((post: any) => {
          let profileData = null;
          if (post.profiles) {
            if (Array.isArray(post.profiles)) {
              profileData = post.profiles.length > 0 ? post.profiles[0] : null;
            } else {
              profileData = post.profiles;
            }
          }
          return {
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            image_path: post.image_path,
            created_at: post.created_at,
            category: post.category,
            profiles: profileData || { first_name: "Unknown", last_name: "Author" }
          };
        });
        setPosts(sortPostsByDate(transformedPosts));
      }
    } catch (error) {
      setPosts(sortPostsByDate(fallbackPosts));
    } finally {
      setLoading(false);
    }
  }

  return { posts, loading };
}
