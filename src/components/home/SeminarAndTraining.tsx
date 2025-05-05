
import React from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedEvent } from '../training/UpcomingEvents';
import { Calendar, MapPin, Clock } from 'lucide-react';

const SeminarAndTraining = () => {
  const featuredEvent = getFeaturedEvent();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-estate-blue mb-4">Event</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Enhance your real estate knowledge and investment skills with our professional training programs
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative">
              <img 
                src={featuredEvent.image} 
                alt={featuredEvent.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-estate-red text-white text-sm uppercase font-bold py-1 px-3 rounded">
                Coming Soon
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-2xl font-bold text-estate-blue mb-4">{featuredEvent.title}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="mr-3 text-estate-red" />
                  <span>{featuredEvent.date}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock size={18} className="mr-3 text-estate-red" />
                  <span>{featuredEvent.time}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-3 text-estate-red" />
                  <span>{featuredEvent.location}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8">
                Join our intensive training session designed to equip real estate professionals with cutting-edge 
                strategies and practical knowledge for success in today's competitive market.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition duration-300">
                  Register Now
                </button>
                <Link to="/training" className="border border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white font-medium py-2 px-6 rounded transition duration-300">
                  View All Training Programs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeminarAndTraining;
