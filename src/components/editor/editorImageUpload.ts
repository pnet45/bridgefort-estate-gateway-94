import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export interface EditorImageUploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Uploads an image to the same 'public' storage bucket already used by
 * CreatePost.tsx, under an editor-content/ prefix so it's easy to tell apart
 * from other upload sources later. Used for the editor's toolbar upload
 * button, paste-from-clipboard, and drag-and-drop.
 */
export async function uploadEditorImage(file: File): Promise<EditorImageUploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: 'Please use a PNG, JPEG, WEBP, or GIF image.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { url: null, error: 'Image is too large - please use a file under 8MB.' };
  }

  const fileExt = file.name.split('.').pop() || 'png';
  const filePath = `editor-content/${uuidv4()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file);
  if (uploadError) {
    return { url: null, error: uploadError.message || "We couldn't upload this image. Check your connection and try again." };
  }

  const { data } = supabase.storage.from('public').getPublicUrl(filePath);
  return { url: data.publicUrl, error: null };
}
