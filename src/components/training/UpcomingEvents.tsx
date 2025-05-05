
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const upcomingEvents = [
  {
    id: 1,
    title: "Real Estate Masterclass Lagos",
    date: "June 15, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "PWAN Bridgefort Head Office, Lekki-Ajah, Lagos",
    image: "/lovable-uploads/180e436c-ef89-4ab0-a2d1-e6271847b3e9.png",
    capacity: "Limited to 30 participants",
    category: "Masterclass",
    featured: true
  },
  {
    id: 2,
    title: "Sales Conversion Workshop",
    date: "March 8, 2025",
    time: "9:00 AM - 2:00 PM",
    location: "Port Harcourt Office, Rivers State",
    image: "/lovable-uploads/de82d988-dda1-4526-8001-d88a34fd7090.png",
    capacity: "Limited to 25 participants",
    category: "Sales",
    featured: false
  },
  {
    id: 3,
    title: "Customer Retention Bootcamp",
    date: "April 20, 2025",
    time: "10:00 AM - 3:00 PM",
    location: "PWAN Bridgefort Head Office, Lekki-Ajah, Lagos",
    image: "/lovable-uploads/22de0a72-5f26-4e48-bf04-b3cb5999d519.png",
    capacity: "Limited to 20 participants",
    category: "Retention",
    featured: false
  }
];

export const getUpcomingEvents = () => upcomingEvents;

export const getFeaturedEvent = () => upcomingEvents.find(event => event.featured) || upcomingEvents[0];

const UpcomingEvents = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Upcoming Training Events</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Join our in-person training events for hands-on learning and networking opportunities with industry experts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition duration-300 border-0">
              <div className="relative">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-48 object-cover" 
                />
                <div className="absolute top-3 left-3 bg-estate-blue text-white text-xs uppercase font-bold py-1 px-2 rounded">
                  {event.category}
                </div>
                {event.featured && (
                  <div className="absolute top-3 right-3 bg-estate-red text-white text-xs uppercase font-bold py-1 px-2 rounded">
                    Featured
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                
                <div className="space-y-3 mb-5">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={18} className="mr-3 text-estate-blue" />
                    <span>{event.date}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock size={18} className="mr-3 text-estate-blue" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-3 text-estate-blue" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users size={18} className="mr-3 text-estate-blue" />
                    <span>{event.capacity}</span>
                  </div>
                </div>
                
                <button className="w-full bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                  Register Now
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <button className="btn-primary">
            View All Events
          </button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
