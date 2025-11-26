import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

const TrainingCalendar = () => {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventDates, setEventDates] = useState<Date[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<TrainingEvent[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayEvents = events.filter(event => event.date === dateStr);
      setSelectedDayEvents(dayEvents);
    }
  }, [selectedDate, events]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('training_events')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data) {
      setEvents(data);
      const dates = data.map(event => parseISO(event.date));
      setEventDates(dates);
    }
  };

  const modifiers = {
    eventDay: eventDates
  };

  const modifiersStyles = {
    eventDay: {
      fontWeight: 'bold',
      backgroundColor: 'hsl(var(--estate-blue))',
      color: 'white',
      borderRadius: '50%'
    }
  };

  return (
    <div className="container-custom section-padding">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Training Events Calendar</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          View all scheduled training events in our calendar
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <Badge variant="secondary">{event.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium">Time:</span> {event.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No events scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingCalendar;
