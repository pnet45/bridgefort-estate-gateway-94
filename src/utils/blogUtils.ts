
import { toast } from "@/hooks/use-toast";

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

export function sortPostsByDate(posts: { created_at: string }[]) {
  return [...posts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
