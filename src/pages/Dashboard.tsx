
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '@/contexts/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertyManagement from '@/components/admin/PropertyManagement';
import DashboardStats from '@/components/dashboard/DashboardStats';

// Import dashboard components
import AccountInformation from '@/components/dashboard/AccountInformation';
import BlogPostsTab from '@/components/dashboard/BlogPostsTab';
import DeletePostDialog from '@/components/dashboard/DeletePostDialog';
import ClientDashboard from '@/components/dashboard/ClientDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isAdmin = userRole === 'admin';
  const isStaffOrAdmin = userRole === 'admin' || userRole === 'staff';
  const isClient = userRole === 'client' || !userRole; // Default to client if no role

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Only fetch posts if user can create them (staff or admin)
        if (isStaffOrAdmin) {
          // Fetch user's own posts
          const { data: userPostsData, error: userPostsError } = await supabase
            .from('posts')
            .select('*')
            .eq('author_id', user.id)
            .order('created_at', { ascending: false });

          if (userPostsError && userPostsError.code !== 'PGRST116') {
            console.error('Error fetching user posts:', userPostsError);
          } else {
            setUserPosts(userPostsData || []);
          }
          
          // If admin, fetch all posts
          if (userRole === 'admin') {
            const { data: allPostsData, error: allPostsError } = await supabase
              .from('posts')
              .select('*, profiles:author_id(*)')
              .order('created_at', { ascending: false });
              
            if (allPostsError && allPostsError.code !== 'PGRST116') {
              console.error('Error fetching all posts:', allPostsError);
            } else {
              setAllPosts(allPostsData || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Don't show error toast for missing posts table - it's expected for new users
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, navigate, userRole, isStaffOrAdmin]);
  
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
            <TabsList className={`grid w-full max-w-lg mx-auto mb-8 ${isClient ? 'grid-cols-2' : isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {isStaffOrAdmin && <TabsTrigger value="posts">Blog Posts</TabsTrigger>}
              {isAdmin && <TabsTrigger value="properties">Properties</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="overview">
              {isClient ? <ClientDashboard /> : <DashboardStats />}
            </TabsContent>
            
            {isStaffOrAdmin && (
              <TabsContent value="posts">
                <BlogPostsTab 
                  isAdmin={isAdmin}
                  allPosts={allPosts}
                  userPosts={userPosts}
                  loading={loading}
                  onEditPost={handleEditPost}
                  onDeleteClick={handleDeleteClick}
                />
              </TabsContent>
            )}
            
            {isAdmin && (
              <TabsContent value="properties">
                <PropertyManagement />
              </TabsContent>
            )}
          </Tabs>
          
          <AccountInformation />
        </div>
      </main>
      
      <Footer />
      <Toaster />
      
      {isStaffOrAdmin && (
        <DeletePostDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          postToDelete={postToDelete}
          isDeleting={isDeleting}
          onConfirmDelete={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default Dashboard;
