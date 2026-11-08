import React, { useState, useEffect } from 'react';
import { usePublicTrainingEvents } from '@/hooks/usePublicTrainingEvents';
import TrainingEventCard from './TrainingEventCard';
import TrainingEventFilters from './TrainingEventFilters';


const UpcomingTrainingEvents = () => {
  const { events: allEvents, loading } = usePublicTrainingEvents();
  const today = new Date().toISOString().split('T')[0];
  const events = allEvents.filter(event => event.date >= today);
  const [filteredEvents, setFilteredEvents] = useState<typeof events>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    applyFilters();
  }, [allEvents, selectedCategory, startDate, endDate]);

  const applyFilters = () => {
    let filtered = [...events];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    if (startDate) {
      filtered = filtered.filter(event => new Date(event.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(event => new Date(event.date) <= new Date(endDate));
    }
    setFilteredEvents(filtered);
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(event => new Date(event.date) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(event => new Date(event.date) <= new Date(endDate));
    }

    setFilteredEvents(filtered);
  };

  if (loading && allEvents.length === 0) {
    return (
      <section className="py-16 bg-gray-50" aria-label="Loading upcoming training">
        <div className="container-custom">
          <div className="mb-12 h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-xl bg-white shadow">
                <div className="h-48 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-estate-blue mb-4">Upcoming Training</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Don't miss these exclusive training opportunities designed to transform your sales and business success.
          </p>
        </div>

        <TrainingEventFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
        />

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found matching your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
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
                isPastEvent={false}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingTrainingEvents;