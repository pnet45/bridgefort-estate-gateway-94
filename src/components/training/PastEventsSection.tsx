import React from 'react';
import { usePublicTrainingEvents } from '@/hooks/usePublicTrainingEvents';
import TrainingEventCard from './TrainingEventCard';


const PastEventsSection = () => {
  const { events, loading } = usePublicTrainingEvents();
  const today = new Date().toISOString().split('T')[0];
  const pastEvents = events.filter(event => event.date < today).sort((a, b) => b.date.localeCompare(a.date));

  if (loading && events.length === 0) {
    return (
      <section className="py-16 bg-background" aria-label="Loading past events">
        <div className="container-custom">
          <div className="mb-12 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
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
