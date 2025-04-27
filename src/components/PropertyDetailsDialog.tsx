
import React from 'react';
import { Download, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { AspectRatio } from './ui/aspect-ratio';
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
    // Replace with actual PDF URL when available
    const pdfUrl = "/subscription-form.pdf";
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = "property-subscription-form.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <div className="flex flex-col gap-8">
          <div className="w-full">
            <div className="rounded-xl overflow-hidden border-4 border-estate-blue w-full">
              <AspectRatio ratio={16/9}>
                <img 
                  src={property.imageUrl}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
          </div>
          
          <div className="space-y-8">
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
                  className="bg-estate-blue hover:bg-estate-darkBlue text-white w-full md:w-auto"
                >
                  <Download className="mr-2" />
                  Download Subscription Form
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsDialog;
