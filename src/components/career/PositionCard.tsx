
import React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, ChevronDown, ChevronUp, Banknote } from 'lucide-react';
import { Position } from './positionsData';

interface PositionCardProps {
  position: Position;
  expanded: boolean;
  onToggle: () => void;
  onApply: (title: string) => void;
}

const PositionCard: React.FC<PositionCardProps> = ({ position, expanded, onToggle, onApply }) => (
  <Card className={`overflow-hidden transition-all duration-300 ${expanded ? 'shadow-lg' : 'shadow-md'}`}>
    <div 
      className="p-6 cursor-pointer flex justify-between items-center"
      onClick={onToggle}
    >
      <div className="flex-grow">
        <h3 className="text-xl font-semibold">{position.title}</h3>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin size={16} className="mr-1" />
            {position.location}
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            {position.type}
          </div>
          <div className="flex items-center">
            <Banknote size={16} className="mr-1" />
            {position.salary}
          </div>
        </div>
      </div>
      <div className="text-estate-blue">
        {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>
    </div>
    {expanded && (
      <CardContent className="pb-6">
        <div className="border-t border-gray-200 pt-4">
          <p className="mb-4 text-gray-700">{position.description}</p>
          <div className="mb-4">
            <h4 className="font-semibold text-lg mb-2">Responsibilities:</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {position.responsibilities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-lg mb-2">Requirements:</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {position.requirements.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <Button 
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); // Prevent card collapse on button click 
                onApply(position.title);
              }}
              className="bg-estate-blue hover:bg-estate-darkBlue flex items-center"
            >
              <Briefcase size={16} className="mr-2" />
              Apply for this position
            </Button>
          </div>
        </div>
      </CardContent>
    )}
  </Card>
);

export default PositionCard;
