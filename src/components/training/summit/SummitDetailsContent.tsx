
import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SpeakerProfile from './SpeakerProfile';

interface SummitDetailsContentProps {
  onRegisterClick: () => void;
}

const SummitDetailsContent: React.FC<SummitDetailsContentProps> = ({ onRegisterClick }) => {
  return (
    <ScrollArea className="p-6 max-h-[60vh]">
      <h2 className="text-2xl font-bold mb-4 text-estate-blue">SUCCESS SUMMIT 2025</h2>
      
      <p className="text-lg mb-6">
        Get ready for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt!
      </p>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Host/Event Speaker:</h3>
        <SpeakerProfile 
          image="/lovable-uploads/985da183-5e59-4f48-9f0f-35b5e841d5dd.png" 
          name="Dr. Dalvin Silva, PhD"
          title="MD/CEO, Bridgefort Homes Development Ltd"
          description="Renowned leadership expert, wealth strategist, and transformational speaker, Dr. Silva will be delivering deep, actionable insights to empower and reposition you for sustainable success."
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Host:</h3>
        <SpeakerProfile 
          image="/lovable-uploads/d22fc324-491b-4130-abe6-8ca58eea41f5.png" 
          name="Dr. Julius Oyedemi"
          title="Acting Managing Director, PWAN Group"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Chief Host:</h3>
        <SpeakerProfile 
          image="/lovable-uploads/2ef7dd06-9cf0-458d-b8a2-9e82f2a5cf26.png" 
          name="Dr. Michael Afamefuna Okonkwo"
          title="Executive Chairman, PWAN Group"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Founder & Convener:</h3>
        <SpeakerProfile 
          image="/lovable-uploads/2c263077-7d02-4a8a-a3f5-0ce73e9c72e2.png" 
          name="Jayne O. Onwumere"
          title="Founder/President, PWAN Group"
        />
      </div>
      
      <div className="space-y-2 mb-8">
        <p className="flex items-center text-gray-700">
          <Calendar size={18} className="mr-3 text-estate-blue" />
          <span>Monday, May 12th, 2025</span>
        </p>
        <p className="flex items-center text-gray-700">
          <Clock size={18} className="mr-3 text-estate-blue" />
          <span>10:00 AM Prompt</span>
        </p>
        <p className="flex items-center text-gray-700">
          <MapPin size={18} className="mr-3 text-estate-blue" />
          <span>Autograph Event Center, Sanni Abacha Road, Port Harcourt, Rivers State</span>
        </p>
      </div>
      
      <p className="text-lg font-medium mb-4">
        Don't miss this life-changing opportunity to connect, learn, and grow with some of the most visionary minds in business and leadership.
      </p>
      
      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <p className="font-bold text-estate-blue">Admission is FREE!</p>
        <p>Food & Drinks available.</p>
      </div>
      
      <p className="text-center font-bold text-estate-blue">
        PWAN GROUP — Making Home Ownership Dreams a Reality!
      </p>
      
      <div className="mt-6">
        <Button 
          onClick={onRegisterClick}
          className="w-full bg-estate-red hover:bg-red-700 text-white py-3"
        >
          Register for this Event
        </Button>
      </div>
    </ScrollArea>
  );
};

export default SummitDetailsContent;
