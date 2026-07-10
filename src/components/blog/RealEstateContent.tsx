
import React from 'react';
import { Calendar, Home, TrendingUp, Award, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Use the real UUIDs from your fallback migration for IDs!
const realEstateContent = [
  {
    id: 'e96b32e6-88d0-4155-8c87-cbe499a239d3',
    title: 'Success Summit 2025 - Gearing Up for the Next Real Estate Revolution',
    excerpt: 'Join us for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt with industry leaders and experts.',
    image: "/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png",
    date: 'May 1, 2025',
    author: 'Dr. Dalvin Silva',
    category: 'Training Events'
  },
  {
    id: '8038c999-40e2-49bf-afec-2cb0b5bc2c14',
    title: 'Estate Inspection Day - Exploring Our Newest Developments',
    excerpt: 'Explore our newest estates with our expert team. See firsthand the investment opportunities awaiting you.',
    image: "/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png",
    date: 'April 22, 2025',
    author: 'Precious Silva',
    category: 'Estate News'
  },
  {
    id: '796b8bc3-c103-4ea9-bc00-f5ccc19ab812',
    title: 'Masterclass: Real Estate Sales Strategies for 2025',
    excerpt: 'Learn cutting-edge sales techniques from our top performers in this intensive masterclass designed for both beginners and professionals.',
    image: "/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png",
    date: "April 15, 2025",
    author: 'Gideon Vincent',
    category: "Training Events"
  }
];

const categoryIcons = {
  'Training Events': <Award size={16} />,
  'Estate News': <Home size={16} />,
  'Market Analysis': <TrendingUp size={16} />,
  'Property Spotlight': <Home size={16} />,
  'Development News': <Home size={16} />,
  'Investment Tips': <Award size={16} />
};

// Share function that shares only the article URL
const shareArticle = (articleId: string, title: string) => {
  // Route should be /blog/{id}
  const articleUrl = `${window.location.origin}/blog/${articleId}`;
  
  if (navigator.share) {
    navigator.share({
      title: title,
      url: articleUrl
    })
    .catch((error) => console.log('Error sharing:', error));
  } else {
    navigator.clipboard.writeText(articleUrl)
      .then(() => {
        alert('Article link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  }
};

const RealEstateContent = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-10 text-center">Real Estate Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {realEstateContent.map(post => (
            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-2/5 h-56 md:h-auto overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover object-center transition duration-500 hover:scale-105"
                  />
                </div>
                
                <div className="md:w-3/5 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center text-sm text-estate-blue mb-2 font-medium">
                      {categoryIcons[post.category as keyof typeof categoryIcons]}
                      <span className="ml-1">{post.category}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-gray-800">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {post.excerpt}
                    </p>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Calendar size={14} className="mr-1" />
                      <span>{post.date}</span>
                      <span className="mx-2">•</span>
                      <span>By {post.author}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      {/* Route should be /blog/{id} */}
                      <Link 
                        to={`/blog/${post.id}`} 
                        className="text-estate-blue font-medium hover:underline inline-flex items-center"
                      >
                        Read Full Article
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => shareArticle(post.id, post.title)}
                              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Share size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share this article</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RealEstateContent;
