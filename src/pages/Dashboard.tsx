
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { CalendarIcon, EditIcon, TrashIcon, PlusIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { format } from 'date-fns';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Access denied",
        description: "You need to be logged in to access the dashboard.",
        variant: "destructive",
      });
      navigate('/auth');
    } else {
      fetchPosts();
    }
  }, [user, navigate]);
  
  const fetchPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          category,
          image_path,
          published,
          created_at,
          updated_at
        `);
        
      if (!userRole || (userRole !== 'admin' && userRole !== 'manager')) {
        // If not admin/manager, only show own posts
        query = query.eq('author_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTogglePublished = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ published: !currentStatus, updated_at: new Date().toISOString() })
        .match({ id: postId });
        
      if (error) throw error;
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, published: !currentStatus, updated_at: new Date().toISOString() } 
          : post
      ));
      
      toast({
        title: "Success!",
        description: !currentStatus ? "Post published successfully" : "Post unpublished"
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post status.",
        variant: "destructive",
      });
    }
  };
  
  const confirmDelete = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .match({ id: postToDelete });
        
      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== postToDelete));
      
      toast({
        title: "Success!",
        description: "Post deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    } finally {
      setPostToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  
  const filteredPosts = activeTab === "all" 
    ? posts 
    : activeTab === "published" 
      ? posts.filter(post => post.published) 
      : posts.filter(post => !post.published);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-estate-blue">Dashboard</h1>
            <Button 
              onClick={() => navigate('/create-post')}
              className="bg-estate-blue hover:bg-estate-darkBlue"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Post
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all">
                {renderPostList(filteredPosts, loading)}
              </TabsContent>
              <TabsContent value="published">
                {renderPostList(filteredPosts, loading)}
              </TabsContent>
              <TabsContent value="draft">
                {renderPostList(filteredPosts, loading)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
  
  function renderPostList(posts: any[], loading: boolean) {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-24 h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    }
    
    if (posts.length === 0) {
      return (
        <div className="py-10 text-center">
          <p className="text-gray-500">No posts found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col md:flex-row items-start md:items-center p-4 border rounded-lg hover:bg-gray-50">
            <div className="md:w-16 md:h-16 w-full h-32 mr-4 mb-3 md:mb-0 overflow-hidden rounded bg-gray-100">
              {post.image_path ? (
                <img 
                  src={post.image_path.startsWith('/')
                    ? post.image_path
                    : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/imagbucket/${post.image_path}`}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start md:items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <Badge className={post.published ? "bg-green-600" : "bg-yellow-500"}>
                  {post.published ? "Published" : "Draft"}
                </Badge>
                <Badge className="bg-gray-500">{post.category}</Badge>
              </div>
              
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <span>Created: {format(new Date(post.created_at), 'MMM dd, yyyy')}</span>
                {post.updated_at && post.updated_at !== post.created_at && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Updated: {format(new Date(post.updated_at), 'MMM dd, yyyy')}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex mt-3 md:mt-0 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTogglePublished(post.id, post.published)}
                className={post.published 
                  ? "text-gray-600 border-gray-300" 
                  : "text-green-600 border-green-300"
                }
              >
                {post.published ? (
                  <>
                    <XCircleIcon className="mr-1 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="mr-1 h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/edit-post/${post.id}`)}
                className="text-blue-600 border-blue-300"
              >
                <EditIcon className="mr-1 h-4 w-4" />
                Edit
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => confirmDelete(post.id)}
                className="text-red-600 border-red-300"
              >
                <TrashIcon className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default Dashboard;
