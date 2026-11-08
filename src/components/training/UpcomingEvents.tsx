import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import TrainingRegistrationForm from './TrainingRegistrationForm';
import AllEventsDialog from './AllEventsDialog';
import { refreshPublicTrainingEvents, usePublicTrainingEvents, type PublicTrainingEvent } from '@/hooks/usePublicTrainingEvents';

type TrainingEvent = PublicTrainingEvent;

export const getUpcomingEvents = refreshPublicTrainingEvents;

export const getFeaturedEvent = async (): Promise<TrainingEvent | null> => {
  const events = await refreshPublicTrainingEvents();
  return events.find((event) => event.featured) || events[0] || null;
};

const UpcomingEvents = () => {
  const { events, loading } = usePublicTrainingEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events.filter(event => new Date(event.date) >= today);
  const pastEvents = events.filter(event => new Date(event.date) < today);
  const [registrationEvent, setRegistrationEvent] = useState<null | {
    id: string;
    title: string;
    date: string;
  }>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const openRegistration = (event: {
    id: string;
    title: string;
    date: string;
  }) => {
    setRegistrationEvent(event);
  };

  const closeRegistration = () => {
    setRegistrationEvent(null);
  };

  if (loading && events.length === 0) {
    return (
      <section className="py-16 bg-gray-50" aria-label="Loading training events">
        <div className="container-custom">
          <div className="mb-10 h-8 w-64 mx-auto animate-pulse rounded bg-slate-200" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-xl bg-white shadow">
                <div className="h-60 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-6">
                  <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const renderEventCard = (event: TrainingEvent, isPast: boolean) => (
    <Card key={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition duration-300 border-0">
      <div className="relative">
        <img src={event.image || '/lovable-uploads/pbo.png'} alt={event.title} className="w-full h-60 object-cover object-center" loading="lazy" decoding="async" />
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
        
        {isPast ? (
          <button 
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-300"
            onClick={() => setShowAllEvents(true)}
          >
            View Events
          </button>
        ) : (
          <button 
            className="w-full bg-estate-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-300" 
            onClick={() => openRegistration({
              id: event.id,
              title: event.title,
              date: event.date
            })}
          >
            Register Now
          </button>
        )}
      </CardContent>
    </Card>
  );
  return <section className="py-16 bg-gray-50">
      <div className="container-custom">
        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Join our in-person training events for hands-on learning and networking opportunities with industry experts.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {upcomingEvents.map(event => renderEventCard(event, false))}
            </div>
          </>
        )}

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Past Events</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Review our previous training events and see what we've accomplished together.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map(event => renderEventCard(event, true))}
            </div>
          </>
        )}

        {upcomingEvents.length === 0 && pastEvents.length === 0 && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Training Events</h2>
            <p className="text-gray-600">No events available at this time.</p>
          </div>
        )}
        
        <div className="text-center mt-10">
          <button 
            className="btn-primary"
            onClick={() => setShowAllEvents(true)}
          >
            View All Events
          </button>
        </div>
      </div>
      
      {/* All Events Dialog */}
      <AllEventsDialog 
        open={showAllEvents}
        onClose={() => setShowAllEvents(false)}
        events={[...upcomingEvents, ...pastEvents]}
        onRegister={openRegistration}
      />

      {/* Training Registration Form */}
      {registrationEvent && <TrainingRegistrationForm open={!!registrationEvent} onClose={closeRegistration} eventTitle={registrationEvent.title} eventDate={registrationEvent.date} />}
    </section>;
};
export default UpcomingEvents;