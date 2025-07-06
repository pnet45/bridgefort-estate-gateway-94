import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import TrainingRegistrationForm from './TrainingRegistrationForm';
const upcomingEvents = [{
  id: 1,
  title: "TRANSFORMATIONAL MASTERCLASS WITH DALVIN SILVA",
  date: "29 August 2025",
  time: "08:00am - 05:00pm",
  location: "PWAN Amazon Center Golden Destiny Hotel, 7 & 8 B/Stop, Airport Road by Tetrazinni, Ajao Estate, Isolo, Lagos",
  image: "/lovable-uploads/Dalvin-Silva-PhD.jpg",
  capacity: "Limited to 50 participants",
  category: "Masterclass",
  featured: true
}, {
  id: 2,
  title: "Success Summit",
  date: "May 12, 2025",
  time: "10:00 AM Prompt",
  location: "Autograph Event Center, Sanni Abacha Road, Port Harcourt, Rivers State",
  image: "/lovable-uploads/Summit1.jpg",
  capacity: "FREE Admission - Food & Drinks available",
  description: "Get ready for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt! Featuring Dr. Dalvin Silva, PhD, MD/CEO of PWAN Bridgefort, Dr. Julius Oyedemi, Acting Managing Director of PWAN Group, Dr. Michael Afamefuna Okonkwo, Executive Chairman of PWAN Group, and Jayne O. Onwumere, Founder/President of PWAN Group. Don't miss this life-changing opportunity to connect, learn, and grow with some of the most visionary minds in business and leadership.",
  category: "Summit",
  featured: true
}, {
  id: 3,
  title: "Customer Retention Bootcamp",
  date: "June 20, 2025",
  time: "10:00 AM - 3:00 PM",
  location: "PWAN Bridgefort Head Office, Lekki-Ajah, Lagos",
  image: "/lovable-uploads/pbo.png",
  capacity: "Limited to 20 participants",
  category: "Retention",
  featured: false
}];
export const getUpcomingEvents = () => upcomingEvents;
export const getFeaturedEvent = () => upcomingEvents.find(event => event.featured) || upcomingEvents[0];
const UpcomingEvents = () => {
  const [registrationEvent, setRegistrationEvent] = useState<null | {
    id: number;
    title: string;
    date: string;
  }>(null);
  const openRegistration = (event: {
    id: number;
    title: string;
    date: string;
  }) => {
    setRegistrationEvent(event);
  };
  const closeRegistration = () => {
    setRegistrationEvent(null);
  };
  return <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Join our in-person training events for hands-on learning and networking opportunities with industry experts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map(event => <Card key={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition duration-300 border-0">
              <div className="relative">
                <img src={event.image} alt={event.title} className="w-full h-60 object-cover object-center" />
                <div className="absolute top-3 left-3 bg-estate-blue text-white text-xs uppercase font-bold py-1 px-2 rounded">
                  {event.category}
                </div>
                {event.featured && <div className="absolute top-3 right-3 bg-estate-red text-white text-xs uppercase font-bold py-1 px-2 rounded">
                    Featured
                  </div>}
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
                
                <button className="w-full bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-300" onClick={() => openRegistration({
              id: event.id,
              title: event.title,
              date: event.date
            })}>
                  Register Now
                </button>
              </CardContent>
            </Card>)}
        </div>
        
        <div className="text-center mt-10">
          <button className="btn-primary">
            View All Events
          </button>
        </div>
      </div>
      
      {/* Training Registration Form */}
      {registrationEvent && <TrainingRegistrationForm open={!!registrationEvent} onClose={closeRegistration} eventTitle={registrationEvent.title} eventDate={registrationEvent.date} />}
    </section>;
};
export default UpcomingEvents;