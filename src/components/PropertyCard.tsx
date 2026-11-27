import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Layers, Bed, Bath, Home, Maximize, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEcommerce } from '@/contexts/ecommerce';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import ProfileCheckDialog from './ecommerce/ProfileCheckDialog';
import PropertyRatingBadge from './properties/PropertyRatingBadge';
import { Property } from '@/contexts/property/types';
import { useComparison } from '@/contexts/comparison/ComparisonContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Scale } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  const [showProfileCheck, setShowProfileCheck] = useState(false);
  const [profileCheckMessage, setProfileCheckMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useEcommerce();
  const { user, profile } = useAuth();
  const { isSelected, toggle, isFull } = useComparison();

  // Get images array - prioritize media array, fallback to imageUrl
  const getImages = () => {
    if (property.media && property.media.length > 0) {
      return property.media;
    }
    return [property.imageUrl];
  };

  const images = getImages();
  const hasMultipleImages = images.length > 1;

  // Auto-slide functionality - 20 seconds interval
  useEffect(() => {
    if (hasMultipleImages) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 20000); // 20 seconds

      return () => clearInterval(interval);
    }
  }, [hasMultipleImages, images.length]);

  // Get additional info for homes
  const estate = property as any;
  const isHome = property.property_category === 'home';
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    const fallbackImages = [
      '/lovable-uploads/Homeslider.png',
      '/lovable-uploads/Homeslider2.png', 
      '/lovable-uploads/Homeslider3.png',
      '/lovable-uploads/PropertyHero.png'
    ];
    
    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    target.src = randomFallback;
  };

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

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
      // No plot is selected or reserved at cart time. Actual plot details are
      // entered only after the company's allocation process verifies them.
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
    navigate(`/properties/estates/${property.id}`);
  };

  const occupancyRate = ((property.totalPlots - property.availablePlots) / property.totalPlots) * 100;
  const isHighDemand = occupancyRate > 70;
  const isSoldOut = property.availablePlots === 0 || (property as any).is_sold_out === true;
  
  const rentalInfo = getRentalInfo();
  const roomInfo = getBedroomBathInfo();

  return (
    <>
      <div
        className={`glass-card rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group cursor-pointer relative`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {/* Image Container */}
        <div className="relative h-28 overflow-hidden sm:h-40 lg:h-52">
          <img 
            src={images[currentImageIndex]} 
            alt={property.title}
            className="h-full w-full bg-muted object-contain p-1 transition-transform duration-300"
            loading="lazy"
            onError={handleImageError}
          />
          
          {/* Navigation arrows - only show if multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Image indicators - only show if multiple images */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-white'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {property.phase && (
              <Badge variant="secondary" className="bg-card/75 text-foreground backdrop-blur-sm font-semibold">
                Phase {property.phase}
              </Badge>
            )}
            {isHome && (
              <Badge className="bg-estate-blue/85 text-white backdrop-blur-sm">
                <Home size={12} className="mr-1" />
                Home
              </Badge>
            )}
            {isHighDemand && !isSoldOut && (
              <Badge variant="destructive" className="bg-estate-red/85 text-white backdrop-blur-sm">
                High Demand
              </Badge>
            )}
            {isSoldOut && (
              <Badge variant="destructive" className="bg-background/70 text-foreground backdrop-blur-sm">
                SOLD OUT
              </Badge>
            )}
          </div>
          {/* Property Type Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-card/75 text-foreground border-estate-blue/70 backdrop-blur-sm">
              {property.propertyType}
            </Badge>
          </div>
          {/* Compare toggle */}
          <label
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-border/50 bg-card/75 px-2 py-1 text-[9px] font-medium text-foreground backdrop-blur-sm cursor-pointer select-none sm:bottom-3 sm:right-3 sm:gap-1.5 sm:px-2.5 sm:text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isSelected(property.id)}
              onCheckedChange={() => {
                if (!isSelected(property.id) && isFull) {
                  toast({
                    title: 'Comparison full',
                    description: 'You can compare up to 3 properties at a time. Remove one to add another.',
                  });
                  return;
                }
                toggle(property);
              }}
              aria-label={`Add ${property.title} to comparison`}
            />
            <Scale size={12} />
            Compare
          </label>
        </div>
        {/* Content */}
        <div className="min-w-0 space-y-2 p-2.5 sm:space-y-3 sm:p-4">
          <h3 className="line-clamp-2 min-h-[2.5rem] break-words text-sm font-bold leading-tight text-foreground hover:text-estate-blue transition-colors sm:min-h-0 sm:text-lg">
            {property.title}
          </h3>
          <PropertyRatingBadge propertyId={property.id} className="mb-2" />
          <div className="flex min-w-0 items-start text-gray-600">
            <MapPin size={13} className="mr-1 mt-0.5 shrink-0 text-estate-red sm:mr-2 sm:h-4 sm:w-4" />
            <span className="line-clamp-2 min-w-0 break-words text-[10px] leading-tight sm:text-sm">{property.location}</span>
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
          <div className="grid grid-cols-1 gap-1 text-[10px] leading-tight sm:grid-cols-2 sm:gap-2 sm:text-xs">
            <div className="flex items-center">
              <Maximize size={12} className="mr-1 shrink-0 text-estate-blue sm:mr-2 sm:h-4 sm:w-4" />
              <span>{property.sqm} sqm{!isHome ? ' per plot' : ''}</span>
            </div>
            <div className="flex items-center">
              <Users size={12} className="mr-1 shrink-0 text-estate-blue sm:mr-2 sm:h-4 sm:w-4" />
              <span>{property.availablePlots} {isHome ? 'Units' : 'Plots'} Available</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="mb-2 sm:mb-4">
            <p className="break-words text-sm font-bold leading-tight text-estate-red sm:text-xl lg:text-2xl">{property.price}</p>
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
          <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
            <Button
              variant="outline"
              className="h-8 min-w-0 flex-1 px-1 text-[10px] leading-tight border-estate-blue text-estate-blue hover:bg-estate-blue hover:text-white transition-colors sm:h-10 sm:px-3 sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/properties/estates/${property.id}`);
              }}
            >
              View Details
            </Button>
            {!isSoldOut && (
              <Button
                className="h-8 min-w-0 flex-1 px-1 text-[10px] leading-tight bg-estate-red hover:bg-red-600 text-white transition-colors sm:h-10 sm:px-3 sm:text-sm"
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
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/55 dark:bg-background/45 backdrop-blur-[1px] pointer-events-none z-10">
            <span className="rounded-md border border-border/50 bg-background/65 px-3 py-2 text-lg font-bold text-foreground backdrop-blur-sm">SOLD OUT</span>
          </div>
        )}
      </div>
      <ProfileCheckDialog 
        isOpen={showProfileCheck}
        onClose={() => setShowProfileCheck(false)}
        message={profileCheckMessage}
      />
    </>
  );
};

export default PropertyCard;
