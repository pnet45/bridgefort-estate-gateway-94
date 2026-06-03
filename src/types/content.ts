export type ContentType =
  | 'blog_post'
  | 'service_section'
  | 'training_event'
  | 'past_training_event'
  | 'motivation_slide'
  | 'announcement'
  | 'page_section'
  | 'training_article'
  | 'services_article';

export type ContentPage = 'blog' | 'services' | 'training' | 'home' | 'about' | 'generic';

export interface ContentItem {
  id: string;
  content_type: ContentType;
  page: ContentPage;
  slug: string | null;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  category: string | null;
  tags: string[] | null;
  link_url: string | null;
  cta_label: string | null;
  display_order: number;
  is_published: boolean;
  is_featured: boolean;
  event_date: string | null;
  event_location: string | null;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blog_post: 'Blog Post',
  service_section: 'Service Card',
  training_event: 'Training Event',
  past_training_event: 'Past Training Event',
  motivation_slide: 'Motivation Slide',
  announcement: 'Announcement',
  page_section: 'Page Section',
  training_article: 'Training Article',
  services_article: 'Services Article',
};

export const PAGE_TO_TYPES: Record<ContentPage, ContentType[]> = {
  blog: ['blog_post', 'announcement', 'page_section'],
  services: ['service_section', 'services_article', 'page_section'],
  training: ['training_event', 'past_training_event', 'training_article', 'page_section'],
  home: ['motivation_slide', 'announcement', 'page_section'],
  about: ['page_section'],
  generic: ['page_section'],
};
