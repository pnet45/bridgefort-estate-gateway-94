import React from 'react';
import positions from './positionsData';
import PositionCard from './PositionCard';

interface OpenPositionsProps {
  onApply?: (position?: string) => void;
}

const OpenPositions: React.FC<OpenPositionsProps> = ({ onApply }) => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleApply = (position: string) => {
    if (onApply) {
      onApply(position);
    }
  };

  return (
    <section className="bg-gray-50 py-16" id="positions">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're looking for talented individuals to join our team. Check out our current openings and apply today.
          </p>
        </div>
        <div className="space-y-6">
          {positions.map((position, index) => (
            <PositionCard
              key={position.title}
              position={position}
              expanded={expandedIndex === index}
              onToggle={() => toggleExpanded(index)}
              onApply={handleApply}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpenPositions;
