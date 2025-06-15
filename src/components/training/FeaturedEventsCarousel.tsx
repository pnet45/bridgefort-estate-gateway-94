import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { getUpcomingEvents } from './UpcomingEvents';
import TrainingRegistrationForm from './TrainingRegistrationForm';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
const FeaturedEventsCarousel = () => {
  const featuredEvents = getUpcomingEvents().filter(event => event.featured);
  const [registrationEvent, setRegistrationEvent] = useState<null | {
    id: number;
    title: string;
    date: string;
  }>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
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

  // Auto-slide functionality - changed to 10 seconds
  useEffect(() => {
    if (featuredEvents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredEvents.length);
    }, 10000); // Slides every 10 seconds

    return () => clearInterval(interval);
  }, [featuredEvents.length]);
  if (featuredEvents.length === 0) return null;
  return <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Featured Events</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Don't miss our upcoming featured training events
          </p>
        </div>

        <div className="relative">
          <Carousel opts={{
          align: "start",
          loop: true
        }} className="w-full" setApi={api => {
          if (api) {
            api.scrollTo(currentSlide);
          }
        }}>
            <CarouselContent>
              {featuredEvents.map(event => <CarouselItem key={event.id} className="basis-full">
                  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition duration-300 border-0 h-full">
                    <div className="relative">
                      <img src={event.image} alt={event.title} className="w-full h-72 object-center object-contain" />
                      <div className="absolute top-3 left-3 bg-estate-blue text-white text-xs uppercase font-bold py-1 px-2 rounded">
                        {event.category}
                      </div>
                      <div className="absolute top-3 right-3 bg-estate-red text-white text-xs uppercase font-bold py-1 px-2 rounded">
                        Featured
                      </div>
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
                  </Card>
                </CarouselItem>)}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {/* Training Registration Form */}
      {registrationEvent && <TrainingRegistrationForm open={!!registrationEvent} onClose={closeRegistration} eventTitle={registrationEvent.title} eventDate={registrationEvent.date} />}
    </section>;
};
export default FeaturedEventsCarousel;