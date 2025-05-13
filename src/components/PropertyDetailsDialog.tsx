import React from 'react';
import { Download, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { AspectRatio } from './ui/aspect-ratio';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "./ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
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
    // Get the appropriate PDF for each property
    const pdfUrl = getPropertyPDF(property.title);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${property.title}-subscription-form.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to get the appropriate PDF for each property
  const getPropertyPDF = (propertyTitle: string) => {
    switch(propertyTitle) {
      case "Fortress Hills Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`;
      case "Afaoma Castle Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "Akuchi Luxury Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "Fountain Springs Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "Greenfield County":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "Hampton Ville Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "Olanma Gardens":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "Precious Gardens Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "The Big League County":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "The Big League Smart City":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "The Big League Paradise":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "The Big League Heaven":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      case "Bridgefort County - Lagoon Front Estate":
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`; // Replace with actual PDF when available
      default:
        return `/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf`;
    }
  };

  const getPropertyImages = (propertyTitle: string) => {
    switch(propertyTitle) {
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
      case "Precious Gardens Estate":
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
        return ["/lovable-uploads/5ec8d74e-628c-4efc-8322-f98d4138140d.png"]; // Using similar image for now
      default:
        return [property.imageUrl];
    }
  };

  const propertyImages = getPropertyImages(property.title);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={`p-0 gap-0 ${isMobile ? 'max-w-[95vw]' : 'max-w-6xl'}`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-[80vh]`}>
          {/* Image section */}
          <div className={`${isMobile ? 'w-full h-[35vh]' : 'w-1/2 h-full'}`}>
            <div className="h-full p-6 flex flex-col">
              <div className="flex-1 relative">
                <Carousel className="w-full h-full">
                  <CarouselContent className="h-full">
                    {propertyImages.map((img, index) => (
                      <CarouselItem key={index} className="h-full">
                        <div className="h-full w-full flex items-center justify-center">
                          <img 
                            src={img}
                            alt={`${property.title} view ${index + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {propertyImages.length > 1 && (
                    <>
                      <CarouselPrevious className="absolute left-2 z-10" />
                      <CarouselNext className="absolute right-2 z-10" />
                    </>
                  )}
                </Carousel>
              </div>
            </div>
          </div>

          <div className={`${isMobile ? 'w-full h-[45vh]' : 'w-1/2'} p-6`}>
            <ScrollArea className="h-full pr-4">
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
                    <p className="font-semibold">📢 Don't Miss This Opportunity!</p>
                    <div>
                      <p className="font-medium">📞 Call/WhatsApp: +2348030624059 For Further Inquiries & Site Inspection</p>
                      <p className="font-medium">💳 Payments To: Zenith Bank – PWAN Bridgefort Estates & Investment Ltd</p>
                      <p className="font-medium">Account Number: 1310762860</p>
                    </div>
                  </div>
                  
                  {/* Download button for mobile - placed here instead of with the image */}
                  {isMobile && (
                    <div className="pt-4 pb-8">
                      <Button 
                        onClick={handleDownload}
                        className="bg-estate-blue hover:bg-estate-darkBlue text-white w-full"
                      >
                        <Download className="mr-2" />
                        Download Subscription Form
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            
            {/* Download button for desktop */}
            {!isMobile && (
              <div className="mt-4">
                <Button 
                  onClick={handleDownload}
                  className="bg-estate-blue hover:bg-estate-darkBlue text-white w-full"
                >
                  <Download className="mr-2" />
                  Download Subscription Form
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialog;
