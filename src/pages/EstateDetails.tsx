import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Download, MapPin, ShoppingCart, Building2, Calendar, Phone, Mail, MapIcon,
  Clock, Shield, Play, ChevronLeft, ChevronRight, X, ArrowLeft, Loader2, CalendarCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyReviews from '@/components/reviews/PropertyReviews';
import InspectionBookingForm from '@/components/dashboard/InspectionBookingForm';
import { usePropertyView } from '@/hooks/usePropertyViews';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEcommerce } from '@/contexts/ecommerce';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plot } from '@/contexts/ecommerce/types';

interface EstateProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  propertyType: string;
  description?: string;
  property_category?: string;
}

// Same pricing logic used by the properties list, kept identical here so a
// price shown on a card matches the price shown on this detail page exactly.
function mapEstateRowToProperty(estate: any): EstateProperty {
  let price = 'Price on Request';
  if (estate.promo_price) price = `₦${Number(estate.promo_price).toLocaleString()}`;
  else if (estate.prelaunch_price && estate.actual_price) {
    price = `Pre-Launch: ₦${Number(estate.prelaunch_price).toLocaleString()} | Actual: ₦${Number(estate.actual_price).toLocaleString()}`;
  } else if (estate.actual_price) price = `₦${Number(estate.actual_price).toLocaleString()}`;

  return {
    id: estate.id,
    title: estate.name,
    location: estate.location || '',
    price,
    imageUrl: estate.media && estate.media.length > 0 ? estate.media[0] : '/placeholder.svg',
    propertyType: estate.type || 'Land',
    description: estate.description,
    property_category: estate.property_category || 'land',
  };
}

/** Hand-curated deep info for estates we have full company/terms copy for.
 *  Estates not in this list still get a real page - just without the extra
 *  company/terms tabs - rather than being blocked from having a page at all. */
const getEstateDetails = (propertyTitle: string) => {
  if (propertyTitle === 'Hampton Court Estate – Phase 3') {
    return {
      companyInfo: { name: 'BRIDGEFORT HOMES DEVELOPMENT LTD', rc: 'RC 7150756', address: 'Plot 117, W. O. Seriki Street, Eleganza Gardens Estate, VGC Bus Stop, Lekki-Epe Expressway, Ajah, Lagos State', vision: 'To make land and home ownership dream a reality for all and rebuilding the future of real estate services', awards: ['MOST IMPACTFUL CEO AWARD', 'UPCOMING REAL ESTATE FIRM OF THE YEAR', 'CUSTOMER SERVICE PROFESSIONAL OF THE YEAR', 'MOST SOLUTION DRIVEN COMPANY'], estates: ['Precious Gardens', 'Fortress Hills', 'Hampton Ville', 'Fountain Springs', 'The Ambassadors', 'Big League', 'Bridgefort Luxury', 'Olanma Gardens', 'Akuchi Luxury', 'Afaoma Estate Series', 'Hampton Court'] },
      location: 'Omilende Community, Via Edu Town, Agbara, Ogun State',
      coordinates: 'Represented on each survey plan',
      landmarks: ['Lagos - Badagry Expressway', 'Crown City Resort', 'Agbara Industrial Estate', 'Loral International Schools', 'Unilever Nigeria Plc', 'Nestle Nigeria Plc', 'Chinese Free Trade Zone', 'Crawford University', 'Opic Estate', 'Idioke Palace', 'Magistrate & High Court', 'Lagos State University College of Education'],
      plotSizes: [
        { size: '250sqm', dimensions: '60ft x 45ft', earlyBird: '₦750,000', actual: '₦850,000', instalment: '₦950,000', extended: '₦1,050,000' },
        { size: '500sqm', dimensions: '60ft x 90ft', earlyBird: '₦1,500,000', actual: '₦1,600,000', instalment: '₦1,800,000', extended: '₦2,000,000' },
      ],
      fees: { deedOfAssignment: '₦300,000 per plot', surveyPlan: '₦300,000 per plot', plotDemarcation: '₦100,000 per plot', plotMaintenance: '₦10,000 per plot (Monthly)' },
      specialFeatures: ['Corner-piece Plot attracts additional 10% of land cost', 'Commercial Plot attracts additional 10% of land cost', 'Good road network', 'Power & security infrastructure', 'Recreational facilities'],
    };
  }
  if (propertyTitle === 'Akuchi Luxury Estate') {
    return {
      companyInfo: { name: 'BRIDGEFORT HOMES DEVELOPMENT LTD', rc: 'RC 7150756', address: 'Plot 117, W. O. Seriki Street, Eleganza Gardens Estate, VGC Bus Stop, Lekki-Epe Expressway, Ajah, Lagos State', vision: 'To make land and home ownership dream a reality for all', awards: ['MOST IMPACTFUL CEO AWARD', 'UPCOMING REAL ESTATE FIRM OF THE YEAR'], estates: ['Precious Gardens', 'Fortress Hills', 'Hampton Ville', 'Fountain Springs', 'Akuchi Luxury'] },
      location: 'Ifite, Awka - Egbagu Road Community, Awka, Anambra State',
      coordinates: '6.280997, 7.114474',
      landmarks: ['NYSC Anambra Permanent Orientation Camp', 'Nnamdi Azikiwe University Back Gate', 'Wintess Garden Hotel & Suites', 'Government Reserved Area (GRA)'],
      plotSizes: [
        { size: '464sqm', dimensions: '50ft x 100ft', earlyBird: '₦7,500,000', actual: '₦10,000,000', instalment: '₦11,000,000', extended: '₦12,500,000' },
        { size: '232sqm', dimensions: '25ft x 100ft', earlyBird: '₦3,750,000', actual: '₦5,000,000', instalment: '₦5,500,000', extended: '₦6,250,000' },
      ],
      fees: { deedOfAssignment: '₦550,000 per plot', surveyPlan: '₦550,000 per plot', plotDemarcation: '₦120,000 per plot', plotMaintenance: '₦10,000 per plot (Monthly)' },
      specialFeatures: ['Corner-piece Plot attracts additional 10% of land cost', 'Commercial Plot attracts additional 10% of land cost'],
    };
  }
  return null;
};

const getPropertyPDF = (propertyTitle: string) => {
  switch (propertyTitle) {
    case 'Fortress Hills Estate': return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`;
    case 'Akuchi Luxury Estate': return `/lovable-uploads/SUB. FORM - AKUCHI LUX ESTATE, IFITE, AWKA.pdf`;
    case 'Fountain Springs Estate': return `/lovable-uploads/SUB. FORM - FOUNTAIN SPRINGS.pdf`;
    case 'Hampton Ville Estate': return `/lovable-uploads/SUBSCRIPTION FORM - HAMPTON VILLE PHASE 1 & 2.pdf`;
    default: return null;
  }
};

const isVideo = (url: string) => ['mp4', 'webm', 'ogg', 'mov'].includes(url.split('.').pop()?.toLowerCase() || '');

const EstateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useEcommerce();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [estateRow, setEstateRow] = useState<any>(null);
  const [property, setProperty] = useState<EstateProperty | null>(null);
  const [relatedEstates, setRelatedEstates] = useState<EstateProperty[]>([]);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [fullscreenMedia, setFullscreenMedia] = useState<string | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  usePropertyView(id || '', 'estate');

  useEffect(() => {
    if (user) checkProfileCompletion();
  }, [user]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    supabase.from('estate').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setEstateRow(data);
      const mapped = mapEstateRowToProperty(data);
      setProperty(mapped);

      // Related properties: same category, excluding this one
      supabase
        .from('estate')
        .select('*')
        .neq('id', id)
        .eq('property_category', data.property_category || 'land')
        .limit(4)
        .then(({ data: related }) => {
          setRelatedEstates((related || []).map(mapEstateRowToProperty));
        });

      setLoading(false);
    });
  }, [id]);

  const checkProfileCompletion = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('profiles').select('profile_completed').eq('id', user.id).single();
      if (!error && data) setProfileCompleted(data.profile_completed || false);
    } catch (error) {
      console.error('Error checking profile completion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-[88px] lg:pt-[104px]">
          <Loader2 className="h-8 w-8 animate-spin text-estate-blue" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-[88px] lg:pt-[104px] px-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Estate not found</h1>
          <p className="text-muted-foreground mb-6">This listing may have been removed or the link is incorrect.</p>
          <Button asChild>
            <Link to="/properties">Browse all properties</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const propertyImages: string[] = (estateRow?.media && estateRow.media.length > 0) ? estateRow.media : [property.imageUrl];
  const estateDetails = getEstateDetails(property.title);
  const propertyPDF = getPropertyPDF(property.title);
  const propertyDescription = property.description || '';

  const openFullscreenMedia = (url: string, index: number) => {
    setFullscreenMedia(url);
    setFullscreenIndex(index);
  };

  const navigateFullscreen = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (fullscreenIndex + 1) % propertyImages.length
      : (fullscreenIndex - 1 + propertyImages.length) % propertyImages.length;
    setFullscreenIndex(newIndex);
    setFullscreenMedia(propertyImages[newIndex]);
  };

  const handleDownload = () => {
    if (!propertyPDF) return;
    const link = document.createElement('a');
    link.href = propertyPDF;
    link.download = `${property.title}-subscription-form.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to add properties to cart.', variant: 'destructive' });
      return;
    }
    if (!profileCompleted) {
      toast({ title: 'Profile Incomplete', description: 'Please complete your profile before purchasing properties.', variant: 'destructive' });
      return;
    }
    const plot: Plot = {
      id: `${property.id}-plot-1`,
      propertyId: property.id,
      propertyName: property.title,
      location: property.location,
      pricePerPlot: parseFloat(property.price.replace(/[^0-9.]/g, '')) || 500000,
      plotNumber: 1,
      imageUrl: property.imageUrl,
      size: 500,
      propertyType: property.propertyType,
    };
    addToCart(plot, 1);
    toast({ title: 'Added to cart', description: `${property.title} has been added to your cart.` });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 pt-[88px] lg:pt-[104px]">
        {/* Header */}
        <div className="bg-estate-blue text-white">
          <div className="container-custom py-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-blue-100 hover:text-white text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-4">
              <Building2 size={28} className="shrink-0" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
                <p className="text-blue-100 flex items-center mt-1"><MapPin size={16} className="mr-1" />{property.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {propertyImages.map((media, index) => (
                        <CarouselItem key={index}>
                          <div
                            className="aspect-video w-full overflow-hidden rounded-lg cursor-pointer relative group"
                            onClick={() => openFullscreenMedia(media, index)}
                          >
                            {isVideo(media) ? (
                              <div className="relative w-full h-full bg-black flex items-center justify-center">
                                <video src={media} className="w-full h-full object-cover" muted />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                                  <Play className="h-12 w-12 text-white" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={media}
                                alt={`${property.title} view ${index + 1}`}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                className="w-full h-full object-cover transition-transform duration-500"
                              />
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {propertyImages.length > 1 && (<><CarouselPrevious /><CarouselNext /></>)}
                  </Carousel>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-estate-blue">Property Overview</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Type</Badge>
                      <span>{property.propertyType}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Price</Badge>
                      <span className="font-bold text-estate-red">{property.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="text-estate-blue" size={16} />
                    <span className="text-sm">Title: Survey Plan & Deed of Assignment</span>
                  </div>
                  {propertyDescription && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-estate-blue mb-2">Description</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{propertyDescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-estate-blue">Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2"><Phone size={16} className="text-estate-blue" /><span>+234 803 062 4059</span></div>
                  <div className="flex items-center space-x-2"><Mail size={16} className="text-estate-blue" /><span>info@bridgeforthomes.com</span></div>
                  <div className="bg-estate-blue/10 p-3 rounded-lg">
                    <p className="text-sm text-estate-red font-medium">Payment Details:</p>
                    <p className="text-sm">Zenith Bank - Bridgefort Homes Development Ltd</p>
                    <p className="text-sm">Account: 1312214947</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => setIsBookingOpen(true)} variant="outline" className="flex-1 gap-2">
                  <CalendarCheck className="h-4 w-4" /> Book Inspection
                </Button>
                {propertyPDF && (
                  <Button onClick={handleDownload} className="flex-1 bg-estate-blue hover:bg-estate-darkBlue text-white gap-2">
                    <Download className="h-4 w-4" /> Download Subscription Form
                  </Button>
                )}
                <Button onClick={handleAddToCart} className="flex-1 bg-estate-red hover:bg-red-600 text-white gap-2">
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {estateDetails ? (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pricing">Docs</TabsTrigger>
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Estate Location & Landmarks</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2"><MapIcon size={16} className="text-estate-blue" /><span>{estateDetails.location}</span></div>
                        <div className="text-sm text-gray-600">Coordinates: {estateDetails.coordinates}</div>
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Nearby Landmarks:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {estateDetails.landmarks.map((landmark, index) => (<li key={index}>{landmark}</li>))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Plot Sizes & Features</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {estateDetails.plotSizes.map((plot, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h4 className="font-semibold">{plot.size} ({plot.dimensions})</h4>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                <span>Early Bird: {plot.earlyBird}</span>
                                <span>Actual: {plot.actual}</span>
                                <span>Instalment: {plot.instalment}</span>
                                <span>Extended: {plot.extended}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Additional Fees</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between"><span>Deed of Assignment:</span><span className="font-semibold">{estateDetails.fees.deedOfAssignment}</span></div>
                          <div className="flex justify-between"><span>Survey Plan:</span><span className="font-semibold">{estateDetails.fees.surveyPlan}</span></div>
                          <div className="flex justify-between"><span>Plot Demarcation:</span><span className="font-semibold">{estateDetails.fees.plotDemarcation}</span></div>
                          <div className="flex justify-between"><span>Plot Maintenance:</span><span className="font-semibold">{estateDetails.fees.plotMaintenance}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Special Features</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          {estateDetails.specialFeatures.map((feature, index) => (<li key={index}>{feature}</li>))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="company" className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold">{estateDetails.companyInfo.name}</h4>
                          <p className="text-sm text-gray-600">{estateDetails.companyInfo.rc}</p>
                          <p className="text-sm mt-2">{estateDetails.companyInfo.address}</p>
                        </div>
                        <div><h4 className="font-semibold">Vision</h4><p className="text-sm">{estateDetails.companyInfo.vision}</p></div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Awards & Recognition</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {estateDetails.companyInfo.awards.map((award, index) => (<li key={index}>{award}</li>))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Our Estate Portfolio</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {estateDetails.companyInfo.estates.map((estate, index) => (<Badge key={index} variant="outline" className="text-xs">{estate}</Badge>))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="terms" className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Important Information</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <h4 className="font-semibold flex items-center"><Calendar size={16} className="mr-2" />Allocation Timeline</h4>
                          <p>Physical allocation within 3 months after payment completion and 50% primary infrastructure fee payment.</p>
                        </div>
                        <div>
                          <h4 className="font-semibold flex items-center"><Clock size={16} className="mr-2" />Development Timeline</h4>
                          <p>Evidence of active possession required within 6 months of allocation (at least fencing).</p>
                        </div>
                        <div><h4 className="font-semibold">Property Inspection</h4><p>Free inspections Monday-Saturday, 10am-1pm. Prior appointment required.</p></div>
                        <div><h4 className="font-semibold">Title</h4><p>FREEHOLD - Free from government acquisition and adverse claims.</p></div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Reviews & Ratings</CardTitle></CardHeader>
                      <CardContent>
                        <PropertyReviews propertyId={property.id} propertyType="estate" />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardHeader><CardTitle>Reviews & Ratings</CardTitle></CardHeader>
                  <CardContent>
                    <PropertyReviews propertyId={property.id} propertyType="estate" />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Related Properties */}
          {relatedEstates.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4">Related Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedEstates.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/properties/estates/${rel.id}`}
                    className="glass-card rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg block"
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      <img src={rel.imageUrl} alt={rel.title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate">{rel.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {rel.location}
                      </p>
                      <p className="text-sm font-bold text-estate-red mt-1">{rel.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Book Inspection dialog, pre-filled with this estate */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Inspection</DialogTitle>
          </DialogHeader>
          <InspectionBookingForm
            initialEstateName={property.title}
            onBookingCreated={() => setIsBookingOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Fullscreen Media Viewer */}
      <Dialog open={!!fullscreenMedia} onOpenChange={() => setFullscreenMedia(null)}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 bg-black/95 border-0">
          <div className="relative flex items-center justify-center h-[95vh]">
            <Button variant="ghost" size="icon" onClick={() => setFullscreenMedia(null)} className="absolute top-4 right-4 z-50 text-white hover:bg-white/20">
              <X size={24} />
            </Button>
            {propertyImages.length > 1 && (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigateFullscreen('prev')} className="absolute left-4 z-50 text-white hover:bg-white/20 h-12 w-12">
                  <ChevronLeft size={32} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigateFullscreen('next')} className="absolute right-4 z-50 text-white hover:bg-white/20 h-12 w-12">
                  <ChevronRight size={32} />
                </Button>
              </>
            )}
            {fullscreenMedia && isVideo(fullscreenMedia) ? (
              <video src={fullscreenMedia} controls autoPlay className="max-w-full max-h-full object-contain" />
            ) : (
              <img src={fullscreenMedia || ''} alt="Full view" className="max-w-full max-h-full object-contain" />
            )}
            {propertyImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {fullscreenIndex + 1} / {propertyImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstateDetails;
