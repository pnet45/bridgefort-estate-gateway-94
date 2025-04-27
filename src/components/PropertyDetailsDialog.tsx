import React, { useState } from 'react';
import { Download, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { AspectRatio } from './ui/aspect-ratio';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PropertyDetailsDialogProps {
  property: {
    id: string;
    title: string;
    location: string;
    price: string;
    imageUrl: string;
    propertyType: string;
  };
  children: React.ReactNode;
}

const PropertyDetailsDialog = ({ property, children }: PropertyDetailsDialogProps) => {
  const isMobile = useIsMobile();
  
  const handleDownload = () => {
    // Create a sample PDF with property details
    const pdfUrl = `https://docs.google.com/document/d/1234/export?format=pdf`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${property.title}-subscription-form.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Multiple images for the property
  const propertyImages = property.title === "Fortress Hills Estate" 
    ? [
        "/lovable-uploads/f79aaed2-c246-4c4d-8b88-8c601683c0d1.png",
        "/lovable-uploads/731e5107-538f-41a5-9af8-5b864bd49831.png",
        "/lovable-uploads/c38e476b-49df-4b14-a2e9-d78048192d53.png",
        "/lovable-uploads/ba3b8490-e83f-477b-b729-b617da515b2c.png"
      ]
    : [property.imageUrl];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={`p-0 gap-0 ${isMobile ? 'max-w-[95vw]' : 'max-w-6xl'}`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-[80vh]`}>
          {/* Left side - Image Carousel */}
          <div className={`${isMobile ? 'w-full h-[40vh]' : 'w-1/2 h-full'} relative`}>
            <Carousel className="w-full h-full">
              <CarouselContent className="h-full">
                {propertyImages.map((img, index) => (
                  <CarouselItem key={index} className="h-full">
                    <AspectRatio ratio={isMobile ? 16/9 : 4/3} className="h-full">
                      <img 
                        src={img}
                        alt={`${property.title} view ${index + 1}`}
                        className="object-contain w-full h-full"
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {propertyImages.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-4 z-10" />
                  <CarouselNext className="absolute right-4 z-10" />
                </>
              )}
            </Carousel>
          </div>

          {/* Right side - Scrollable Content */}
          <div className={`${isMobile ? 'w-full h-[40vh]' : 'w-1/2'} p-6`}>
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-estate-blue">{property.title} 🏡</h2>
                  <p className="text-lg md:text-xl font-medium">Exclusive Land Deals in {property.location}!</p>
                  
                  <div className="flex items-center gap-2 text-base md:text-lg">
                    <MapPin className="text-estate-blue" />
                    <p>{property.location}</p>
                  </div>
                  
                  <p className="font-medium">📜 Title: Survey Plan & Deed</p>
                  
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
                    <p className="font-semibold">📢 Don't Miss This Opportunity!</p>
                    <div>
                      <p className="font-medium">📞 Call/WhatsApp: For Further Inquiries & Site Inspection</p>
                      <p className="font-medium">💳 Payments To: Zenith Bank – PWAN Bridgefort Estates & Investment Ltd</p>
                      <p className="font-medium">Account Number: 1310762860</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={handleDownload}
                      className="bg-estate-blue hover:bg-estate-darkBlue text-white w-full"
                    >
                      <Download className="mr-2" />
                      Download Subscription Form
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialog;
