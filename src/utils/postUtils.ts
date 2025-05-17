
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

export interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  isPublished: boolean;
  fileSelected: File | null;
}

export const uploadPostImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('imagbucket')
      .upload(fileName, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    return fileName;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const createPost = async (
  postData: PostFormData,
  userId: string
): Promise<boolean> => {
  try {
    let imagePath = null;
    
    if (postData.fileSelected) {
      imagePath = await uploadPostImage(postData.fileSelected);
      
      if (!imagePath) {
        throw new Error('Failed to upload image');
      }
    }
    
    const { error } = await supabase
      .from('posts')
      .insert([{
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt, 
        category: postData.category,
        author_id: userId,
        image_path: imagePath,
        published: postData.isPublished
      }]);
    
    if (error) throw error;
    
    toast({
      title: "Success!",
      description: postData.isPublished ? "Post published successfully" : "Draft saved successfully",
    });
    
    return true;
  } catch (error) {
    console.error('Error creating post:', error);
    toast({
      title: "Error",
      description: "Failed to create post. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
