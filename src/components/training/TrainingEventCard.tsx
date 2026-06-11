import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Phone, Users, BarChart3 } from 'lucide-react';
import TrainingRegistrationForm from './TrainingRegistrationForm';
import TrainingEventAnalytics from './TrainingEventAnalytics';

interface TrainingEventCardProps {
  title: string;
  description: string;
  speaker?: string;
  host?: string;
  date: string;
  time: string;
  venue: string;
  capacity?: string;
  duration?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  isPastEvent?: boolean;
  eventId?: string;
}

const TrainingEventCard = ({
  title,
  description,
  speaker,
  host,
  date,
  time,
  venue,
  capacity,
  duration,
  phone,
  email,
  website,
  category,
  isPastEvent = false,
  eventId
}: TrainingEventCardProps) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col hover:animate-bounce-zoom hover:scale-105 cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-primary text-lg leading-tight">{title}</CardTitle>
            {category && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                {category}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            
            {speaker && (
              <div className="bg-primary/5 p-3 rounded-lg">
                <p className="text-sm font-semibold text-primary">Speaker: {speaker}</p>
              </div>
            )}
            
            {host && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-semibold text-foreground">Host: {host}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>{time}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="mt-0.5" />
                <span>{venue}</span>
              </div>
              {capacity && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users size={16} />
                  <span>{capacity}</span>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={16} />
                  <span>Duration: {duration}</span>
                </div>
              )}
            </div>
            
            {phone && (
              <div className="bg-destructive/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} />
                  <span className="font-medium text-destructive">For inquiries: {phone}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-4">
          {isPastEvent ? (
            <>
              {eventId && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAnalytics(true)}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              )}
              <Button className="flex-1" variant="secondary" disabled>
                Event Completed
              </Button>
            </>
          ) : (
            <>
              {eventId && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowAnalytics(true)}
                  title="View Analytics"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              )}
              <Button 
                onClick={() => setIsRegistrationOpen(true)}
                className="flex-1 bg-gradient-to-r from-primary to-destructive hover:opacity-90"
              >
                Register for Training
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <TrainingRegistrationForm
        open={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        eventTitle={title}
        eventDate={date}
      />

      {eventId && (
        <TrainingEventAnalytics
          eventId={eventId}
          eventTitle={title}
          open={showAnalytics}
          onOpenChange={setShowAnalytics}
        />
      )}
    </>
  );
};

export default TrainingEventCard;
