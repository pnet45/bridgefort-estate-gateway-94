
import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: '1',
    title: 'Success Summit 2025 - Gearing Up for the Next Real Estate Revolution',
    excerpt: 'Join us for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt with industry leaders and experts.',
    image: '/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png',
    date: 'May 1, 2025',
    category: 'Training Events',
    author: 'Dr. Dalvin Silva'
  },
  {
    id: '2',
    title: 'Estate Inspection Day - Exploring Our Newest Developments',
    excerpt: 'Explore our newest estates with our expert team. See firsthand the investment opportunities awaiting you.',
    image: '/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png',
    date: 'April 22, 2025',
    category: 'Estate News',
    author: 'Precious Silva'
  },
  {
    id: '3',
    title: 'Masterclass: Real Estate Sales Strategies for 2025',
    excerpt: 'Learn cutting-edge sales techniques from our top performers in this intensive masterclass designed for both beginners and professionals.',
    image: '/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png',
    date: 'April 15, 2025',
    category: 'Training Events',
    author: 'Gideon Vincent'
  },
  {
    id: '4',
    title: 'Office Training: Building Your Real Estate Portfolio',
    excerpt: 'Our recent office training session focused on helping clients build robust real estate portfolios for long-term wealth generation.',
    image: '/lovable-uploads/f9bcac5d-3d64-47a5-9da3-0e2fcfd2bb57.png',
    date: 'April 8, 2025',
    category: 'Training Events',
    author: 'Dr. Dalvin Silva'
  },
  {
    id: '5',
    title: 'Certificate Award Ceremony for Top Performers',
    excerpt: 'Celebrating excellence and dedication in our recent certificate award ceremony for outstanding real estate professionals.',
    image: '/lovable-uploads/62e9d362-2fac-4c6b-b437-8045c86dfc53.png',
    date: 'March 28, 2025',
    category: 'Success Stories',
    author: 'Dr. Michael Akhuetie'
  },
  {
    id: '6',
    title: 'Introducing Bridgefort County - Our Premium Lagoon Front Estate',
    excerpt: 'Discover luxury living with our newest premium development: Bridgefort County Lagoon Front Estate, offering unparalleled views and amenities.',
    image: '/lovable-uploads/5ec8d74e-628c-4efc-8322-f98d4138140d.png',
    date: 'March 20, 2025',
    category: 'Estate News',
    author: 'Precious Silva'
  }
];

const BlogPosts = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-10 text-center">Latest News & Updates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map(post => (
          <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover transition duration-500 hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-estate-blue text-white text-xs uppercase font-bold py-1 px-3 rounded-full">
                  {post.category}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-center text-gray-500 text-sm mb-3">
                <Calendar size={14} className="mr-1" />
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>By {post.author}</span>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {post.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {post.excerpt}
              </p>
              
              <Link 
                to={`/blog/${post.id}`} 
                className="text-estate-blue font-medium hover:underline inline-flex items-center"
              >
                Read More 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <button className="bg-white border border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white font-medium py-2 px-6 rounded-lg transition duration-300">
          Load More Posts
        </button>
      </div>
    </>
  );
};

export default BlogPosts;
