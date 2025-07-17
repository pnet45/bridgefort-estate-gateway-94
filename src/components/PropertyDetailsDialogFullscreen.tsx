import React, { useEffect, useState } from 'react';
import { Download, MapPin, ShoppingCart, X, Building2, Calendar, Phone, Mail, MapIcon, Clock, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent } from "./ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useEcommerce } from '@/contexts/ecommerce';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plot } from '@/contexts/ecommerce/types';

interface PropertyDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    location: string;
    price: string;
    imageUrl: string;
    propertyType: string;
  };
}

const PropertyDetailsDialogFullscreen = ({
  isOpen,
  onClose,
  property
}: PropertyDetailsDialogProps) => {
  const { user } = useAuth();
  const { addToCart } = useEcommerce();
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      checkProfileCompletion();
    }
  }, [user]);

  const checkProfileCompletion = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_completed')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setProfileCompleted(data.profile_completed || false);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    }
  };

  const handleDownload = () => {
    const pdfUrl = getPropertyPDF(property.title);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${property.title}-subscription-form.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add properties to cart.",
        variant: "destructive"
      });
      return;
    }

    if (!profileCompleted) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before purchasing properties.",
        variant: "destructive"
      });
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
      propertyType: property.propertyType
    };
    addToCart(plot, 1);
  };

  const getPropertyPDF = (propertyTitle: string) => {
    switch (propertyTitle) {
      case "Fortress Hills Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`;
      case "Akuchi Luxury Estate":
        return `/lovable-uploads/SUB. FORM - AKUCHI LUX ESTATE, IFITE, AWKA.pdf`;
      case "Fountain Springs Estate":
        return `/lovable-uploads/SUB. FORM - FOUNTAIN SPRINGS.pdf`;
      case "Hampton Ville Estate":
        return `/lovable-uploads/SUBSCRIPTION FORM - HAMPTON VILLE PHASE 1 & 2.pdf`;
      default:
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`;
    }
  };

  const getPropertyImages = (propertyTitle: string) => {
    switch (propertyTitle) {
      case "Akuchi Luxury Estate":
        return ["/lovable-uploads/fbb073b9-ed7e-4a53-bcb5-54c870b10b6f.png"];
      case "Fortress Hills Estate":
        return ["/lovable-uploads/b6b178d0-ae26-4527-9569-dce064d705b9.png"];
      default:
        return [property.imageUrl];
    }
  };

  const getEstateDetails = (propertyTitle: string) => {
    if (propertyTitle === "Akuchi Luxury Estate") {
      return {
        companyInfo: {
          name: "PWAN BRIDGEFORT ESTATES & INVESTMENT LTD",
          rc: "RC 7150756",
          address: "Plot 117, W. O. Seriki Street, Eleganza Gardens Estate, VGC Bus Stop, Lekki-Epe Expressway, Ajah, Lagos State",
          vision: "To make land and home ownership dream a reality for all and rebuilding the future of real estate services",
          awards: ["MOST IMPACTFUL CEO AWARD", "UPCOMING REAL ESTATE FIRM OF THE YEAR", "CUSTOMER SERVICE PROFESSIONAL OF THE YEAR", "MOST SOLUTION DRIVEN COMPANY"],
          estates: ["Precious Gardens", "Fortress Hills", "Hampton Ville", "Fountain Springs", "The Ambassadors", "Big League", "Bridgefort Luxury", "Olanma Gardens", "Akuchi Luxury", "Afaoma Estate Series"]
        },
        location: "Ifite, Awka - Egbagu Road Community, Awka, Anambra State",
        coordinates: "6.280997, 7.114474",
        landmarks: [
          "NYSC Anambra Permanent Orientation Camp",
          "Nnamdi Azikiwe University Back Gate", 
          "Wintess Garden Hotel & Suites",
          "Government Reserved Area (GRA)",
          "VIP Lodge",
          "Ngozika Housing Estate"
        ],
        plotSizes: [
          { size: "464sqm", dimensions: "50ft x 100ft", earlyBird: "₦7,500,000", actual: "₦10,000,000", instalment: "₦11,000,000", extended: "₦12,500,000" },
          { size: "232sqm", dimensions: "25ft x 100ft", earlyBird: "₦3,750,000", actual: "₦5,000,000", instalment: "₦5,500,000", extended: "₦6,250,000" }
        ],
        fees: {
          deedOfAssignment: "₦550,000 per plot",
          surveyPlan: "₦550,000 per plot (₦1,000,000 for Corporate Entity)",
          plotDemarcation: "₦120,000 per plot",
          plotMaintenance: "₦10,000 per plot (Monthly, ₦120,000 annually to be paid upfront after allocation)"
        },
        specialFeatures: [
          "Corner-piece Plot attracts additional 10% of land cost",
          "Commercial Plot attracts additional 10% of land cost",
          "Standard Special Plots: Additional 50% of plot price",
          "VIP Special Plots: Additional 75% of plot price"
        ]
      };
    }
    return null;
  };

  const propertyImages = getPropertyImages(property.title);
  const estateDetails = getEstateDetails(property.title);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-[95vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-estate-blue text-white">
            <div className="flex items-center space-x-4">
              <Building2 size={24} />
              <div>
                <h1 className="text-2xl font-bold">{property.title}</h1>
                <p className="text-blue-100 flex items-center">
                  <MapPin size={16} className="mr-1" />
                  {property.location}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X size={24} />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Left Column - Images and Basic Info */}
                <div className="space-y-6">
                  {/* Image Carousel */}
                  <Card>
                    <CardContent className="p-6">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {propertyImages.map((img, index) => (
                            <CarouselItem key={index}>
                              <div className="aspect-video w-full overflow-hidden rounded-lg">
                                <img 
                                  src={img} 
                                  alt={`${property.title} view ${index + 1}`} 
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {propertyImages.length > 1 && (
                          <>
                            <CarouselPrevious />
                            <CarouselNext />
                          </>
                        )}
                      </Carousel>
                    </CardContent>
                  </Card>

                  {/* Quick Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-estate-blue">Property Overview</CardTitle>
                    </CardHeader>
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
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-estate-blue">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-estate-blue" />
                        <span>+234 803 062 4059</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail size={16} className="text-estate-blue" />
                        <span>info@pwanbridgefort.ng</span>
                      </div>
                      <div className="bg-estate-blue/10 p-3 rounded-lg">
                        <p className="text-sm text-color-estate-red font-medium ">Payment Details:</p>
                        <p className="text-sm">Zenith Bank - PWAN Bridgefort Estates & Investment Ltd</p>
                        <p className="text-sm">Account: 1310762860</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="space-y-6">
                  {estateDetails ? (
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="pricing">Documentations</TabsTrigger>
                        <TabsTrigger value="company">Company</TabsTrigger>
                        <TabsTrigger value="terms">Terms</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Estate Location & Landmarks</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <MapIcon size={16} className="text-estate-blue" />
                              <span>{estateDetails.location}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Coordinates: {estateDetails.coordinates}
                            </div>
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2">Nearby Landmarks:</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {estateDetails.landmarks.map((landmark, index) => (
                                  <li key={index}>{landmark}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Plot Sizes & Features</CardTitle>
                          </CardHeader>
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
                          <CardHeader>
                            <CardTitle>Additional Fees</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 gap-3">
                              <div className="flex justify-between">
                                <span>Deed of Assignment:</span>
                                <span className="font-semibold">{estateDetails.fees.deedOfAssignment}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Survey Plan:</span>
                                <span className="font-semibold">{estateDetails.fees.surveyPlan}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Plot Demarcation:</span>
                                <span className="font-semibold">{estateDetails.fees.plotDemarcation}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Plot Maintenance (Annual):</span>
                                <span className="font-semibold">{estateDetails.fees.plotMaintenance}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Special Features</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-sm">
                              {estateDetails.specialFeatures.map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="company" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-semibold">{estateDetails.companyInfo.name}</h4>
                              <p className="text-sm text-gray-600">{estateDetails.companyInfo.rc}</p>
                              <p className="text-sm mt-2">{estateDetails.companyInfo.address}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Vision</h4>
                              <p className="text-sm">{estateDetails.companyInfo.vision}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Awards & Recognition</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {estateDetails.companyInfo.awards.map((award, index) => (
                                <li key={index}>{award}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Our Estate Portfolio</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                              {estateDetails.companyInfo.estates.map((estate, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {estate}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="terms" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Important Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div>
                              <h4 className="font-semibold flex items-center">
                                <Calendar size={16} className="mr-2" />
                                Allocation Timeline
                              </h4>
                              <p>Physical allocation within 3 months after payment completion and 50% primary infrastructure fee payment.</p>
                            </div>
                            <div>
                              <h4 className="font-semibold flex items-center">
                                <Clock size={16} className="mr-2" />
                                Development Timeline
                              </h4>
                              <p>Evidence of active possession required within 6 months of allocation (at least fencing).</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Property Inspection</h4>
                              <p>Free inspections Monday-Saturday, 10am-1pm. Prior appointment required.</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Title</h4>
                              <p>FREEHOLD - Free from government acquisition and adverse claims.</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Property Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Detailed information for this property will be available soon.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Footer Actions */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleDownload} 
                className="bg-estate-blue hover:bg-estate-darkBlue text-white px-8 py-3"
              >
                <Download className="mr-2" size={16} />
                Download Subscription Form
              </Button>
              
              <Button 
                onClick={handleAddToCart} 
                className="bg-estate-red hover:bg-red-600 text-white px-8 py-3"
              >
                <ShoppingCart className="mr-2" size={16} />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialogFullscreen;