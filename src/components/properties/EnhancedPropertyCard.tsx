import React, { useState } from 'react';
import { Property } from '@/contexts/property/types';
import { MapPin, Bed, Bath, Square, Eye, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PropertyDetailsDialog from '../PropertyDetailsDialog';
import PropertyRatingBadge from './PropertyRatingBadge';

interface EnhancedPropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
}

const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({ 
  property, 
  onViewDetails 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property);
    } else {
      setShowDetails(true);
    }
  };

  const formatPrice = (price: string | number) => {
    if (typeof price === 'string') return price;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isAvailable = property.availablePlots && property.availablePlots > 0;

  return (
    <>
      <Card
        className={`group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 transform ${
          isHovered ? 'shadow-2xl scale-105' : 'shadow-lg'
        } ${!isAvailable ? 'opacity-75' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewDetails}
      >
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-60'
            }`}
          />
          <img
            src={property.imageUrl}
            alt={property.title}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isHovered ? 'scale-110 brightness-110' : 'scale-100'
            }`}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Try fallback to a default estate image from public folder
              if (!target.src.includes('Homeslider')) {
                target.src = '/lovable-uploads/PropertyHero.png';
              } else {
                target.src = '/placeholder.svg';
              }
            }}
          />
          
          {/* Floating Action Buttons */}
          <div
            className={`absolute top-4 right-4 z-20 flex flex-col gap-2 transition-all duration-300 ${
              isHovered ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
            }`}
          >
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            >
              <Heart 
                size={16} 
                className={`transition-colors duration-200 ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`} 
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              <Eye size={16} className="text-gray-600" />
            </Button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 left-4 z-20">
            {!isAvailable ? (
              <Badge variant="destructive" className="bg-red-500/90 text-white">
                SOLD OUT
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-500/90 text-white">
                AVAILABLE
              </Badge>
            )}
          </div>

          {/* Price Overlay */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <p className="text-lg font-bold text-estate-blue">
                {formatPrice(property.price)}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Property Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-estate-blue transition-colors duration-300">
            {property.title}
          </h3>

          <PropertyRatingBadge propertyId={property.id} className="mb-2" />

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin size={16} className="mr-2 text-estate-blue" />
            <span className="text-sm truncate">{property.location}</span>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {property.features?.includes('Bedrooms') || property.title.includes('bedroom') ? (
              <div className="flex items-center">
                <Bed size={16} className="mr-1 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {property.title.match(/(\d+).?bed/i)?.[1] || '3'} Bed
                </span>
              </div>
            ) : null}
            
            {property.features?.includes('Bathrooms') || property.title.includes('bathroom') ? (
              <div className="flex items-center">
                <Bath size={16} className="mr-1 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {property.title.match(/(\d+).?bath/i)?.[1] || '3'} Bath
                </span>
              </div>
            ) : null}

            <div className="flex items-center">
              <Square size={16} className="mr-1 text-gray-500" />
              <span className="text-sm text-gray-600">{property.sqm}m²</span>
            </div>
          </div>

          {/* Property Type */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {property.propertyType}
            </Badge>
            
            <div className="text-sm text-gray-500">
              {isAvailable ? `${property.availablePlots} unit${property.availablePlots > 1 ? 's' : ''} available` : 'Sold out'}
            </div>
          </div>

          {/* Hover Actions */}
          <div
            className={`mt-4 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Button
              className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <PropertyDetailsDialog
          property={property}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default EnhancedPropertyCard;