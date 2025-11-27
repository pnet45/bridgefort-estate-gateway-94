import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TrainingEventCard from './TrainingEventCard';
import TrainingEventFilters from './TrainingEventFilters';
import { Loader2 } from 'lucide-react';

interface TrainingEvent {
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

const UpcomingTrainingEvents = () => {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, selectedCategory, startDate, endDate]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingTrainingEvents;