
import { toast } from "@/hooks/use-toast";

// Note: Now using generics! This preserves type safety.
export const shareArticle = (articleId: string, title: string) => {
  const articleUrl = `${window.location.origin}/blog/${articleId}`;
  if (navigator.share) {
    navigator.share({
      title: title,
      url: articleUrl
    })
    .catch((error) => console.log('Error sharing:', error));
  } else {
    navigator.clipboard.writeText(articleUrl)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "Article link copied to clipboard",
        });
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  }
};

// Use generic type to maintain input array type
export function sortPostsByDate<T extends { created_at: string }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
