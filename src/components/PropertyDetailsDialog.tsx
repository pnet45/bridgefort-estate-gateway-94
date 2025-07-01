import React, { useEffect, useState } from 'react';
import { Download, MapPin, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { AspectRatio } from './ui/aspect-ratio';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent } from "./ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { Link, useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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

const PropertyDetailsDialog = ({
  isOpen,
  onClose,
  property
}: PropertyDetailsDialogProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useEcommerce();
  const [profileCompleted, setProfileCompleted] = useState(false);

  // Check profile completion status
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
      navigate('/auth');
      return;
    }

    if (!profileCompleted) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before purchasing properties.",
        variant: "destructive"
      });
      navigate('/profile');
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
      case "Afaoma Castle Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`;
      case "Akuchi Luxury Estate":
        return `/lovable-uploads/SUB. FORM - AKUCHI LUX ESTATE, IFITE, AWKA.pdf`;
      case "Fountain Springs Estate":
        return `/lovable-uploads/SUB. FORM - FOUNTAIN SPRINGS.pdf`;
      case "Greenfield County":
        return `/lovable-uploads/GREENFIELDS FARMLAND ESTATE AGBARA .pdf`;
      case "Hampton Ville Estate":
        return `/lovable-uploads/SUBSCRIPTION FORM - HAMPTON VILLE PHASE 1 & 2.pdf`;
      case "Olanma Gardens":
        return `/lovable-uploads/SUB. FORM OLANMA GARDENS ESTATES OWERRI.pdf`;
      case "Ambassadors Estate":
        return `/lovable-uploads/SUB. FORM - AMBASSADORS ESTATE ODE-OMI.pdf`
      case "Precious Garden Estate":
        return `/lovable-uploads/SUB. FORM - PRECIOUS GARDENS SCHEME 2.pdf`;
      case "The Big League County":
        return `/lovable-uploads/SUBSCRIPTION FORM-THE BIG LEAGUE ESTATE SERIES, DELTA STATE.pdf`;
      case "The Big League Smart City":
        return `/lovable-uploads/SUB. FORM - THE BIG LEAGUE SMART CITY -PH.pdf`;
      case "The Big League Paradise":
        return `/lovable-uploads/SUBSCRIPTION FORM-THE BIG LEAGUE ESTATE SERIES, DELTA STATE.pdf`;
      case "The Big League Heaven":
        return `/lovable-uploads/SUBSCRIPTION FORM-THE BIG LEAGUE ESTATE SERIES, DELTA STATE.pdf`;
      case "Bridgefort County - Lagoon Front Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`;
      case "Bridgefort Biz Hub - Commercial Estate":
        return `/lovable-uploads/SUB. FORM - BRIDGEFORT BIZ HUB - COMMERCIAL.pdf`;
      default:
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`;
    }
  };

  const getPropertyImages = (propertyTitle: string) => {
    switch (propertyTitle) {
      case "Afaoma Castle Estate":
        return ["/lovable-uploads/0add771b-8dfc-41da-9ae6-6e80617172e1.png"];
      case "Akuchi Luxury Estate":
        return ["/lovable-uploads/fbb073b9-ed7e-4a53-bcb5-54c870b10b6f.png"];
      case "Fortress Hills Estate":
        return ["/lovable-uploads/b6b178d0-ae26-4527-9569-dce064d705b9.png"];
      case "Fountain Springs Estate":
        return ["/lovable-uploads/1b2d5941-995c-45f5-bd01-f28118b13bee.png"];
      case "Greenfield County":
        return ["/lovable-uploads/5ec8d74e-628c-4efc-8322-f98d4138140d.png"];
      case "Hampton Ville Estate":
        return ["/lovable-uploads/5f92d89a-e9fc-4c84-a49d-72cb376b8510.png"];
      case "Olanma Gardens":
        return ["/lovable-uploads/7da9692b-7a71-4551-9b99-db869f5f0ff7.png"];
      case "Ambassadors Estate":
        return ["/lovable-uploads/The Ambassadors.jpg"];
      case "Precious Garden Estate":
        return ["/lovable-uploads/5c033a2a-1e10-49b7-b7de-5b56e384b9d5.png"];
      case "The Big League County":
        return ["/lovable-uploads/6b46b80b-cf01-4da0-895e-6cdc9516a914.png"];
      case "The Big League Smart City":
        return ["/lovable-uploads/c17908c7-c813-490d-b6c2-a1423384caa6.png"];
      case "The Big League Paradise":
        return ["/lovable-uploads/5005f040-92cf-4bbe-b16f-6142896e97dd.png"];
      case "The Big League Heaven":
        return ["/lovable-uploads/e31d4e61-7436-4a63-a118-84656f87dd4c.png"];
      case "Bridgefort County - Lagoon Front Estate":
        return ["/lovable-uploads/Bridgefort County - Lagoon Front .jpg"];
      default:
        return [property.imageUrl];
    }
  };

  const propertyImages = getPropertyImages(property.title);

  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`p-0 gap-0 ${isMobile ? 'max-w-[95vw]' : 'max-w-6xl'}`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-[85vh]`}>
          {/* Image section */}
          <div className={`${isMobile ? 'w-full h-[40vh]' : 'w-1/2 h-full'}`}>
            <div className="h-full p-6 flex flex-col">
              <div className="flex-1 relative">
                <Carousel className="w-full h-full">
                  <CarouselContent className="h-full">
                    {propertyImages.map((img, index) => <CarouselItem key={index} className="h-full">
                        <div className="h-full w-full flex items-center justify-center">
                          <img src={img} alt={`${property.title} view ${index + 1}`} className="max-h-full max-w-full object-scale-down" />
                        </div>
                      </CarouselItem>)}
                  </CarouselContent>
                  {propertyImages.length > 1 && <>
                      <CarouselPrevious className="absolute left-2 z-10" />
                      <CarouselNext className="absolute right-2 z-10" />
                    </>}
                </Carousel>
              </div>
            </div>
          </div>

          <div className={`${isMobile ? 'w-full h-[45vh]' : 'w-1/2 h-full'} p-6 flex flex-col`}>
            <ScrollArea className="flex-grow pr-4 overflow-y-auto">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-estate-blue">{property.title} 🏡</h2>
                  <p className="text-lg md:text-xl font-medium">Exclusive Land Deals in {property.location}!</p>
                  
                  <div className="flex items-center gap-2 text-base md:text-lg">
                    <MapPin className="text-estate-blue" />
                    <p>{property.location}</p>
                  </div>
                  
                  <p className="font-medium">📜 Title: Survey Plan & Deed of Assignment</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl md:text-2xl font-bold text-estate-red mb-4">PRICE ALERT</h3>
                    <p className="text-lg md:text-xl font-bold">{property.price}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg md:text-xl font-semibold">WHY INVEST IN THIS PROPERTY?</h3>
                    <ul className="list-none space-y-2">
                      <li>✓ Rapidly Developing Area – Prime location with high appreciation potential.</li>
                      <li>✓ Secure Investment – Comes with Deed of Assignment & Survey Plan.</li>
                      <li>✓ Flexible Payment Plan – Invest with ease and grow your wealth effortlessly.</li>
                    </ul>
                  </div>

                  <div className="bg-estate-blue bg-opacity-5 p-4 rounded-lg space-y-4">
                    <p className="font-semibold text-zinc-50">📢 Don't Miss This Opportunity!</p>
                    <div>
                      <p className="font-medium text-zinc-50">📞 Call/WhatsApp: +2348030624059 For Further Inquiries & Site Inspection</p>
                      <p className="font-medium text-zinc-50">💳 Payments To: Zenith Bank – PWAN Bridgefort Estates & Investment Ltd</p>
                      <p className="font-medium text-zinc-50">Account Number: 1310762860</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            {/* Action buttons - Fixed at bottom */}
            <div className="mt-4 pt-2 border-t border-gray-100 space-y-3">
              <Button onClick={handleDownload} className="bg-estate-blue hover:bg-estate-darkBlue text-white w-full py-3">
                <Download className="mr-2" />
                Download Subscription Form
              </Button>
              
              <Button onClick={handleAddToCart} className="ecommerce-button text-white w-full py-3">
                <ShoppingCart className="mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};

export default PropertyDetailsDialog;
