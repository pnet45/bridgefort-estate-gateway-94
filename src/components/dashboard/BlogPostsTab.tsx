
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AllPostsList from './AllPostsList';
import UserPostsList from './UserPostsList';

interface BlogPostsTabProps {
  isAdmin: boolean;
  allPosts: any[];
  userPosts: any[];
  loading: boolean;
  onEditPost: (id: string) => void;
  onDeleteClick: (post: any) => void;
}

const BlogPostsTab = ({
  isAdmin,
  allPosts,
  userPosts,
  loading,
  onEditPost,
  onDeleteClick
}: BlogPostsTabProps) => {
  const navigate = useNavigate();

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  return (
    <div className="space-y-6">
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
          <AllPostsList 
            allPosts={allPosts} 
            loading={loading} 
            onEditPost={onEditPost} 
            onDeleteClick={onDeleteClick} 
          />
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mt-8 mb-4">Your Posts</h2>
        <UserPostsList 
          posts={userPosts} 
          loading={loading} 
          onEditPost={onEditPost} 
          onDeleteClick={onDeleteClick} 
        />
      </div>
    </div>
  );
};

export default BlogPostsTab;
