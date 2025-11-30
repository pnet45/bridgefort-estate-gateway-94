import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, MapPin, Users, Clock } from 'lucide-react';

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string | null;
  capacity: string;
  description?: string | null;
}

const TrainingCalendar = () => {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventDates, setEventDates] = useState<Date[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<TrainingEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TrainingEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

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
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsEventDialogOpen(true);
                    }}
                    className="p-4 border border-border rounded-lg hover:shadow-md hover:border-estate-blue transition-all cursor-pointer"
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

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-estate-blue">
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Event Image */}
                {selectedEvent.image && (
                  <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
                    <img 
                      src={selectedEvent.image} 
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Event Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-estate-blue mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">{selectedEvent.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-estate-blue mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">{selectedEvent.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-estate-blue mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{selectedEvent.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-estate-blue mt-0.5" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-muted-foreground">{selectedEvent.capacity}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">{selectedEvent.category}</Badge>
                  </div>
                </div>

                {/* Event Description */}
                {selectedEvent.description && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">About This Event</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingCalendar;
