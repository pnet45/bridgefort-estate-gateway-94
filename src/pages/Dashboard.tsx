
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUserPosts(data || []);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user, navigate]);

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8 text-center">Dashboard</h1>
          
          {/* Centered Create New Post Button */}
          <div className="flex justify-center mb-10">
            <Button 
              onClick={handleCreatePost}
              className="bg-estate-blue hover:bg-estate-darkBlue"
            >
              Create New Post
            </Button>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
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
            </div>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Your Posts</h2>
            {loading ? (
              <p>Loading your posts...</p>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map((post: any) => (
                  <div key={post.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit-post/${post.id}`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>You haven't created any posts yet. Click "Create New Post" to get started!</p>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default Dashboard;
