
export interface BlogPostProfile {
  first_name: string;
  last_name: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image_path: string;
  created_at: string;
  category: string;
  profiles?: BlogPostProfile;
}
