import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TrainingEventCard from './TrainingEventCard';
import { Loader2 } from 'lucide-react';

interface PastEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  capacity: string;
  category: string;
  image: string | null;
}

const PastEventsSection = () => {
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .lt('date', today)
        .order('date', { ascending: false });

      if (error) throw error;
      setPastEvents(data || []);
    } catch (error) {
      console.error('Error fetching past events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container-custom flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (pastEvents.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">Past Events & Training</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Review our previous successful training events and seminars. View highlights and outcomes from past sessions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastEvents.map((event) => (
            <TrainingEventCard
              key={event.id}
              eventId={event.id}
              title={event.title}
              description={event.description || ''}
              date={new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              time={event.time}
              venue={event.location}
              capacity={event.capacity}
              category={event.category}
              isPastEvent={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PastEventsSection;
