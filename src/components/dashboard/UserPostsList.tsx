
import React from 'react';
import { Button } from '@/components/ui/button';

interface UserPostsListProps {
  posts: any[];
  loading: boolean;
  onEditPost: (id: string) => void;
  onDeleteClick: (post: any) => void;
}

const UserPostsList = ({ posts, loading, onEditPost, onDeleteClick }: UserPostsListProps) => {
  if (loading) {
    return <p>Loading your posts...</p>;
  }
  
  if (!posts.length) {
    return <p>You haven't created any posts yet. Click "Create New Post" to get started!</p>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <div key={post.id} className="glass-card rounded-lg p-4 hover:-translate-y-1 transition-all duration-300">
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
                onClick={() => onEditPost(post.id)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteClick(post)}
                className="text-red-500 border-red-500 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserPostsList;
