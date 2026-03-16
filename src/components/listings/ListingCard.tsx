import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '@/types/listing';
import { MapPin, Bed, Bath, Car, Maximize, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ListingCardProps {
  listing: Listing;
  viewMode?: 'grid' | 'list';
}

const ListingCard = ({ listing, viewMode = 'grid' }: ListingCardProps) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const thumbnail = listing.photos?.[0] || '/placeholder.svg';

  if (viewMode === 'list') {
    return (
      <Link to={`/listings/${listing.id}`} className="block group">
        <article className="flex flex-col sm:flex-row bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="relative w-full sm:w-72 h-48 sm:h-auto flex-shrink-0">
            <img src={thumbnail} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
            {listing.is_featured && (
            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground"><Star className="w-3 h-3 mr-1" />Featured</Badge>
            )}
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground capitalize">{listing.price_period}</Badge>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{listing.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{listing.city || listing.region}{listing.estate && `, ${listing.estate}`}</p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{listing.description}</p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {listing.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{listing.bedrooms}</span>}
                {listing.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{listing.bathrooms}</span>}
                {listing.parking > 0 && <span className="flex items-center gap-1"><Car className="w-4 h-4" />{listing.parking}</span>}
                {listing.built_sqm && <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{listing.built_sqm}m²</span>}
              </div>
              <p className="text-lg font-bold text-primary">{formatPrice(listing.price_amount)}</p>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <article className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="relative h-52 overflow-hidden">
          <img src={thumbnail} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          {listing.is_featured && (
            <Badge className="absolute top-2 left-2 bg-amber-500 text-white"><Star className="w-3 h-3 mr-1" />Featured</Badge>
          )}
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground capitalize">{listing.price_period}</Badge>
          <Badge className="absolute bottom-2 left-2 bg-background/80 text-foreground backdrop-blur-sm">{listing.property_type}</Badge>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{listing.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{listing.city || listing.region}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 border-t border-border pt-3">
            {listing.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{listing.bedrooms} Beds</span>}
            {listing.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{listing.bathrooms} Baths</span>}
            {listing.parking > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" />{listing.parking} Parking</span>}
          </div>
          <p className="text-lg font-bold text-primary mt-3">{formatPrice(listing.price_amount)}</p>
        </div>
      </article>
    </Link>
  );
};

export default ListingCard;
