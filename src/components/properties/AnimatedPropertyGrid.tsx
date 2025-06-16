
import React, { useEffect, useState } from 'react';
import PropertyCard from '../PropertyCard';

interface Property {
  name: string;
  plotNumber: number;
  size: number;
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  sqm: number;
  propertyType: string;
  phase?: number;
  totalPlots?: number;
  availablePlots?: number;
  pricePerPlot?: number;
}

interface AnimatedPropertyGridProps {
  properties: Property[];
}

const AnimatedPropertyGrid = ({ properties }: AnimatedPropertyGridProps) => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      properties.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 200);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [properties]);

  const getAnimationClass = (index: number) => {
    if (!visibleCards.includes(index)) return 'opacity-0 transform scale-95';
    
    const totalCards = properties.length;
    const middleIndex = Math.floor(totalCards / 2);
    
    if (index === middleIndex) {
      return 'opacity-100 transform scale-100 animate-scale-in';
    } else if (index < middleIndex) {
      return 'opacity-100 transform translate-x-0 animate-slide-in-left';
    } else {
      return 'opacity-100 transform translate-x-0 animate-slide-in-right';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property, index) => (
        <div
          key={property.id}
          className={`transition-all duration-700 ease-out ${getAnimationClass(index)}`}
          style={{
            animationDelay: `${index * 200}ms`
          }}
        >
          <PropertyCard propertyName={property.name || property.title}
                plotNumber={property.plotNumber || 0}
                size={property.size || property.sqm} id={''} location={''} imageUrl={''} pricePerPlot={0} propertyType={''}/>
        </div>
      ))}
    </div>
  );
};

export default AnimatedPropertyGrid;
