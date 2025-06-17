import React, { useState } from 'react';
import { MapPin, Users, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEcommerce } from '@/contexts/ecommerce';
import { toast } from '@/hooks/use-toast';
import PropertyDetailsDialog from './PropertyDetailsDialog';

interface PropertyCardProps {
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

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  location,
  price,
  imageUrl,
  sqm,
  propertyType,
  phase = 1,
  totalPlots = 100,
  availablePlots = 50,
  pricePerPlot = 1000000
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { addToCart } = useEcommerce();

  const handleAddToCart = () => {
    const plot = {
      id: `${id}-plot-${Date.now()}`,
      propertyId: id,
      plotNumber: Math.floor(Math.random() * totalPlots) + 1,
      size: sqm,
      pricePerPlot,
      propertyName: title,
      location,
      imageUrl,
      propertyType
    };

    addToCart(plot, 1);
  };

  const handleCardClick = () => {
    setIsDetailsOpen(true);
  };

  const occupancyRate = ((totalPlots - availablePlots) / totalPlots) * 100;
  const isHighDemand = occupancyRate > 70;
  const isSoldOut = availablePlots === 0;

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fade-in group cursor-pointer relative ${isSoldOut ? 'opacity-60' : ''}`}
        onClick={handleCardClick}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {phase && (
              <Badge variant="secondary" className="bg-white/90 text-estate-blue font-semibold">
                Phase {phase}
              </Badge>
            )}
            {isHighDemand && !isSoldOut && (
              <Badge variant="destructive" className="bg-estate-red text-white">
                High Demand
              </Badge>
            )}
            {isSoldOut && (
              <Badge variant="destructive" className="bg-gray-600 text-white">
                SOLD OUT
              </Badge>
            )}
          </div>
          {/* Property Type Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white/90 text-estate-blue border-estate-blue">
              {propertyType}
            </Badge>
          </div>
        </div>
        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-estate-blue transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin size={16} className="mr-2 text-estate-red" />
            <span className="text-sm">{location}</span>
          </div>
          {/* Property Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center">
              <Layers size={16} className="mr-2 text-estate-blue" />
              <span>{sqm} sqm</span>
            </div>
            <div className="flex items-center">
              <Users size={16} className="mr-2 text-estate-blue" />
              <span>{availablePlots}/{totalPlots} plots</span>
            </div>
          </div>
          {/* Price */}
          <div className="mb-4">
            <p className="text-2xl font-bold text-estate-red">{price}</p>
            {pricePerPlot > 0 && (
              <p className="text-sm text-gray-600">₦{pricePerPlot.toLocaleString()} per plot</p>
            )}
          </div>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Availability</span>
              <span>{Math.round((availablePlots / totalPlots) * 100)}% available</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-estate-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${(availablePlots / totalPlots) * 100}%` }}
              ></div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
            >
              View Details
            </Button>
            {!isSoldOut && (
              <Button
                className="flex-1 bg-estate-red hover:bg-red-600 text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
              >
                Add to Cart
              </Button>
            )}
          </div>
        </div>
        {/* Overlay if sold out */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg pointer-events-none z-10">
            <span className="text-lg font-bold text-gray-600">SOLD OUT</span>
          </div>
        )}
      </div>
      <PropertyDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        property={{
          id,
          title,
          location,
          price,
          imageUrl,
          propertyType
        }}
      />
    </>
  );
};

export default PropertyCard;
