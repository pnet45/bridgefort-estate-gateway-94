
import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const motivationalPosts = [
  {
    id: 'm1',
    title: 'Starting Your Real Estate Journey: First Steps to Success',
    excerpt: 'The first step in any real estate journey is education. Learn about market trends, networking strategies, and how to develop the right mindset for long-term success in this competitive industry.',
    image: '/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png',
    date: 'May 6, 2025',
    author: 'Dr. Dalvin Silva'
  },
  {
    id: 'm2',
    title: 'Building Resilience in Real Estate Sales',
    excerpt: 'Rejection is part of the process. Learn how top performers transform setbacks into stepping stones and build the mental fortitude needed to thrive in property marketing.',
    image: '/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png',
    date: 'April 29, 2025',
    author: 'Precious Silva'
  },
  {
    id: 'm3',
    title: 'Time Management Strategies for Real Estate Professionals',
    excerpt: 'Maximize your productivity with proven time management techniques specifically designed for busy real estate agents and property consultants.',
    image: '/lovable-uploads/f9bcac5d-3d64-47a5-9da3-0e2fcfd2bb57.png',
    date: 'April 22, 2025',
    author: 'Gideon Vincent'
  }
];

const MondayMotivation = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-estate-blue/5 to-estate-blue/10">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-10 text-center">Monday Motivation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {motivationalPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Calendar size={14} className="mr-1" />
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>By {post.author}</span>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {post.excerpt}
                </p>
                
                <Link 
                  to={`/blog/motivation/${post.id}`} 
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
      </div>
    </section>
  );
};

export default MondayMotivation;
