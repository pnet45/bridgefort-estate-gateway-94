import React, { useState } from 'react';
import { MapPin, Users, Layers, Bed, Bath, Home, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEcommerce } from '@/contexts/ecommerce';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import PropertyDetailsDialogFullscreen from './PropertyDetailsDialogFullscreen';
import ProfileCheckDialog from './ecommerce/ProfileCheckDialog';
import { Property } from '@/contexts/property/types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showProfileCheck, setShowProfileCheck] = useState(false);
  const [profileCheckMessage, setProfileCheckMessage] = useState('');
  const { addToCart } = useEcommerce();
  const { user, profile } = useAuth();

  // Get additional info for homes
  const estate = property as any;
  const isHome = property.property_category === 'home';
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getRentalInfo = () => {
    if (estate.monthly_rent && estate.annual_rent) {
      return {
        monthly: formatPrice(estate.monthly_rent),
        annual: formatPrice(estate.annual_rent)
      };
    }
    return null;
  };

  const getBedroomBathInfo = () => {
    if (estate.bedrooms || estate.bathrooms) {
      return {
        bedrooms: estate.bedrooms || 0,
        bathrooms: estate.bathrooms || 0
      };
    }
    return null;
  };

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!user) {
      setProfileCheckMessage("Please log in to add properties to your cart.");
      setShowProfileCheck(true);
      return;
    }
    
    // Check if profile is completed
    if (!profile?.profile_completed) {
      setProfileCheckMessage("Please complete your profile before adding properties to your cart.");
      setShowProfileCheck(true);
      return;
    }

    const plot = {
      id: `${property.id}-plot-${Date.now()}`,
      propertyId: property.id,
      plotNumber: Math.floor(Math.random() * property.totalPlots) + 1,
      size: property.sqm,
      pricePerPlot: property.pricePerPlot,
      propertyName: property.title,
      location: property.location,
      imageUrl: property.imageUrl,
      propertyType: property.propertyType
    };

    addToCart(plot, 1);
    
    toast({
      title: "Added to cart",
      description: `${property.title} has been added to your cart`,
    });
  };

  const handleCardClick = () => {
    setIsDetailsOpen(true);
  };

  const occupancyRate = ((property.totalPlots - property.availablePlots) / property.totalPlots) * 100;
  const isHighDemand = occupancyRate > 70;
  const isSoldOut = property.availablePlots === 0;
  
  const rentalInfo = getRentalInfo();
  const roomInfo = getBedroomBathInfo();

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fade-in group cursor-pointer relative ${isSoldOut ? 'opacity-60' : ''}`}
        onClick={handleCardClick}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={property.imageUrl} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {property.phase && (
              <Badge variant="secondary" className="bg-white/90 text-estate-blue font-semibold">
                Phase {property.phase}
              </Badge>
            )}
            {isHome && (
              <Badge className="bg-estate-blue text-white">
                <Home size={12} className="mr-1" />
                Home
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
              {property.propertyType}
            </Badge>
          </div>
        </div>
        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-estate-blue transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin size={16} className="mr-2 text-estate-red" />
            <span className="text-sm">{property.location}</span>
          </div>
          
          {/* Room info for homes */}
          {isHome && roomInfo && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              {roomInfo.bedrooms > 0 && (
                <div className="flex items-center">
                  <Bed size={14} className="mr-1" />
                  {roomInfo.bedrooms} bed{roomInfo.bedrooms > 1 ? 's' : ''}
                </div>
              )}
              {roomInfo.bathrooms > 0 && (
                <div className="flex items-center">
                  <Bath size={14} className="mr-1" />
                  {roomInfo.bathrooms} bath{roomInfo.bathrooms > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
          
          {/* Property Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center">
              <Maximize size={16} className="mr-2 text-estate-blue" />
              <span>{property.sqm} sqm{!isHome ? ' per plot' : ''}</span>
            </div>
            <div className="flex items-center">
              <Users size={16} className="mr-2 text-estate-blue" />
              <span>{property.availablePlots} {isHome ? 'Units' : 'Plots'} Available</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="mb-4">
            <p className="text-2xl font-bold text-estate-red">{property.price}</p>
            {property.pricePerPlot > 0 && !isHome && (
              <p className="text-sm text-gray-600">₦{property.pricePerPlot.toLocaleString()} per plot</p>
            )}
            
            {/* Rental price for homes */}
            {isHome && rentalInfo && (
              <div className="text-sm text-gray-600 mt-2">
                <div>Monthly: <span className="font-semibold text-green-600">{rentalInfo.monthly}</span></div>
                <div>Annual: <span className="font-semibold text-green-600">{rentalInfo.annual}</span></div>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Availability</span>
              <span>{Math.round((property.availablePlots / property.totalPlots) * 100)}% available</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-estate-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${(property.availablePlots / property.totalPlots) * 100}%` }}
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
      <PropertyDetailsDialogFullscreen
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        property={{
          id: property.id,
          title: property.title,
          location: property.location,
          price: property.price,
          imageUrl: property.imageUrl,
          propertyType: property.propertyType
        }}
      />
      
      <ProfileCheckDialog 
        isOpen={showProfileCheck}
        onClose={() => setShowProfileCheck(false)}
        message={profileCheckMessage}
      />
    </>
  );
};

export default PropertyCard;
