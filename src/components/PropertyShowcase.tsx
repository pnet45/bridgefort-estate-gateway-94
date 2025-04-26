
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { AspectRatio } from './ui/aspect-ratio';

const PropertyShowcase = () => {
  const handleDownload = () => {
    // Replace with actual PDF URL when available
    const pdfUrl = "/subscription-form.pdf";
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = "fortress-hills-subscription-form.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="container-custom py-16">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2">
          <div className="rounded-full overflow-hidden w-80 h-80 mx-auto border-4 border-estate-blue">
            <AspectRatio ratio={1}>
              <img 
                src="/lovable-uploads/731e5107-538f-41a5-9af8-5b864bd49831.png"
                alt="Fortress Hills Estate"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-estate-blue">Fortress Hills Estate</h2>
            <p className="text-xl">A Place of Refuge</p>
            <p className="text-lg font-semibold">Location: IMOTA-IKORODU, LAGOS</p>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-estate-red">PROMO PRICE</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">PHASE 1</p>
                  <p className="text-xl font-bold">₦4.0M</p>
                </div>
                <div>
                  <p className="font-semibold">PHASE 2</p>
                  <p className="text-xl font-bold">₦3.5M</p>
                </div>
              </div>
              <p className="text-lg font-semibold">500SQM</p>
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
    </section>
  );
};

export default PropertyShowcase;
