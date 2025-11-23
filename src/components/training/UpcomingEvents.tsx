import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import TrainingRegistrationForm from './TrainingRegistrationForm';
import AllEventsDialog from './AllEventsDialog';
import { supabase } from '@/integrations/supabase/client';

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string | null;
  capacity: string;
  category: string;
  description?: string | null;
  featured: boolean;
}

export const getUpcomingEvents = async (): Promise<TrainingEvent[]> => {
  const { data, error } = await supabase
    .from('training_events')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return data || [];
};

export const getFeaturedEvent = async (): Promise<TrainingEvent | null> => {
  const { data, error } = await supabase
    .from('training_events')
    .select('*')
    .eq('featured', true)
    .order('date', { ascending: true })
    .limit(1)
    .single();
  
  if (error || !data) {
    const events = await getUpcomingEvents();
    return events[0] || null;
  }
  
  return data;
};
const UpcomingEvents = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationEvent, setRegistrationEvent] = useState<null | {
    id: string;
    title: string;
    date: string;
  }>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const events = await getUpcomingEvents();
    setUpcomingEvents(events);
    setLoading(false);
  };

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

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center">Loading events...</div>
        </div>
      </section>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-gray-600">No upcoming events at this time.</p>
          </div>
        </div>
      </section>
    );
  }
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
                <img src={event.image || '/lovable-uploads/pbo.png'} alt={event.title} className="w-full h-60 object-cover object-center" />
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
        events={upcomingEvents}
        onRegister={openRegistration}
      />

      {/* Training Registration Form */}
      {registrationEvent && <TrainingRegistrationForm open={!!registrationEvent} onClose={closeRegistration} eventTitle={registrationEvent.title} eventDate={registrationEvent.date} />}
    </section>;
};
export default UpcomingEvents;