import React from 'react';
import { Download, MapPin } from 'lucide-react';
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
        return ["/lovable-uploads/d9abd176-c665-44e6-a85f-30c671c4a2db.png"];
      case "The Big League County":
        return ["/lovable-uploads/6b46b80b-cf01-4da0-895e-6cdc9516a914.png"];
      case "The Big League Smart City":
        return ["/lovable-uploads/c17908c7-c813-490d-b6c2-a1423384caa6.png"];
      case "The Big League Paradise":
        return ["/lovable-uploads/5005f040-92cf-4bbe-b16f-6142896e97dd.png"];
      case "The Big League Heaven":
        return ["/lovable-uploads/e31d4e61-7436-4a63-a118-84656f87dd4c.png"];
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
                      <p className="font-medium">📞 Call/WhatsApp: +2348030624059 For Further Inquiries & Site Inspection</p>
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
