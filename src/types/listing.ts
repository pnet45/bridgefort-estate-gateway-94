export type ListingRegion = 'Lagos' | 'Asaba' | 'Port Harcourt' | 'Ogun';
export type ListingPropertyType = 'Villa' | 'Apartment' | 'Penthouse' | 'Townhouse' | 'Land' | 'Duplex' | 'Bungalow' | 'Other';
export type ListingPricePeriod = 'sale' | 'rent' | 'lease';

export interface Listing {
  id: string;
  region: ListingRegion;
  city?: string;
  estate?: string;
  title: string;
  description?: string;
  property_type: ListingPropertyType;
  price_amount: number;
  price_currency: string;
  price_period: ListingPricePeriod;
  address?: string;
  latitude?: number;
  longitude?: number;
  built_sqm?: number;
  land_sqm?: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  parking_type?: string;
  year_built?: number;
  amenities: string[];
  photos: string[];
  video_tours: string[];
  drone_footage: string[];
  floor_plans: string[];
  tour_3d_url?: string;
  deposit_amount?: number;
  monthly_rent?: number;
  annual_rent?: number;
  payment_options: string[];
  maintenance_fees?: number;
  hoa_fees?: number;
  min_rental_months?: number;
  max_rental_months?: number;
  price_negotiable: boolean;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  ownership_status?: string;
  tax_status?: string;
  encumbrances?: string;
  hotspot?: string;
  roi_percent?: number;
  is_featured: boolean;
  is_published: boolean;
  listing_start_date?: string;
  special_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const REGIONS: { value: ListingRegion; label: string; description: string }[] = [
  { value: 'Lagos', label: 'Lagos', description: 'Luxury waterfront & gated communities' },
  { value: 'Asaba', label: 'Asaba', description: 'Affordable luxury developments' },
  { value: 'Port Harcourt', label: 'Port Harcourt', description: 'Secure family compounds' },
  { value: 'Ogun', label: 'Ogun', description: 'Land investment & suburban growth' },
];

export const PROPERTY_TYPES: ListingPropertyType[] = [
  'Villa', 'Apartment', 'Penthouse', 'Townhouse', 'Land', 'Duplex', 'Bungalow', 'Other'
];
