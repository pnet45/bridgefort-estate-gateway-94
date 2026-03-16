import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from '@/types/listing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Car, Maximize, Calendar, Phone, Mail, ArrowLeft, Star, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (id) fetchListing(id);
  }, [id]);

  const fetchListing = async (listingId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (!error && data) {
      setListing(data as unknown as Listing);
    }
    setLoading(false);
  };

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-20 gap-4">
          <p className="text-xl font-semibold">Listing not found</p>
          <Link to="/listings"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to Listings</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const photos = listing.photos?.length ? listing.photos : ['/placeholder.svg'];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20">
        {/* Breadcrumb */}
        <div className="container-custom py-4">
          <Link to="/listings" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Listings
          </Link>
        </div>

        {/* Gallery */}
        <div className="container-custom">
          <div className="relative rounded-2xl overflow-hidden bg-muted h-64 sm:h-96 lg:h-[500px]">
            <img src={photos[activePhoto]} alt={listing.title} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={() => setActivePhoto(p => (p - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setActivePhoto(p => (p + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button key={i} onClick={() => setActivePhoto(i)} className={`w-2 h-2 rounded-full transition ${i === activePhoto ? 'bg-primary scale-125' : 'bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              {listing.is_featured && <Badge className="bg-amber-500 text-white"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
              <Badge className="bg-primary text-primary-foreground capitalize">{listing.price_period}</Badge>
              <Badge variant="secondary">{listing.property_type}</Badge>
            </div>
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setActivePhoto(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${i === activePhoto ? 'border-primary' : 'border-transparent'}`}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-foreground">{listing.title}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-2 text-lg">
                  <MapPin className="w-4 h-4" />{listing.address || listing.city || listing.region}
                  {listing.hotspot && <span className="text-primary ml-2">· {listing.hotspot}</span>}
                </p>
                <p className="text-3xl font-bold text-primary mt-4">{formatPrice(listing.price_amount)}</p>
                {listing.price_negotiable && <Badge variant="outline" className="mt-2">Price Negotiable</Badge>}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {listing.bedrooms > 0 && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <Bed className="w-6 h-6 mx-auto text-primary" />
                    <p className="font-bold mt-1">{listing.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                )}
                {listing.bathrooms > 0 && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <Bath className="w-6 h-6 mx-auto text-primary" />
                    <p className="font-bold mt-1">{listing.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                )}
                {listing.parking > 0 && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <Car className="w-6 h-6 mx-auto text-primary" />
                    <p className="font-bold mt-1">{listing.parking}</p>
                    <p className="text-xs text-muted-foreground">Parking</p>
                  </div>
                )}
                {(listing.built_sqm || listing.land_sqm) && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <Maximize className="w-6 h-6 mx-auto text-primary" />
                    <p className="font-bold mt-1">{listing.built_sqm || listing.land_sqm}m²</p>
                    <p className="text-xs text-muted-foreground">{listing.built_sqm ? 'Built Area' : 'Land Area'}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {listing.description && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
                </div>
              )}

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map(a => <Badge key={a} variant="secondary">{a}</Badge>)}
                  </div>
                </div>
              )}

              {/* Payment options */}
              {listing.payment_options?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Payment Options</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.payment_options.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact card */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 sticky top-24">
                <h3 className="font-bold text-lg">Interested in this property?</h3>
                <p className="text-sm text-muted-foreground">Contact the listing agent to schedule a viewing or request more information.</p>
                {listing.owner_name && <p className="font-semibold">{listing.owner_name}</p>}
                {listing.owner_phone && (
                  <a href={`tel:${listing.owner_phone}`} className="w-full">
                    <Button className="w-full" size="lg"><Phone className="w-4 h-4 mr-2" />Call Agent</Button>
                  </a>
                )}
                {listing.owner_email && (
                  <a href={`mailto:${listing.owner_email}`} className="w-full">
                    <Button variant="outline" className="w-full" size="lg"><Mail className="w-4 h-4 mr-2" />Email Agent</Button>
                  </a>
                )}
                <a
                  href={`https://wa.me/${listing.owner_phone?.replace(/\D/g, '')}?text=Hi, I'm interested in ${listing.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="secondary" className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">WhatsApp</Button>
                </a>
              </div>

              {/* Disclosures */}
              <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-3">
                <h3 className="font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Property Disclosures</h3>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p>Ownership: <span className="font-medium text-foreground">{listing.ownership_status || 'N/A'}</span></p>
                  <p>Tax Status: <span className="font-medium text-foreground">{listing.tax_status || 'N/A'}</span></p>
                  <p>Encumbrances: <span className="font-medium text-foreground">{listing.encumbrances || 'N/A'}</span></p>
                </div>
                {listing.year_built && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Built in {listing.year_built}
                  </p>
                )}
                {listing.roi_percent && (
                  <p className="text-sm font-medium text-primary">Est. ROI: {listing.roi_percent}%</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingDetails;
