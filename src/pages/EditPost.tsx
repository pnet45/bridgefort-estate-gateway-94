
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  content: z.string().min(20, { message: 'Content must be at least 20 characters' }),
  excerpt: z.string().min(10, { message: 'Excerpt must be at least 10 characters' }),
  category: z.string().min(1, { message: 'Category is required' }),
  published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      category: '',
      published: false,
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to edit posts',
        variant: 'destructive',
      });
      return;
    }
    
    fetchPost();
  }, [user, navigate, id]);

  const fetchPost = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: 'Post not found',
          description: 'The post you are trying to edit does not exist',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }
      
      // Check if user has permission to edit this post
      if (data.author_id !== user?.id) {
        // Check if user is admin or manager
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .in('role', ['admin', 'manager'])
          .single();
        
        if (!roleData) {
          toast({
            title: 'Permission denied',
            description: 'You do not have permission to edit this post',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }
      }
      
      // Set form values
      form.reset({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        published: data.published,
      });
      
      // Set image preview if exists
      if (data.image_path) {
        setImagePath(data.image_path);
        setImagePreview(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/post_images/${data.image_path}`);
      }
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile || !user) return imagePath;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('post_images')
      .upload(filePath, imageFile);

    if (error) {
      toast({
        title: 'Error uploading image',
        description: error.message,
        variant: 'destructive',
      });
      return imagePath;
    }

    // Delete old image if exists
    if (imagePath) {
      await supabase.storage
        .from('post_images')
        .remove([imagePath]);
    }

    return filePath;
  };

  const onSubmit = async (values: FormValues) => {
    if (!user || !id) return;

    setIsSubmitting(true);
    try {
      // Upload new image if changed
      let uploadedImagePath = imagePath;
      if (imageFile) {
        uploadedImagePath = await uploadImage();
      }

      // Update post in database
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: values.title,
          content: values.content,
          excerpt: values.excerpt,
          category: values.category,
          image_path: uploadedImagePath,
          published: values.published,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Post updated',
        description: 'Your post has been updated successfully',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating the post',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-12 w-48 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Post</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief summary of your post"
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A short summary that will appear in previews
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your post content here"
                        className="resize-none min-h-[300px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="image">Featured Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Image Preview</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Monday Motivation">Monday Motivation</SelectItem>
                        <SelectItem value="Real Estate Insights">Real Estate Insights</SelectItem>
                        <SelectItem value="Investment Tips">Investment Tips</SelectItem>
                        <SelectItem value="Latest News & Updates">Latest News & Updates</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publish Post</FormLabel>
                      <FormDescription>
                        Make this post visible to everyone
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1 bg-estate-blue hover:bg-estate-darkBlue"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
      <Toaster />
    </>
  );
};

export default EditPost;
