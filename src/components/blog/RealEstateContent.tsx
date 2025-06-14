
import React from 'react';
import { Calendar, Home, TrendingUp, Award, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const realEstateContent = [
  {
    id: 're1',
    title: 'Bridgefort County: The Future of Lagos Waterfront Living',
    excerpt: 'Discover the unique features of our premium lagoon front estate offering unparalleled luxury, security, and investment potential just minutes from Lagos business centers.',
    image: "/lovable-uploads/Bridgefort County - Ikota .jpg",
    date: 'May 3, 2025',
    author: 'Precious Silva',
    category: 'Property Spotlight'
  },
  {
    id: 're2',
    title: 'Real Estate Market Trends: Q2 2025 Analysis',
    excerpt: "Our quarterly market analysis explores emerging trends, price forecasts, and investment opportunities in key Nigerian real estate markets.",
    image: "/lovable-uploads/d6f71783-c6ac-4ff8-885e-f4290eba3780.png",
    date: 'April 25, 2025',
    author: 'Dr. Dalvin Silva',
    category: 'Market Analysis'
  },
  {
    id: 're3',
    title: "Fortress Hills: Sustainable Community Development",
    excerpt: "How our newest development is incorporating green technologies, community spaces, and sustainable practices to create a model for future Nigerian estates.",
    image: "/lovable-uploads/ba3b8490-e83f-477b-b729-b617da515b2c.png",
    date: "April 18, 2025",
    author: "Dr. Dalvin Silva",
    category: "Development News"
  },
  {
    id: 're4',
    title: 'Investment Strategies: Land Banking for Future Gains',
    excerpt: "Learn how strategic land banking can create long-term wealth and provide substantial returns in emerging Nigerian property corridors.",
    image: "/lovable-uploads/Precious Gardens Estate.jpg",
    date: "April 11, 2025",
    author: "Gideon Vincent",
    category: "Investment Tips"
  }
];

const categoryIcons = {
  'Property Spotlight': <Home size={16} />,
  'Market Analysis': <TrendingUp size={16} />,
  'Development News': <Home size={16} />,
  'Investment Tips': <Award size={16} />
};

// Share function that shares only the article URL
const shareArticle = (articleId: string, title: string) => {
  const articleUrl = `${window.location.origin}/blog/real-estate/${articleId}`;
  
  if (navigator.share) {
    navigator.share({
      title: title,
      url: articleUrl
    })
    .catch((error) => console.log('Error sharing:', error));
  } else {
    // Fallback for browsers that don't support the Web Share API
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
                      <Link 
                        to={`/blog/real-estate/${post.id}`} 
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
