
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogDetailProps {
  post: any;
}

const BlogDetail = ({ post }: BlogDetailProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };
  
  const imageSrc = post.image_path ? (
    post.image_path.startsWith('/') 
      ? post.image_path
      : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/imagbucket/${post.image_path}`
  ) : '/placeholder.svg';

  return (
    <article className="container-custom my-24 pt-10">
      <div className="mb-8">
        <Button 
          variant="outline"
          onClick={() => navigate('/blog')}
          className="mb-6 text-estate-blue border-estate-blue hover:bg-estate-blue/10"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-estate-blue">{post.title}</h1>
        
        <div className="flex items-center text-gray-500 mb-8">
          <Calendar size={16} className="mr-1" />
          <span>{formatDate(post.created_at)}</span>
          <span className="mx-2">•</span>
          <span>By {post.profiles.first_name} {post.profiles.last_name}</span>
          <span className="mx-2">•</span>
          <span>{post.category}</span>
        </div>
      </div>
      
      <div className="relative h-[300px] md:h-[500px] w-full mb-10 overflow-hidden rounded-lg shadow-lg">
        <img 
          src={imageSrc}
          alt={post.title} 
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>
      
      <div className="prose prose-lg max-w-none">
        {post.content.split('\n').map((paragraph: string, index: number) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>
      
      <div className="mt-12 pt-6 border-t border-gray-200">
        <Button 
          variant="outline"
          onClick={() => navigate('/blog')}
          className="text-estate-blue border-estate-blue hover:bg-estate-blue/10"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </div>
    </article>
  );
};

export default BlogDetail;
