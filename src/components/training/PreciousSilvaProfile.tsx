
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const PreciousSilvaProfile = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <Avatar className="h-40 w-40">
        <AvatarImage src="/lovable-uploads/Dalvin-Silva-MD.png" alt="Dr. Dalvin Silva" />
        <AvatarFallback>PS</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-xl font-bold">Dr. Dalvin Silva</h3>
        <p className="text-gray-600">MD/CEO, PWAN Bridgefort</p>
      </div>
      <p className="text-gray-700 max-w-sm">
        Renowned leadership expert, wealth strategist, and transformational speaker
        delivering deep, actionable insights to empower and reposition you for
        sustainable success.
      </p>
    </div>
  );
};

export default PreciousSilvaProfile;
