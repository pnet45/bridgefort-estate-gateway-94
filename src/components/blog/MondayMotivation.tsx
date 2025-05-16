
import React, { useState, useEffect } from 'react';
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
  },
  {
    id: 'm4',
    title: 'Rise and Grind: Real Estate Waits for No One',
    excerpt: 'It\'s Monday – let\'s show up and close strong. In real estate, consistent action and persistent follow-up are the keys to success in this competitive market.',
    image: '/lovable-uploads/961fe593-98d7-4b3e-8345-9079d9b163d6.png',
    date: 'May 13, 2025',
    author: 'Dr. Dalvin Silva'
  },
  {
    id: 'm5',
    title: 'New Week, Fresh Listings, Fresh Leads',
    excerpt: 'Lagos never sleeps, and neither do we. Let\'s turn site visits into signed deals. Stay sharp, stay selling in this dynamic real estate market.',
    image: '/lovable-uploads/c46fb41f-b745-4000-839c-c31bc4f12653.png',
    date: 'May 20, 2025',
    author: 'Precious Silva'
  }
];

const MondayMotivation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const postsToShow = 3;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        // Calculate next index while ensuring we don't exceed array boundaries
        const nextIndex = prevIndex + 1;
        const maxStartIndex = motivationalPosts.length - postsToShow;
        return nextIndex > maxStartIndex ? 0 : nextIndex;
      });
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const visiblePosts = motivationalPosts.slice(currentIndex, currentIndex + postsToShow);

  return (
    <section className="py-16 bg-gradient-to-r from-estate-blue/5 to-estate-blue/10 overflow-hidden">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-10 text-center">Monday Motivation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visiblePosts.map((post, index) => (
            <div 
              key={post.id} 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-500 transform hover:scale-105"
              style={{
                animation: `${index === 0 ? 'slideInFromLeft' : index === 2 ? 'slideInFromRight' : 'scaleIn'} 0.5s ease-out`
              }}
            >
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
                
                {/*
                <Link 
                  to={`/blog/motivation/${post.id}`} 
                  className="text-estate-blue font-medium hover:underline inline-flex items-center"
                >
                  Read More 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>*/}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          {Array.from({ length: motivationalPosts.length - postsToShow + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 w-8 mx-1 rounded-full ${
                currentIndex === idx ? 'bg-estate-blue' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};

export default MondayMotivation;
