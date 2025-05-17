
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { PostForm } from '@/components/blog/PostForm';
import { createPost, PostFormData } from '@/utils/postUtils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CATEGORIES } from '@/components/blog/PostFormConstants';

const CreatePost = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not authenticated or not authorized
    if (!user) {
      toast({
        title: "Access denied",
        description: "You need to be logged in to create posts.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSubmit = async (formData: PostFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.title || !formData.content || !formData.excerpt) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await createPost(formData, user.id);
      
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12 px-4 bg-gray-50">
        <PostForm 
          initialValues={{
            title: '',
            content: '',
            excerpt: '',
            category: 'General',
            isPublished: false,
            previewImage: null
          }}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/dashboard')}
          onSubmit={handleSubmit}
          submitLabel={isSubmitting ? 'Saving...' : 'Create Post'}
          cancelLabel="Cancel"
          title="Create New Post"
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default CreatePost;
