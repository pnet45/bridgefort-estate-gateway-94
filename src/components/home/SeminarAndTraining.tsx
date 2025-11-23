
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUpcomingEvents } from '../training/UpcomingEvents';
import { Calendar, MapPin, Clock } from 'lucide-react';
import TrainingRegistrationForm from '../training/TrainingRegistrationForm';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string | null;
  capacity: string;
  description?: string | null;
  featured?: boolean;
}

const SeminarAndTraining = () => {
  const [featuredEvents, setFeaturedEvents] = useState<TrainingEvent[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [registrationEvent, setRegistrationEvent] = useState<null | {id: string; title: string; date: string}>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await getUpcomingEvents();
      setFeaturedEvents(events.filter(event => event.featured));
    };
    fetchEvents();
  }, []);

  const openRegistration = (event: {id: string; title: string; date: string}) => {
    setRegistrationEvent(event);
    setIsRegistrationOpen(true);
  };
  const closeRegistration = () => setIsRegistrationOpen(false);

  // Auto-slide functionality - changed to 10 seconds
  useEffect(() => {
    if (featuredEvents.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredEvents.length);
    }, 10000); // Slides every 10 seconds
    
    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-estate-blue mb-4">Upcoming Events</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Enhance your real estate knowledge and investment skills with our professional training programs
          </p>
        </div>

        {featuredEvents.length > 1 ? (
          <div className="relative mb-16">
            <Carousel 
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
              setApi={(api) => {
                if (api) {
                  api.scrollTo(currentSlide);
                }
              }}
            >
              <CarouselContent>
                {featuredEvents.map((event) => (
                  <CarouselItem key={event.id} className="basis-full">
                    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition duration-500 border-0">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="relative">
                          <img 
                            src={event.image || '/lovable-uploads/pbo.png'} 
                            alt={event.title} 
                            className="w-full h-full object-cover object-center"
                          />
                          <div className="absolute top-4 left-4 bg-estate-red text-white text-sm uppercase font-bold py-1 px-3 rounded">
                            Coming Soon
                          </div>
                        </div>
                        
                        <div className="p-8">
                          <h3 className="text-2xl font-bold text-estate-blue mb-4">{event.title}</h3>
                          
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-600">
                              <Calendar size={18} className="mr-3 text-estate-red" />
                              <span>{event.date}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Clock size={18} className="mr-3 text-estate-red" />
                              <span>{event.time}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <MapPin size={18} className="mr-3 text-estate-red" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-8">
                            {event.description || 'Join our intensive training session designed to equip real estate professionals with cutting-edge strategies and practical knowledge for success in today\'s competitive market.'}
                          </p>
                          
                          <div className="flex flex-wrap gap-4">
                            <button 
                              onClick={() => openRegistration({id: event.id, title: event.title, date: event.date})}
                              className="bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition duration-300"
                            >
                              Register Now
                            </button>
                            <Link to="/training" className="border border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white font-medium py-2 px-6 rounded transition duration-300">
                              View All Training Programs
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        ) : featuredEvents.length === 1 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative">
                <img 
                  src={featuredEvents[0].image || '/lovable-uploads/pbo.png'} 
                  alt={featuredEvents[0].title} 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-4 left-4 bg-estate-red text-white text-sm uppercase font-bold py-1 px-3 rounded">
                  Coming Soon
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-estate-blue mb-4">{featuredEvents[0].title}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={18} className="mr-3 text-estate-red" />
                    <span>{featuredEvents[0].date}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock size={18} className="mr-3 text-estate-red" />
                    <span>{featuredEvents[0].time}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-3 text-estate-red" />
                    <span>{featuredEvents[0].location}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8">
                  {featuredEvents[0].description || 'Join our intensive training session designed to equip real estate professionals with cutting-edge strategies and practical knowledge for success in today\'s competitive market.'}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => openRegistration({id: featuredEvents[0].id, title: featuredEvents[0].title, date: featuredEvents[0].date})}
                    className="bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition duration-300"
                  >
                    Register Now
                  </button>
                  <Link to="/training" className="border border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white font-medium py-2 px-6 rounded transition duration-300">
                    View All Training Programs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Training Registration Form */}
      {registrationEvent && (
        <TrainingRegistrationForm 
          open={isRegistrationOpen} 
          onClose={closeRegistration} 
          eventTitle={registrationEvent.title}
          eventDate={registrationEvent.date}
        />
      )}
    </section>
  );
};

export default SeminarAndTraining;
