
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
  const handleDownload = () => {
    // Create a sample PDF with property details
    const pdfUrl = `https://docs.google.com/document/d/1234/export?format=pdf`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${property.title}-details.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl p-0 gap-0">
        <div className="flex h-[80vh]">
          {/* Left side - Image */}
          <div className="w-1/2 h-full">
            <div className="h-full">
              <AspectRatio ratio={16/9}>
                <img 
                  src={property.imageUrl}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
          </div>

          {/* Right side - Scrollable Content */}
          <div className="w-1/2 p-6">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-estate-blue">{property.title} 🏡</h2>
                  <p className="text-xl font-medium">Exclusive Land Deals in {property.location}!</p>
                  
                  <div className="flex items-center gap-2 text-lg">
                    <MapPin className="text-estate-blue" />
                    <p>{property.location}</p>
                  </div>
                  
                  <p className="font-medium">📜 Title: Survey Plan & Deed</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-2xl font-bold text-estate-red mb-4">PRICE ALERT</h3>
                    <p className="text-xl font-bold">{property.price}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">WHY INVEST IN THIS PROPERTY?</h3>
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
                      <p className="font-medium">Account Number: 1310702860</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={handleDownload}
                      className="bg-estate-blue hover:bg-estate-darkBlue text-white w-full"
                    >
                      <Download className="mr-2" />
                      Download Property Details
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
