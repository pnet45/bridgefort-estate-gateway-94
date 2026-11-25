import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '@/contexts/property/types';
import { MapPin, Bed, Bath, Square, Eye, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PropertyRatingBadge from './PropertyRatingBadge';

interface EnhancedPropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
}

const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({ 
  property, 
  onViewDetails 
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property);
    } else {
      navigate(`/properties/estates/${property.id}`);
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
    <Card
        className={`group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 transform ${
          isHovered ? 'shadow-2xl -translate-y-1' : 'shadow-lg'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewDetails}
      >
        {/* Image Container */}
        <div className="relative h-32 overflow-hidden sm:h-44 lg:h-56">
          <div
            className={`absolute inset-0 bg-black/10 z-10 pointer-events-none transition-opacity duration-300 ${
              isHovered ? 'opacity-30' : 'opacity-15'
            }`}
          />
          <img
            src={property.imageUrl}
            alt={property.title}
            className={`w-full h-full bg-muted object-contain p-1 transition-all duration-300 ${
              isHovered ? 'scale-[1.01]' : 'scale-100'
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
            className={`absolute right-2 top-2 z-20 flex flex-col gap-1 transition-all duration-300 md:right-4 md:top-4 md:gap-2 ${
              isHovered ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
            }`}
          >
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-card/70 dark:bg-card/65 backdrop-blur-sm hover:bg-card/90 shadow-lg"
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
              className="rounded-full bg-card/70 dark:bg-card/65 backdrop-blur-sm hover:bg-card/90 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              <Eye size={16} className="text-gray-600" />
            </Button>
          </div>

          {/* Status Badge */}
          <div className="absolute left-2 top-2 z-20 sm:left-4 sm:top-4">
            {!isAvailable ? (
              <Badge variant="destructive" className="bg-destructive/75 text-white backdrop-blur-sm">
                SOLD OUT
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-beauty-green/75 text-white backdrop-blur-sm">
                AVAILABLE
              </Badge>
            )}
          </div>

          {/* Price Overlay */}
          <div className="absolute bottom-2 left-2 z-20 sm:bottom-4 sm:left-4">
            <div className="rounded-lg border border-border/40 bg-card/75 px-2 py-1 shadow-lg backdrop-blur-sm sm:px-3 sm:py-2">
              <p className="text-xs font-bold text-estate-blue sm:text-base">
                {formatPrice(property.price)}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="min-w-0 space-y-2 p-3 sm:p-5">
          {/* Property Title */}
          <h3 className="line-clamp-2 break-words text-sm font-bold leading-tight text-foreground group-hover:text-estate-blue transition-colors duration-300 sm:text-lg">
            {property.title}
          </h3>

          <PropertyRatingBadge propertyId={property.id} className="mb-2" />

          {/* Location */}
          <div className="flex min-w-0 items-center text-gray-600">
            <MapPin size={13} className="mr-1 shrink-0 text-estate-blue sm:mr-2 sm:h-4 sm:w-4" />
            <span className="min-w-0 truncate text-[10px] sm:text-sm">{property.location}</span>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {property.features?.includes('Bedrooms') || property.title.includes('bedroom') ? (
              <div className="flex items-center">
                <Bed size={16} className="mr-1 text-gray-500" />
                <span className="text-[10px] text-gray-600 sm:text-sm">
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
            
            <div className="text-[10px] text-gray-500 sm:text-sm">
              {isAvailable ? `${property.availablePlots} unit${property.availablePlots > 1 ? 's' : ''} available` : 'Sold out'}
            </div>
          </div>

          {/* Hover Actions */}
          <div
            className={`mt-2 transition-all duration-300 sm:mt-4 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0 md:opacity-0 md:translate-y-4'
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
  );
};

export default EnhancedPropertyCard;