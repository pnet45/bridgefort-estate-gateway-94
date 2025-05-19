
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '@/contexts/auth';
import PropertyManagement from '@/components/admin/PropertyManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, userRole } = useAuth();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Fetch user's own posts
        const { data: userPostsData, error: userPostsError } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (userPostsError) throw userPostsError;
        setUserPosts(userPostsData || []);
        
        // If admin, fetch all posts
        if (userRole === 'admin') {
          const { data: allPostsData, error: allPostsError } = await supabase
            .from('posts')
            .select('*, profiles:author_id(*)')
            .order('created_at', { ascending: false });
            
          if (allPostsError) throw allPostsError;
          setAllPosts(allPostsData || []);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, navigate, userRole]);

  const handleCreatePost = () => {
    navigate('/create-post');
  };
  
  const handleEditPost = (postId: string) => {
    navigate(`/edit-post/${postId}`);
  };
  
  const handleDeleteClick = (post: any) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postToDelete.id);
        
      if (error) throw error;
      
      // Update the posts lists
      setUserPosts(userPosts.filter(post => post.id !== postToDelete.id));
      if (isAdmin) {
        setAllPosts(allPosts.filter(post => post.id !== postToDelete.id));
      }
      
      toast({
        title: "Post deleted",
        description: "The blog post has been successfully deleted"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete the post",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8 text-center">Dashboard</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="posts">Blog Posts</TabsTrigger>
              {isAdmin && <TabsTrigger value="properties">Properties</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="posts" className="space-y-6">
              {/* Blog Posts Tab */}
              <div className="flex justify-center mb-10">
                <Button 
                  onClick={handleCreatePost}
                  className="bg-estate-blue hover:bg-estate-darkBlue"
                >
                  Create New Post
                </Button>
              </div>
              
              {isAdmin && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">All Posts (Admin)</h2>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-estate-blue" size={32} />
                    </div>
                  ) : allPosts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allPosts.map((post) => (
                            <tr key={post.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {post.profiles?.first_name} {post.profiles?.last_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(post.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {post.published ? 'Published' : 'Draft'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPost(post.id)}
                                  className="text-estate-blue hover:text-estate-darkBlue mr-2"
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(post)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No posts found.</p>
                  )}
                </div>
              )}
              
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mt-8 mb-4">Your Posts</h2>
                {loading ? (
                  <p>Loading your posts...</p>
                ) : userPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPosts.map((post) => (
                      <div key={post.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold mb-2">{post.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                          <div className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPost(post.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(post)}
                              className="text-red-500 border-red-500 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>You haven't created any posts yet. Click "Create New Post" to get started!</p>
                )}
              </div>
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="properties">
                <PropertyManagement />
              </TabsContent>
            )}
          </Tabs>
          
          <div className="bg-white shadow-md rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium capitalize">
                  {userRole || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <Toaster />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> Deleting...
                </>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
