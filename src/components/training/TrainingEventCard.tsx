import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Phone, Users } from 'lucide-react';
import TrainingRegistrationForm from './TrainingRegistrationForm';

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
  website
}: TrainingEventCardProps) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow h-full">
        <CardHeader>
          <CardTitle className="text-estate-blue text-lg leading-tight">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
            
            {speaker && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-estate-blue">Speaker: {speaker}</p>
              </div>
            )}
            
            {host && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-estate-brown">Host: {host}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>{time}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={16} className="mt-0.5" />
                <span>{venue}</span>
              </div>
              {capacity && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{capacity}</span>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>Duration: {duration}</span>
                </div>
              )}
            </div>
            
            {phone && (
              <div className="bg-estate-red/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} />
                  <span className="font-medium text-estate-red">For inquiries: {phone}</span>
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => setIsRegistrationOpen(true)}
              className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white"
            >
              Register for Training
            </Button>
          </div>
        </CardContent>
      </Card>

      <TrainingRegistrationForm
        open={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        eventTitle={title}
        eventDate={date}
      />
    </>
  );
};

export default TrainingEventCard;