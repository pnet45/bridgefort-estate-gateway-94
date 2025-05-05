
import React from 'react';
import { getFeaturedEvent } from './UpcomingEvents';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedTraining = () => {
  const featuredEvent = getFeaturedEvent();

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Featured Training Event</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Don't miss our premier upcoming training event designed to boost your real estate skills
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <img 
              src={featuredEvent.image} 
              alt={featuredEvent.title} 
              className="w-full h-auto rounded-lg shadow-lg" 
            />
            <div className="absolute top-4 left-4 bg-estate-red text-white text-sm uppercase font-bold py-1 px-3 rounded">
              Featured
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-estate-blue">{featuredEvent.title}</h3>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Calendar size={20} className="mr-3 text-estate-blue" />
                <span className="text-lg">{featuredEvent.date}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <Clock size={20} className="mr-3 text-estate-blue" />
                <span className="text-lg">{featuredEvent.time}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <MapPin size={20} className="mr-3 text-estate-blue" />
                <span className="text-lg">{featuredEvent.location}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <Users size={20} className="mr-3 text-estate-blue" />
                <span className="text-lg">{featuredEvent.capacity}</span>
              </div>
            </div>
            
            <p className="text-gray-600">
              Join industry experts for an intensive masterclass that will transform your approach to real estate 
              investments and sales strategies. Learn practical skills to immediately implement in your business.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="bg-estate-red hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300">
                Register Now
              </button>
              <Link to="/training#training-content" className="border border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white font-medium py-3 px-8 rounded-lg transition duration-300">
                View All Training Resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTraining;
