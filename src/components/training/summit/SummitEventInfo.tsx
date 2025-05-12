
import React from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const SummitEventInfo: React.FC = () => {
  return (
    <div className="space-y-4 mb-8 bg-white bg-opacity-10 p-4 rounded-lg">
      <div className="flex items-center">
        <Calendar className="mr-3 text-estate-red flex-shrink-0" />
        <span className="text-lg">Monday, May 12th, 2025</span>
      </div>
      
      <div className="flex items-center">
        <Clock className="mr-3 text-estate-red flex-shrink-0" />
        <span className="text-lg">10:00 AM Prompt</span>
      </div>
      
      <div className="flex items-center">
        <MapPin className="mr-3 text-estate-red flex-shrink-0" />
        <span className="text-lg">Autograph Event Center, Sanni Abacha Road, Port Harcourt</span>
      </div>
      
      <div className="flex items-center">
        <Users className="mr-3 text-estate-red flex-shrink-0" />
        <span className="text-lg">Admission is FREE! Food & Drinks available.</span>
      </div>
    </div>
  );
};

export default SummitEventInfo;
