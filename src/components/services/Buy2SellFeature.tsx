
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface Buy2SellFeatureProps {
  className?: string;
  showButtons?: boolean;
  showImages?: boolean;
}

const Buy2SellFeature = ({ 
  className = '', 
  showButtons = true,
  showImages = true 
}: Buy2SellFeatureProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`mb-12 overflow-hidden border-0 shadow-xl ${className}`}>
      <div className="bg-gradient-to-r from-estate-blue to-estate-darkBlue text-white">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className={`${showImages ? 'lg:w-2/3' : 'w-full'} mb-6 lg:mb-0`}>
              <div className="flex items-center mb-4">
                <Badge className="bg-estate-red hover:bg-estate-red text-white text-sm">Featured</Badge>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Your Path to Guaranteed Real Estate Returns</h2>
              <h3 className="text-xl mb-4">Introducing Buy To Sell</h3>
              
              <p className="mb-6">
                Buy2Sell simplifies real estate investment. Imagine earning substantial passive income 
                without the usual risks. With Buy2Sell, you can purchase property in our carefully 
                chosen estates, and we guarantee to facilitate a resale of your property within 12 months, 
                aiming for profits as high as 30%. Enjoy the peace of mind that comes with knowing your 
                income potential is locked in from day one.
              </p>
              
              {showButtons && (
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/buy2sell" 
                    className="bg-white text-estate-blue hover:bg-gray-100 px-6 py-2 rounded inline-flex items-center font-medium transition-colors"
                  >
                    Explore More <ArrowRight size={16} className="ml-2" />
                  </Link>
                  <Link 
                    to="/contact" 
                    className="bg-estate-red text-white hover:bg-red-700 px-6 py-2 rounded inline-flex items-center font-medium transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              )}

              {!showButtons && (
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-white text-estate-blue hover:bg-gray-100">
                    <Download className="mr-2" />
                    Download Brochure
                  </Button>
                </div>
              )}
            </div>
            
            {showImages && (
              <div className="lg:w-1/3 flex justify-center">
                <div className="relative">
                  <img 
                    src="/lovable-uploads/314674b2-9424-4c15-b9bd-a8ce97a6084d.png" 
                    alt="Buy2Sell Investment" 
                    className="rounded-lg shadow-lg max-w-full h-auto"
                  />
                  {!isMobile && (
                    <img 
                      src="/lovable-uploads/da0f7fae-fe5f-4f62-b34d-ff105d64271c.png"
                      alt="6 Month Investment"
                      className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full border-4 border-white shadow-lg"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default Buy2SellFeature;
