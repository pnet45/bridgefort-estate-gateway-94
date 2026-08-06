export type GalleryMediaType = 'image' | 'video';

export interface GalleryMediaItem {
  id: string;
  media_type: GalleryMediaType;
  media_url: string;
  poster_url: string | null;
  caption: string | null;
  event_description: string | null;
  display_order: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Shape consumed by the 3D CircularGallery component. */
export interface CircularGalleryDisplayItem {
  image: string;
  text: string;
}
